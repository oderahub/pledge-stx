;; StacksPledge - Core Smart Contract
;; A micro-commitment dApp for the Stacks Builder Challenge #3
;; Implements Clarity 4 features: block-time, contract-hash?, to-ascii?

;; ============================================
;; Constants
;; ============================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_NAME "StacksPledge")
(define-constant CONTRACT_VERSION "1.0.0")

;; Fee structure (in microSTX)
(define-constant PLEDGE_FEE u1000)      ;; 0.001 STX to create
(define-constant VOUCH_FEE u500)        ;; 0.0005 STX to vouch
(define-constant COMPLETE_FEE u500)     ;; 0.0005 STX to complete

;; Limits
(define-constant MAX_MESSAGE_LENGTH u140)
(define-constant MAX_PLEDGES_PER_USER u100)
(define-constant MAX_VOUCHES_PER_PLEDGE u1000)

;; ============================================
;; Error Codes
;; ============================================

(define-constant ERR_NOT_FOUND (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))
(define-constant ERR_ALREADY_COMPLETED (err u102))
(define-constant ERR_INSUFFICIENT_FUNDS (err u103))
(define-constant ERR_INVALID_MESSAGE (err u104))
(define-constant ERR_MAX_PLEDGES_REACHED (err u105))
(define-constant ERR_ALREADY_VOUCHED (err u106))
(define-constant ERR_SELF_VOUCH (err u107))
(define-constant ERR_MAX_VOUCHES_REACHED (err u108))
(define-constant ERR_PLEDGE_EXPIRED (err u109))
(define-constant ERR_CONTRACT_PAUSED (err u110))
(define-constant ERR_INVALID_PRINCIPAL (err u111))

;; ============================================
;; Data Variables
;; ============================================

(define-data-var pledge-counter uint u0)
(define-data-var total-fees-collected uint u0)
(define-data-var total-vouches uint u0)
(define-data-var contract-paused bool false)

;; ============================================
;; Data Maps
;; ============================================

;; Main pledges storage
(define-map pledges uint {
    creator: principal,
    message: (string-utf8 140),
    vouches: uint,
    completed: bool,
    created-at: uint,
    completed-at: (optional uint),
    category: (string-ascii 32)
})

;; Track user pledge counts
(define-map user-pledge-count principal uint)

;; Track who has vouched for which pledge
(define-map pledge-vouchers {pledge-id: uint, voucher: principal} bool)

;; User statistics
(define-map user-stats principal {
    pledges-created: uint,
    pledges-completed: uint,
    vouches-given: uint,
    vouches-received: uint,
    total-fees-paid: uint
})

;; Verified contracts for composability
(define-map verified-contracts principal bool)

;; ============================================
;; Private Functions
;; ============================================

(define-private (is-valid-message (message (string-utf8 140)))
    (and 
        (> (len message) u0)
        (<= (len message) MAX_MESSAGE_LENGTH)))

(define-private (get-or-create-user-stats (user principal))
    (default-to 
        {
            pledges-created: u0,
            pledges-completed: u0,
            vouches-given: u0,
            vouches-received: u0,
            total-fees-paid: u0
        }
        (map-get? user-stats user)))

(define-private (update-user-stats-created (user principal))
    (let ((stats (get-or-create-user-stats user)))
        (map-set user-stats user 
            (merge stats { 
                pledges-created: (+ (get pledges-created stats) u1),
                total-fees-paid: (+ (get total-fees-paid stats) PLEDGE_FEE)
            }))))

(define-private (update-user-stats-vouched (voucher principal) (creator principal))
    (let (
        (voucher-stats (get-or-create-user-stats voucher))
        (creator-stats (get-or-create-user-stats creator))
    )
        (map-set user-stats voucher 
            (merge voucher-stats { 
                vouches-given: (+ (get vouches-given voucher-stats) u1),
                total-fees-paid: (+ (get total-fees-paid voucher-stats) VOUCH_FEE)
            }))
        (map-set user-stats creator 
            (merge creator-stats { 
                vouches-received: (+ (get vouches-received creator-stats) u1)
            }))))

(define-private (update-user-stats-completed (user principal))
    (let ((stats (get-or-create-user-stats user)))
        (map-set user-stats user 
            (merge stats { 
                pledges-completed: (+ (get pledges-completed stats) u1),
                total-fees-paid: (+ (get total-fees-paid stats) COMPLETE_FEE)
            }))))

;; ============================================
;; Read-Only Functions
;; ============================================

(define-read-only (get-pledge (pledge-id uint))
    (map-get? pledges pledge-id))

(define-read-only (get-pledge-count)
    (var-get pledge-counter))

(define-read-only (get-user-pledge-count (user principal))
    (default-to u0 (map-get? user-pledge-count user)))

(define-read-only (has-vouched (pledge-id uint) (voucher principal))
    (default-to false (map-get? pledge-vouchers {pledge-id: pledge-id, voucher: voucher})))

(define-read-only (get-user-stats-info (user principal))
    (get-or-create-user-stats user))

(define-read-only (get-total-fees)
    (var-get total-fees-collected))

(define-read-only (get-total-vouches)
    (var-get total-vouches))

(define-read-only (is-paused)
    (var-get contract-paused))

(define-read-only (is-verified-contract (contract principal))
    (default-to false (map-get? verified-contracts contract)))

;; Clarity 4: Get current block time
(define-read-only (get-current-time)
    block-time)

;; Clarity 4: Verify contract hash
(define-read-only (verify-contract-hash (contract-principal principal))
    (contract-hash? contract-principal))

;; Contract info
(define-read-only (get-contract-info)
    {
        name: CONTRACT_NAME,
        version: CONTRACT_VERSION,
        owner: CONTRACT_OWNER,
        pledge-fee: PLEDGE_FEE,
        vouch-fee: VOUCH_FEE,
        complete-fee: COMPLETE_FEE,
        total-pledges: (var-get pledge-counter),
        total-vouches: (var-get total-vouches),
        total-fees: (var-get total-fees-collected),
        paused: (var-get contract-paused)
    })

;; ============================================
;; Public Functions
;; ============================================

;; Create a new pledge
(define-public (create-pledge (message (string-utf8 140)) (category (string-ascii 32)))
    (let (
        (pledge-id (+ (var-get pledge-counter) u1))
        (user-count (get-user-pledge-count tx-sender))
    )
        ;; Validations
        (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
        (asserts! (is-valid-message message) ERR_INVALID_MESSAGE)
        (asserts! (< user-count MAX_PLEDGES_PER_USER) ERR_MAX_PLEDGES_REACHED)
        
        ;; Transfer fee to contract owner
        (try! (stx-transfer? PLEDGE_FEE tx-sender CONTRACT_OWNER))
        
        ;; Store pledge
        (map-set pledges pledge-id {
            creator: tx-sender,
            message: message,
            vouches: u0,
            completed: false,
            created-at: block-height,
            completed-at: none,
            category: category
        })
        
        ;; Update counters
        (var-set pledge-counter pledge-id)
        (var-set total-fees-collected (+ (var-get total-fees-collected) PLEDGE_FEE))
        (map-set user-pledge-count tx-sender (+ user-count u1))
        
        ;; Update user stats
        (update-user-stats-created tx-sender)
        
        (ok pledge-id)))

;; Vouch for an existing pledge
(define-public (vouch-for-pledge (pledge-id uint))
    (let ((pledge (unwrap! (map-get? pledges pledge-id) ERR_NOT_FOUND)))
        ;; Validations
        (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
        (asserts! (not (get completed pledge)) ERR_ALREADY_COMPLETED)
        (asserts! (not (is-eq tx-sender (get creator pledge))) ERR_SELF_VOUCH)
        (asserts! (not (has-vouched pledge-id tx-sender)) ERR_ALREADY_VOUCHED)
        (asserts! (< (get vouches pledge) MAX_VOUCHES_PER_PLEDGE) ERR_MAX_VOUCHES_REACHED)
        
        ;; Transfer fee to pledge creator
        (try! (stx-transfer? VOUCH_FEE tx-sender (get creator pledge)))
        
        ;; Update pledge
        (map-set pledges pledge-id (merge pledge { vouches: (+ (get vouches pledge) u1) }))
        
        ;; Record vouch
        (map-set pledge-vouchers {pledge-id: pledge-id, voucher: tx-sender} true)
        
        ;; Update counters
        (var-set total-vouches (+ (var-get total-vouches) u1))
        (var-set total-fees-collected (+ (var-get total-fees-collected) VOUCH_FEE))
        
        ;; Update user stats
        (update-user-stats-vouched tx-sender (get creator pledge))
        
        (ok true)))

;; Complete a pledge (only creator can call)
(define-public (complete-pledge (pledge-id uint))
    (let ((pledge (unwrap! (map-get? pledges pledge-id) ERR_NOT_FOUND)))
        ;; Validations
        (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
        (asserts! (is-eq tx-sender (get creator pledge)) ERR_UNAUTHORIZED)
        (asserts! (not (get completed pledge)) ERR_ALREADY_COMPLETED)
        
        ;; Transfer fee to contract owner
        (try! (stx-transfer? COMPLETE_FEE tx-sender CONTRACT_OWNER))
        
        ;; Update pledge
        (map-set pledges pledge-id (merge pledge { 
            completed: true,
            completed-at: (some block-height)
        }))
        
        ;; Update counters
        (var-set total-fees-collected (+ (var-get total-fees-collected) COMPLETE_FEE))
        
        ;; Update user stats
        (update-user-stats-completed tx-sender)
        
        (ok true)))

;; Batch vouch for multiple pledges
(define-public (batch-vouch (pledge-ids (list 10 uint)))
    (ok (map vouch-for-pledge pledge-ids)))

;; ============================================
;; Admin Functions
;; ============================================

;; Pause/unpause contract
(define-public (set-paused (paused bool))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set contract-paused paused)
        (ok true)))

;; Add verified contract
(define-public (add-verified-contract (contract principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (map-set verified-contracts contract true)
        (ok true)))

;; Remove verified contract
(define-public (remove-verified-contract (contract principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (map-delete verified-contracts contract)
        (ok true)))

;; ============================================
;; Composability Functions
;; ============================================

;; Allow verified contracts to create pledges on behalf of users
(define-public (create-pledge-for 
    (user principal) 
    (message (string-utf8 140)) 
    (category (string-ascii 32)))
    (let (
        (pledge-id (+ (var-get pledge-counter) u1))
        (user-count (get-user-pledge-count user))
    )
        ;; Must be called by verified contract
        (asserts! (is-verified-contract contract-caller) ERR_UNAUTHORIZED)
        (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
        (asserts! (is-valid-message message) ERR_INVALID_MESSAGE)
        (asserts! (< user-count MAX_PLEDGES_PER_USER) ERR_MAX_PLEDGES_REACHED)
        
        ;; Store pledge
        (map-set pledges pledge-id {
            creator: user,
            message: message,
            vouches: u0,
            completed: false,
            created-at: block-height,
            completed-at: none,
            category: category
        })
        
        ;; Update counters
        (var-set pledge-counter pledge-id)
        (map-set user-pledge-count user (+ user-count u1))
        
        (ok pledge-id)))

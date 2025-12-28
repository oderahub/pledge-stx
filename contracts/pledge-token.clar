;; Pledge Token - SIP-010 Fungible Token
;; Reward token for StacksPledge ecosystem

;; ============================================
;; Token Constants
;; ============================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_NAME "StacksPledge Token")
(define-constant TOKEN_SYMBOL "PLEDGE")
(define-constant TOKEN_DECIMALS u6)
(define-constant TOKEN_URI (some u"https://stackspledge.io/token-metadata.json"))

;; Reward amounts (with 6 decimals)
(define-constant REWARD_CREATE u1000000)     ;; 1 PLEDGE for creating
(define-constant REWARD_COMPLETE u5000000)   ;; 5 PLEDGE for completing
(define-constant REWARD_VOUCH u100000)       ;; 0.1 PLEDGE for vouching

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u1000))
(define-constant ERR_INSUFFICIENT_BALANCE (err u1001))
(define-constant ERR_INVALID_AMOUNT (err u1002))
(define-constant ERR_SAME_SENDER_RECIPIENT (err u1003))
(define-constant ERR_NOT_TOKEN_OWNER (err u1004))

;; ============================================
;; Data Variables
;; ============================================

(define-data-var total-supply uint u0)
(define-data-var minting-enabled bool true)

;; ============================================
;; Data Maps
;; ============================================

(define-map balances principal uint)
(define-map allowances {owner: principal, spender: principal} uint)
(define-map authorized-minters principal bool)

;; ============================================
;; SIP-010 Read-Only Functions
;; ============================================

(define-read-only (get-name)
    (ok TOKEN_NAME))

(define-read-only (get-symbol)
    (ok TOKEN_SYMBOL))

(define-read-only (get-decimals)
    (ok TOKEN_DECIMALS))

(define-read-only (get-token-uri)
    (ok TOKEN_URI))

(define-read-only (get-total-supply)
    (ok (var-get total-supply)))

(define-read-only (get-balance (account principal))
    (ok (default-to u0 (map-get? balances account))))

;; ============================================
;; SIP-010 Transfer Function
;; ============================================

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        ;; Validations
        (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        (asserts! (not (is-eq sender recipient)) ERR_SAME_SENDER_RECIPIENT)
        
        (let ((sender-balance (default-to u0 (map-get? balances sender))))
            (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
            
            ;; Update balances
            (map-set balances sender (- sender-balance amount))
            (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
            
            ;; Print memo if provided
            (match memo
                memo-value (begin (print memo-value) true)
                true)
            
            (ok true))))

;; ============================================
;; Allowance Functions
;; ============================================

(define-read-only (get-allowance (owner principal) (spender principal))
    (ok (default-to u0 (map-get? allowances {owner: owner, spender: spender}))))

(define-public (approve (spender principal) (amount uint))
    (begin
        (map-set allowances {owner: tx-sender, spender: spender} amount)
        (ok true)))

(define-public (transfer-from (amount uint) (sender principal) (recipient principal))
    (let (
        (current-allowance (default-to u0 (map-get? allowances {owner: sender, spender: tx-sender})))
        (sender-balance (default-to u0 (map-get? balances sender)))
    )
        ;; Validations
        (asserts! (>= current-allowance amount) ERR_UNAUTHORIZED)
        (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        
        ;; Update allowance
        (map-set allowances {owner: sender, spender: tx-sender} (- current-allowance amount))
        
        ;; Update balances
        (map-set balances sender (- sender-balance amount))
        (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
        
        (ok true)))

;; ============================================
;; Minting Functions
;; ============================================

(define-read-only (is-minter (account principal))
    (or 
        (is-eq account CONTRACT_OWNER)
        (default-to false (map-get? authorized-minters account))))

(define-public (mint (amount uint) (recipient principal))
    (begin
        (asserts! (is-minter tx-sender) ERR_UNAUTHORIZED)
        (asserts! (var-get minting-enabled) ERR_UNAUTHORIZED)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        
        ;; Update balance and supply
        (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
        (var-set total-supply (+ (var-get total-supply) amount))
        
        (ok true)))

;; ============================================
;; Burn Function
;; ============================================

(define-public (burn (amount uint))
    (let ((sender-balance (default-to u0 (map-get? balances tx-sender))))
        (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        
        ;; Update balance and supply
        (map-set balances tx-sender (- sender-balance amount))
        (var-set total-supply (- (var-get total-supply) amount))
        
        (ok true)))

;; ============================================
;; Reward Functions (for pledge contract integration)
;; ============================================

(define-public (reward-pledge-created (recipient principal))
    (begin
        (asserts! (is-minter contract-caller) ERR_UNAUTHORIZED)
        (try! (mint REWARD_CREATE recipient))
        (ok REWARD_CREATE)))

(define-public (reward-pledge-completed (recipient principal))
    (begin
        (asserts! (is-minter contract-caller) ERR_UNAUTHORIZED)
        (try! (mint REWARD_COMPLETE recipient))
        (ok REWARD_COMPLETE)))

(define-public (reward-vouch (recipient principal))
    (begin
        (asserts! (is-minter contract-caller) ERR_UNAUTHORIZED)
        (try! (mint REWARD_VOUCH recipient))
        (ok REWARD_VOUCH)))

;; ============================================
;; Admin Functions
;; ============================================

(define-public (add-minter (minter principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (map-set authorized-minters minter true)
        (ok true)))

(define-public (remove-minter (minter principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (map-delete authorized-minters minter)
        (ok true)))

(define-public (set-minting-enabled (enabled bool))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set minting-enabled enabled)
        (ok true)))

(define-read-only (is-minting-enabled)
    (var-get minting-enabled))

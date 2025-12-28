;; Pledge Trait Interface
;; Defines interfaces for StacksPledge contract composability

;; ============================================
;; Main Pledge Trait
;; ============================================

(define-trait pledge-trait
    (
        ;; Create a new pledge
        (create-pledge ((string-utf8 140) (string-ascii 32)) (response uint uint))
        
        ;; Vouch for an existing pledge
        (vouch-for-pledge (uint) (response bool uint))
        
        ;; Complete a pledge
        (complete-pledge (uint) (response bool uint))
        
        ;; Get pledge by ID
        (get-pledge (uint) (optional {
            creator: principal,
            message: (string-utf8 140),
            vouches: uint,
            completed: bool,
            created-at: uint,
            completed-at: (optional uint),
            category: (string-ascii 32)
        }))
    ))

;; ============================================
;; Vouching Trait
;; ============================================

(define-trait vouching-trait
    (
        ;; Vouch for a pledge
        (vouch-for-pledge (uint) (response bool uint))
        
        ;; Check if user has vouched
        (has-vouched (uint principal) bool)
        
        ;; Get total vouches
        (get-total-vouches () uint)
    ))

;; ============================================
;; Stats Trait
;; ============================================

(define-trait stats-trait
    (
        ;; Get total pledge count
        (get-pledge-count () uint)
        
        ;; Get user pledge count
        (get-user-pledge-count (principal) uint)
        
        ;; Get total fees collected
        (get-total-fees () uint)
    ))

;; ============================================
;; Token Trait (SIP-010 compatible)
;; ============================================

(define-trait sip-010-trait
    (
        (transfer (uint principal principal (optional (buff 34))) (response bool uint))
        (get-name () (response (string-ascii 32) uint))
        (get-symbol () (response (string-ascii 32) uint))
        (get-decimals () (response uint uint))
        (get-balance (principal) (response uint uint))
        (get-total-supply () (response uint uint))
        (get-token-uri () (response (optional (string-utf8 256)) uint))
    ))

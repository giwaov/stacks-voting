;; On-chain Voting Smart Contract
;; Create polls and cast votes on Stacks

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-poll-not-found (err u101))
(define-constant err-poll-ended (err u102))
(define-constant err-already-voted (err u103))
(define-constant err-invalid-option (err u104))
(define-constant err-poll-active (err u105))

;; Data Variables
(define-data-var poll-nonce uint u0)

;; Data Maps
(define-map polls
  { poll-id: uint }
  {
    creator: principal,
    title: (string-utf8 100),
    description: (string-utf8 500),
    options: (list 6 (string-utf8 100)),
    end-block: uint,
    total-votes: uint
  }
)

(define-map votes
  { poll-id: uint, option-index: uint }
  { count: uint }
)

(define-map voter-records
  { poll-id: uint, voter: principal }
  { voted: bool, option-index: uint }
)

;; Read-only functions

(define-read-only (get-poll (poll-id uint))
  (map-get? polls { poll-id: poll-id })
)

(define-read-only (get-poll-count)
  (var-get poll-nonce)
)

(define-read-only (get-vote-count (poll-id uint) (option-index uint))
  (default-to { count: u0 } (map-get? votes { poll-id: poll-id, option-index: option-index }))
)

(define-read-only (has-voted (poll-id uint) (voter principal))
  (is-some (map-get? voter-records { poll-id: poll-id, voter: voter }))
)

(define-read-only (get-voter-choice (poll-id uint) (voter principal))
  (map-get? voter-records { poll-id: poll-id, voter: voter })
)

(define-read-only (is-poll-active (poll-id uint))
  (match (get-poll poll-id)
    poll (< block-height (get end-block poll))
    false
  )
)

;; Public functions

;; Create a new poll
(define-public (create-poll 
  (title (string-utf8 100))
  (description (string-utf8 500))
  (options (list 6 (string-utf8 100)))
  (duration uint)
)
  (let
    (
      (poll-id (var-get poll-nonce))
    )
    (map-set polls
      { poll-id: poll-id }
      {
        creator: tx-sender,
        title: title,
        description: description,
        options: options,
        end-block: (+ block-height duration),
        total-votes: u0
      }
    )
    ;; Initialize vote counts
    (map-set votes { poll-id: poll-id, option-index: u0 } { count: u0 })
    (map-set votes { poll-id: poll-id, option-index: u1 } { count: u0 })
    (map-set votes { poll-id: poll-id, option-index: u2 } { count: u0 })
    (map-set votes { poll-id: poll-id, option-index: u3 } { count: u0 })
    (map-set votes { poll-id: poll-id, option-index: u4 } { count: u0 })
    (map-set votes { poll-id: poll-id, option-index: u5 } { count: u0 })
    
    (var-set poll-nonce (+ poll-id u1))
    (ok poll-id)
  )
)

;; Cast a vote
(define-public (vote (poll-id uint) (option-index uint))
  (let
    (
      (poll (unwrap! (get-poll poll-id) err-poll-not-found))
      (current-votes (get-vote-count poll-id option-index))
    )
    ;; Check poll is active
    (asserts! (< block-height (get end-block poll)) err-poll-ended)
    ;; Check not already voted
    (asserts! (not (has-voted poll-id tx-sender)) err-already-voted)
    ;; Check valid option (must be less than options length)
    (asserts! (< option-index (len (get options poll))) err-invalid-option)
    
    ;; Record vote
    (map-set voter-records
      { poll-id: poll-id, voter: tx-sender }
      { voted: true, option-index: option-index }
    )
    ;; Update vote count
    (map-set votes
      { poll-id: poll-id, option-index: option-index }
      { count: (+ (get count current-votes) u1) }
    )
    ;; Update total votes
    (map-set polls
      { poll-id: poll-id }
      (merge poll { total-votes: (+ (get total-votes poll) u1) })
    )
    (ok true)
  )
)

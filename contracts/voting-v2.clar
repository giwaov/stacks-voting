;; Simple Voting Contract v2
;; Create polls and vote on Stacks mainnet

(define-constant err-poll-not-found (err u101))
(define-constant err-already-voted (err u103))

(define-data-var poll-count uint u0)

(define-map polls { poll-id: uint } { title: (string-utf8 100), votes-a: uint, votes-b: uint })
(define-map has-voted { poll-id: uint, voter: principal } { voted: bool })

(define-read-only (get-poll (poll-id uint))
  (map-get? polls { poll-id: poll-id })
)

(define-read-only (get-poll-count)
  (var-get poll-count)
)

(define-public (create-poll (title (string-utf8 100)))
  (let ((poll-id (var-get poll-count)))
    (map-set polls { poll-id: poll-id } { title: title, votes-a: u0, votes-b: u0 })
    (var-set poll-count (+ poll-id u1))
    (ok poll-id)
  )
)

(define-public (vote-a (poll-id uint))
  (let ((poll (unwrap! (get-poll poll-id) err-poll-not-found)))
    (asserts! (is-none (map-get? has-voted { poll-id: poll-id, voter: tx-sender })) err-already-voted)
    (map-set has-voted { poll-id: poll-id, voter: tx-sender } { voted: true })
    (map-set polls { poll-id: poll-id } (merge poll { votes-a: (+ (get votes-a poll) u1) }))
    (ok true)
  )
)

(define-public (vote-b (poll-id uint))
  (let ((poll (unwrap! (get-poll poll-id) err-poll-not-found)))
    (asserts! (is-none (map-get? has-voted { poll-id: poll-id, voter: tx-sender })) err-already-voted)
    (map-set has-voted { poll-id: poll-id, voter: tx-sender } { voted: true })
    (map-set polls { poll-id: poll-id } (merge poll { votes-b: (+ (get votes-b poll) u1) }))
    (ok true)
  )
)

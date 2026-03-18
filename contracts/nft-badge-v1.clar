;; NFT Badge v1
(define-non-fungible-token badge uint)
(define-data-var last-id uint u0)
(define-read-only (get-last-id) (var-get last-id))
(define-public (mint)
  (let ((id (+ (var-get last-id) u1)))
    (try! (nft-mint? badge id tx-sender))
    (var-set last-id id)
    (ok id)))
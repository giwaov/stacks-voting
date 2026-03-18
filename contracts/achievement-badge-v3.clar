;; Achievement Badge v3
(define-non-fungible-token achievement-badge uint)
(define-data-var badge-id uint u0)
(define-public (mint-badge)
  (let ((id (+ (var-get badge-id) u1)))
    (try! (nft-mint? achievement-badge id tx-sender))
    (var-set badge-id id)
    (ok id)))
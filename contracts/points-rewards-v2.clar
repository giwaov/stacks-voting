;; Points Rewards v2
(define-data-var total-points uint u0)
(define-map user-points principal uint)
(define-read-only (get-points (user principal)) (default-to u0 (map-get? user-points user)))
(define-public (earn-points (amount uint))
  (begin
    (map-set user-points tx-sender (+ (get-points tx-sender) amount))
    (var-set total-points (+ (var-get total-points) amount))
    (ok (get-points tx-sender))))
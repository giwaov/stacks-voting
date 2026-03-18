;; Daily Checkin v1
(define-data-var total-checkins uint u0)
(define-map checkins principal uint)
(define-read-only (get-checkins (user principal)) (default-to u0 (map-get? checkins user)))
(define-public (checkin)
  (begin
    (map-set checkins tx-sender (+ (get-checkins tx-sender) u1))
    (var-set total-checkins (+ (var-get total-checkins) u1))
    (ok (get-checkins tx-sender))))
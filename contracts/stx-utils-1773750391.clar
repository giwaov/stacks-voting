;; STX Utils 1773750391
(define-data-var v uint u0)
(define-read-only (get-v) (var-get v))
(define-public (set-v (x uint)) (begin (var-set v x) (ok x)))
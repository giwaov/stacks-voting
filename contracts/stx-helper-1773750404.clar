;; STX Helper 1773750404
(define-data-var n uint u0)
(define-read-only (get-n) (var-get n))
(define-public (add (x uint)) (begin (var-set n (+ (var-get n) x)) (ok (var-get n))))
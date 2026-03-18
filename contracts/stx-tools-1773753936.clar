;; STX Tools 1773753936
(define-data-var counter uint u0)
(define-read-only (get-count) (var-get counter))
(define-public (inc) (begin (var-set counter (+ (var-get counter) u1)) (ok (var-get counter))))
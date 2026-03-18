;; Counter v1
(define-data-var count uint u0)
(define-read-only (get-count) (var-get count))
(define-public (increment) (begin (var-set count (+ (var-get count) u1)) (ok (var-get count))))
(define-public (decrement) (begin (var-set count (- (var-get count) u1)) (ok (var-get count))))
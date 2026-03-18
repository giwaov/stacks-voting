;; STX Module 1773750434
(define-data-var x uint u0)
(define-read-only (get-x) (var-get x))
(define-public (set-x (val uint)) (begin (var-set x val) (ok val)))
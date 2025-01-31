;; ChainPulse Contract
;; Tracks blockchain activity metrics

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-params (err u101))
(define-constant err-block-exists (err u102))

;; Data structures
(define-map BlockMetrics
  { block-height: uint }
  {
    tx-count: uint,
    active-addresses: uint,
    total-volume: uint,
    timestamp: uint
  }
)

;; Data vars for aggregates 
(define-data-var total-transactions uint u0)
(define-data-var total-addresses uint u0)
(define-data-var total-volume uint u0)
(define-data-var last-recorded-height uint u0)

;; Record metrics for a new block
(define-public (record-block-metrics 
  (height uint)
  (tx-count uint)
  (addresses uint) 
  (volume uint)
  (timestamp uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> height (var-get last-recorded-height)) err-block-exists)
    (asserts! (> timestamp u0) err-invalid-params)
    (map-set BlockMetrics
      { block-height: height }
      {
        tx-count: tx-count,
        active-addresses: addresses, 
        total-volume: volume,
        timestamp: timestamp
      }
    )
    (var-set total-transactions (+ (var-get total-transactions) tx-count))
    (var-set total-addresses (+ (var-get total-addresses) addresses))
    (var-set total-volume (+ (var-get total-volume) volume))
    (var-set last-recorded-height height)
    (ok true)
  )
)

;; Get metrics for a specific block
(define-read-only (get-block-metrics (height uint))
  (map-get? BlockMetrics { block-height: height })
)

;; Get aggregate stats
(define-read-only (get-total-stats)
  (ok {
    transactions: (var-get total-transactions),
    addresses: (var-get total-addresses),
    volume: (var-get total-volume),
    last-height: (var-get last-recorded-height)
  })
)

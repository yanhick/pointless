(ns pointless.pagination)

(defn next
  [get-index next?]
  (if (next? get-index)
    (+ (get-index) 1)
    (get-index)))

(defn next?
  [get-index slides]
  (< (get-index) (count slides)))

(defn previous
  [get-index]
  (if-not (= (get-index) 0)
    (- (get-index) 1)
    (get-index)))


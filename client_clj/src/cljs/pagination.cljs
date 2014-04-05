(ns pagination)

(defn next-slide
  [get-index next?]
  (if (next? get-index)
    (inc (get-index))
    (get-index)))

(defn next?
  [get-index get-slides]
  (< (get-index) (dec (count (get-slides)))))

(defn previous-slide
  [get-index]
  (if-not (= (get-index) 0)
    (- (get-index) 1)
    (get-index)))


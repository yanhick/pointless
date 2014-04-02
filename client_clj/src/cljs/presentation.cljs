(ns pointless.presentation)

(defn refresh
  [get-index data on-change]
  (on-change
    (get data.slides get-index)
    {:total (count data.slides)
     :current (+ (get-index) 1)}))

(defn update-template [])

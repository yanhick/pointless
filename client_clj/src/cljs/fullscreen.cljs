(ns fullscreen)

(defn enter [el]
  (if-not (nil? el.mozRequestFullScreen)
    (.mozRequestFullScreen el)
    (if-not (nil? el.webkitRequestFullScreen)
      (.webkitRequestFullScreen el)
      (.requestFullScreen el))))

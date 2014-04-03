(ns api)

(defn load [id cb]
  (.log js/console "loading JSON")
      (let [req (new js/XMLHttpRequest)]
        (.open req "GET" "test.json" true)
        (set! (.-onload req) (fn [response]
                               (cb nil (.-responseText req))))
        (.send req nil)))

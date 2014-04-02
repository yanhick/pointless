(ns pointless.code-mirror-wrapper)

(defn init [on-change presentation]
  (let [html-editor 
       (js/CodeMirror 
          (.querySelector js/document ".template .html")
          {:mode "htmlmixed"
           :value (get (get presentation template) html)
           :lineNumbers true})
        css-editor 
        (js/CodeMirror
          (.querySelector js/document ".template .css")
          {:mode "css"
           :value (get (get presentation template) css)
           :lineNumbers true})
        on-change (fn []
                    (on-change 
                      (.getValue html-editor)
                      (.getValue css-editor)))]
    (.on html-editor "change" on-change)
    (.on css-editor "change" on-change)))


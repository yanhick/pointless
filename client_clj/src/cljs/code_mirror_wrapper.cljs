(ns code_mirror_wrapper)

(defn- qs
  [selector]
  (.querySelector js/document selector))

(defn- create-editor 
  [selector mode value]
  (js/CodeMirror
    (qs selector)
      (clj->js {
        :mode mode
        :value value
        :lineNumbers true})))

(defn- on-editor-change 
  [on-change get-html get-css]
  (on-change
    {"template" {"html" (get-html) "css" (get-css)}}))

(defn init [on-change presentation]
  (let [html-editor
        (create-editor 
          ".template .html"
          "htmlmixed"
          (get (get presentation "template") "html"))
        css-editor
        (create-editor 
          ".template .css"
          "css"
          (get (get presentation "template") "css"))
        on-data-change (partial on-editor-change
                                on-change
                                #(.getValue html-editor)
                                #(.getValue css-editor))]
    (.on html-editor "change" on-data-change)
    (.on css-editor "change" on-data-change)))


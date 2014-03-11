
function init(onTemplateChange, html, css) {
    var htmlEditor = CodeMirror(
            document.querySelector(".template .html"), {
                mode : "htmlmixed",
                value : html,
                lineNumbers : true
        }),
        cssEditor = CodeMirror(
            document.querySelector(".template .css"), {
                mode : "css",
                value : css,
                lineNumbers : true
        }),
        onChange = function() {
            onTemplateChange(htmlEditor.getValue(), cssEditor.getValue());
        };

    htmlEditor.on("change", onChange);
    cssEditor.on("change", onChange);
}

module.exports = {
    init : init
}

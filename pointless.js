var testData = "{";
    testData += '"html" : "<div class=\'slide\'>text<img src=\'image\' /></div>",';
    testData += '"css" : ".slide \{ background:black; color:white;\}",';
    testData += '"content" : [';
    testData += "{"
    testData += '"text" : "test text",';
    testData += '"image" : "test image"';
    testData += "},";
    testData += "{"
    testData += '"text" : "test text",';
    testData += '"image" : "test image"';
    testData += "}";
    testData += "]";
    testData += "}";

var presentation = {

};
var slidesIndex = 0;

window.onload = function () {

    document.addEventListener("keyup", function(e){
        next(presentation);
        //listen for next/prev
        //listen for show/hide UI
    });
    //TODO listen event for forms
    updatePresentation(testData);
}

function updatePresentation(presData) {

    presentation = parsePresentation(presData);

    changeSlide(presentation, slidesIndex);
    updateStyle(presentation.css);
}

function next(presentation) {
    changeSlide(presentation, slidesIndex++);
}

function previous(presentation) {
    if (slidesIndex === 0)
        return;

    changeSlide(presentation, slidesIndex--);
}

function changeSlide(presentation, index, previousIndex) {
    if (presentation.content[previousIndex]) {
        //TODO delete if no content
    }

    if (!presentation.content[index]) {
        //TODO init content
    }

    //TODO : get new slide content and fill editing UI with it

    var slide = renderSlide(presentation.content[index], presentation.html);

    document.querySelector(".slide").innerHTML = "";
    document.querySelector(".slide").appendChild(slide);
}

function parsePresentation(presData) {
    return JSON.parse(presData);
}

function updateStyle(css) {
    var style = document.querySelector("style[data-css]");
    if (!style) {
        style = document.createElement("style");
        style.setAttribute("data-css", "");
        document.head.appendChild(style);
    }
    style.textContent = css;
}

function renderSlide(content, template) {
    var div = document.createElement("div");

    if (content === undefined)
        return div;

    div.innerHTML = template.replace("text", content.text)
                            .replace("image", content.image);
    return div.firstChild;
}

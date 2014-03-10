var testData = "{";
    testData += '"html" : "<div class=\'slide\'>text<img src=\'image\' /></div>",';
    testData += '"css" : ".slide \{ background:black; color:white;\}",';
    testData += '"slides" : [';
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

var presentation = {};

var slidesIndex = 0;
var pagination = {
    index : 0
}

// STARTUP

window.onload = function () {

    //TODO : fetch
    presentation = JSON.parse(testData);

    listenKeyboard(undefined, next.bind(presentation),
                   undefined, previous.bind(presentation));

    listenContentChange(updateContent.bind(presentation));
    listenTemplateChange(updateTemplate(presentation));

        //listen for next/prev
        //listen for show/hide UI
    updatePresentation(presentation);
}

// USER INTERACTIONS

function listenKeyboard(onUp, onRight, onDown, onLeft) {
    document.addEventListener("keyup", function(e){
        switch(e.keyCode) {
            case '37':
                onLeft();
                break;

            case '38':
                onUp();
                //up
                break;

            case '39':
                onRight();
                break;

            case '40':
                onDown();
                //down
                break;
        }
    });
}

function listenContentChange(updateContent) {
    var text  = document.querySelector(".content textarea"),
        image = document.querySelector(".content [type=url]");

    document.querySelector(".content")
            .addEventListener("input", function() {
        updateContent({
            text : text.value,
            image : image.value
        });
    });
}

function listenTemplateChange(updateTemplate) {
    var html = document.querySelector(".template .html"),
        css  = document.querySelector(".template .css");

    document.querySelector(".template")
            .addEventListener("input", function() {
        updateTemplate({
            html : html.value,
            css  : css.value
        });
    });
}

function updatePresentation(presentation, getIndex) {
    changeSlide(presentation, getIndex);
    updateStyle(presentation.css);
    updateForms(presentation, getIndex);
}

function updateForms(presentation, getIndex) {
    document.querySelector(".content textarea").value = presentation.slides[getIndex()].text;
    document.querySelector(".content [type=url]").value = presentation.slides[getIndex()].image;
    document.querySelector(".template .html").value = presentation.html;
    document.querySelector(".template .css").value = presentation.css;
}

function next(presentation, getIndex, incrIndex) {

    var previousIndex = getIndex();
    return changeSlide(presentation, incrIndex(), previousIndex );
}

function previous(presentation, getIndex, decrIndex) {
    var previousIndex = getIndex();

    if (previousIndex === 0)
        return;

    return changeSlide(presentation, decrIndex(), previousIndex);
}

function cleanSlides(slides) {
    return slides.filter(function(slide) {
        if (slide.text || slide.image) return slide;
    });
}

function createSlide() {
    return {
        text : "",
        image : ""
    }
}

function changeSlide(presentation, index, previousIndex) {
    var cleanedSlides = cleanSlides(presentation.slides).length - presentation.slides.length;

    if (cleanedSlides !== 0) {
        index -= cleanedSlides;
        previousIndex -= cleanSlides;
        presentation.slides = cleanSlides(presentation.slides);
    }

    if (!presentation.slides[index]) {
        presentation.slides = createSlide();
    }

    //TODO : update max/current slide UI

    updateForms(presentation, index);

    var slide = renderSlide(presentation.content[index], presentation.html);

    document.querySelector(".slide").innerHTML = "";
    document.querySelector(".slide").appendChild(slide);
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

function updateContent(presentation, getIndex, content) {
    presentation.content[getIndex()] = content;
}

function updateTemplate(presentation, template) {
    presentation.html = template.html;
    presentation.css = template.css;

    updateStyle(template.css);
}

function renderSlide(content, template) {
    var div = document.createElement("div");

    if (content === undefined)
        return div;

    div.innerHTML = template.replace("text", content.text)
                            .replace("image", content.image);
    return div.firstChild;
}

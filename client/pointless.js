var Presentation = require("./presentation.js");

// USER INTERACTIONS

function listenKeyboard(onUp, onRight, onDown, onLeft) {
    document.addEventListener("keyup", function(e){
        switch(e.keyCode) {
            case 37:
                onLeft();
                break;

            case 38:
                onUp();
                //up
                break;

            case 39:
                onRight();
                break;

            case 40:
                onDown();
                //down
                break;
        }
    });
}

function listenSlideChange(updateContent) {
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

// PAGINATION


// PRESENTATION

var presentation = Presentation(refresh);

// UI

function refresh(slide, template) {
    updateStyle(template.css);
    renderSlide(slide, template.html);
    updateForms(slide, template);
}

function renderSlide(slide, html) {
    var div = document.createElement("div");

    div.innerHTML = html.replace("{{text}}", slide.text)
                                 .replace("{{image}}", slide.image);

    document.querySelector(".slide-container").innerHTML = "";
    document.querySelector(".slide-container").appendChild(div);
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

function updateForms(slide, template) {
    document.querySelector(".content textarea").value = slide.text;
    document.querySelector(".content [type=url]").value = slide.image;
    document.querySelector(".template .html").value = template.html;
    document.querySelector(".template .css").value = template.css;
}

function toggleForm(selector) {
    var form = document.querySelector(selector);
    form.style.visibility === "hidden" ? form.style.visibility = "" : form.style.visibility = "hidden";
}

// STARTUP

window.onload = function () {


    listenKeyboard(toggleForm.bind(null, ".content"), presentation.next,
                   toggleForm.bind(null, ".template"), presentation.previous);

    listenSlideChange(presentation.updateSlide);
    listenTemplateChange(presentation.updateTemplate);

    //TODO : fetch using load/save module and instantiate new prez when ready
    presentation.load();
}

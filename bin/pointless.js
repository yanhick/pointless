(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Pagination(onChange) {

    var index = 0,

        next = function() {
            index++;
            onChange();
        },

        previous = function() {
            if (index === 0)
                return;

            index--;
            onChange();
        },

        getIndex = function() {
            return index;
        };

    return {
        next : next,
        previous : previous,
        getIndex : getIndex
    }
}

module.exports = Pagination;

},{}],2:[function(require,module,exports){
var Presentation = require("./presentation.js");

var testData = "{";
    testData += '"template" : {';
    testData += '"html" : "<div class=\'slide\'><div class=\'text-container\'>{{text}}<div class=\'image-container\'><img src=\'{{image}}\' /></div></div></div>",';
    testData += '"css" : ".slide \{ background:black; color:white;\}"';
    testData += "},";
    testData += '"slides" : [';
    testData += "{"
    testData += '"text" : "test text",';
    testData += '"image" : "test image"';
    testData += "},";
    testData += "{"
    testData += '"text" : "test text2",';
    testData += '"image" : "test image"';
    testData += "}";
    testData += "]";
    testData += "}";




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

},{"./presentation.js":3}],3:[function(require,module,exports){
var Pagination = require("./pagination.js");

function Presentation(onChange) {

    var data = {},

        refresh = function() {
            if (!data.slides[getIndex()])
                data.slides[getIndex()] = createSlide();

            onChange(data.slides[getIndex()], data.template);
        },

        pagination = Pagination(refresh),

        getIndex = pagination.getIndex,

        updateSlide = function (slide) {
            data.slides[getIndex()] = slide;
            onChange(data.slides[getIndex()], data.template);
        },

        updateTemplate = function(template) {
            data.template = template;
            onChange(data.slides[getIndex()], data.template);
        },

        createSlide = function() {
            return {
                text : "",
                image : ""
            }
        },

        load = function(id) {
            var req = new XMLHttpRequest();
            req.open("GET","test.json", true);
            req.onload = function(presentationData) {
                data = JSON.parse(req.responseText);
                onChange(data.slides[getIndex()], data.template);
            }
            req.send(null);
        };

    return {
        refresh : refresh,
        updateSlide : updateSlide,
        updateTemplate : updateTemplate,
        load : load,
        next : pagination.next,
        previous : pagination.previous
    }
}

module.exports = Presentation

},{"./pagination.js":1}]},{},[2])
var testData = "{";
    testData += '"template" : {';
    testData += '"html" : "<div class=\'slide\'>text<img src=\'image\' /></div>",';
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

// SLIDES


function changeSlide(presentation) {

    var slide = presentation.getSlide();

    refresh(slide, presentation.template);
    //TODO : update max/current slide UI
}

// PAGINATION

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

// PRESENTATION

var presentation = (function(onChange) {

    var data = {},

        refresh = function() {
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

        getSlide = function() {
            if (!data.slides[getIndex()])
                data.slides[getIndex()] = createSlide();

            return data.slides[getIndex()];
        },


        load = function(id) {
            //TODO : fetch with id
            data = JSON.parse(testData);
            onChange(data.slides[getIndex()], data.template);
        };

    return {
        refresh : refresh,
        updateSlide : updateSlide.bind(getIndex),
        updateTemplate : updateTemplate,
        load : load,
        getSlide : getSlide,
        next : pagination.next,
        previous : pagination.previous
    }

}(refresh));

// UI

function refresh(slide, template) {
    updateStyle(template.css);
    renderSlide(slide, template.html);
    updateForms(slide, template);
}

function renderSlide(slide, html) {
    var div = document.createElement("div");

    div.innerHTML = html.replace("text", slide.text)
                                 .replace("image", slide.image);

    document.querySelector(".slide").innerHTML = "";
    document.querySelector(".slide").appendChild(div);
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

// STARTUP

window.onload = function () {

    //TODO : fetch
    presentation.load();

    //TODO : listen for show/hide UI
    listenKeyboard(undefined, presentation.next,
                   undefined, presentation.previous);

    listenSlideChange(presentation.updateSlide);
    listenTemplateChange(presentation.updateTemplate);
}

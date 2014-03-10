var testData = "{";
    testData = '"template" : {';
    testData += '"html" : "<div class=\'slide\'>text<img src=\'image\' /></div>",';
    testData += '"css" : ".slide \{ background:black; color:white;\}",';
    testData += "},";
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



// STARTUP

window.onload = function () {

    //TODO : fetch
    presentation.load();

    //TODO : listen for show/hide UI
    listenKeyboard(undefined, pagination.next,
                   undefined, pagination.previous);

    listenContentChange(presentation.updateContent);
    listenTemplateChange(presentation.updateTemplate);
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


// PRESENTATION

var presentation = (function(onContentChange, onTemplateChange, getIndex) {

    var data = {},

        updateSlide = function (getIndex, slide) {
            data.slides[getIndex()] = slide;
            onContentChange(data[getIndex()], data.template);
        },

        updateTemplate = function(template) {
            data.template = template;
            onTemplateChange(date[getIndex()], data.template);
        },

        load = function(id) {
            //TODO : fetch with id
            data = testData;
            onContentChange(data[getIndex()], data.template);
            onTemplateChange(date[getIndex()], data.template);
        };

    return {
        updateContent : updateContent.bind(getIndex),
        updateTemplate : updateTemplate,
        load : load
    }

}());



// SLIDES

function createSlide() {
    return {
        text : "",
        image : ""
    }
}

function changeSlide(presentation, index) {

    var slide = presentation.getSlide(index);

    //TODO : update max/current slide UI

    updateForms(presentation, index);
    renderSlide(presentation.content[index], presentation.html);
}

// PAGINATION

var pagination = (function (onChange) {

    var index = 0,

        next = function() {

            var previousIndex = index;
            index++;
            return onChange(index, previousIndex);
        },

        previous = function() {
            if (index === 0)
                return;

            var previousIndex = index;

            index--;
            return onChange(index, previousIndex);
        },

        getIndex = function() {
            return index;
        };

    return {
        next : next,
        previous : previous,
        getIndex : getIndex
    }

}(changeSlide.bind(presentation)));

// UI

function renderSlide(slide, template) {
    var div = document.createElement("div");

    div.innerHTML = template.replace("text", slide.text)
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

function updateForms(presentation, getIndex) {
    document.querySelector(".content textarea").value = presentation.slides[getIndex()].text;
    document.querySelector(".content [type=url]").value = presentation.slides[getIndex()].image;
    document.querySelector(".template .html").value = presentation.html;
    document.querySelector(".template .css").value = presentation.css;
}

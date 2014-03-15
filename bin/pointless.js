(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function load(id, cb) {
    var req = new XMLHttpRequest();
    req.open("GET","test.json", true);
    req.onload = function(presentationData) {
        cb(null, req.responseText);
    }
    req.send(null);
}

function save(data, cb) {
    //TODO
}

module.exports = {
    load : load,
    save : save
}

},{}],2:[function(require,module,exports){

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

},{}],3:[function(require,module,exports){

module.exports = function(el) {
    if (el.mozRequestFullScreen)
        el.mozRequestFullScreen();
    else if (el.webkitRequestFullScreen)
        el.webkitRequestFullScreen();
    else if (el.requestFullScreen)
        el.requestFullScreen;
}


},{}],4:[function(require,module,exports){
module.exports = function (onChange) {

    var index = 0,

        next = function(hasNext) {
            if (hasNext(index)) {
                index++;
                onChange();
            }
        },

        previous = function() {
            if (index !== 0) {
                index--;
                onChange();
            }

        },

        goTo = function(getGoToIndex) {
            index = getGoToIndex();
            onChange();
        }

        getIndex = function() {
            return index;
        };

    return {
        next : next,
        previous : previous,
        goTo : goTo,
        getIndex : getIndex
    }
}


},{}],5:[function(require,module,exports){
var Presentation = require("./presentation.js"),
    userInteraction = require("./user-interactions.js"),
    codeMirrorWrapper = require("./code-mirror-wrapper.js"),
    enterFullscreen = require("./fullscreen.js"),
    api = require("./api.js"),
    ui = require("./ui.js");

function main() {
    //TODO : retrieve ID from query string
    api.load(1234, function(err, presentationData) {
        var presentation = Presentation(ui.refresh);

        userInteraction.listenKeyboard(ui.toggleForm.bind(null, ".content"), presentation.next,
                       ui.toggleForm.bind(null, ".template"), presentation.previous);

        userInteraction.listenSlideChange(presentation.updateSlide);

        userInteraction.listenButtons(presentation.insertSlide, presentation.deleteSlide,
                                      presentation.goToSlide, presentation.copySlide, presentation.swapSlide,
                                      enterFullscreen.bind(null, document.querySelector(".slide-container")));

        var test = JSON.parse(presentationData);
        codeMirrorWrapper.init(presentation.updateTemplate, test.template.html, test.template.css);

        presentation.fromJSON(presentationData);
    });
}

window.onload = main;

},{"./api.js":1,"./code-mirror-wrapper.js":2,"./fullscreen.js":3,"./presentation.js":6,"./ui.js":7,"./user-interactions.js":8}],6:[function(require,module,exports){
var Pagination = require("./pagination.js");

module.exports = function (onChange) {

    var data = {},

        refresh = function() {

            onChange(data.slides[getIndex()],
                     data.template,
                     { total : data.slides.length, current : getIndex() + 1}
                    );
        },

        pagination = Pagination(refresh),

        getIndex = pagination.getIndex,

        updateSlide = function (slide) {
            data.slides[getIndex()] = slide;
            refresh();
        },

        insertSlide = function () {
            data.slides.splice(getIndex(), 0, createSlide());
            refresh();
        },

        swapSlide = function (getSwapIndex) {
            var swappedSlide = data.slides[getIndex()],
                targetSlide  = data.slides[getSwapIndex()];

            data.slides[getIndex()] = targetSlide;
            data.slides[getSwapIndex()] = swappedSlide;
            refresh();
        },

        deleteSlide = function () {
            if (data.slides.length === 1)
                return;

            data.slides.splice(getIndex(), 1);

            if (data.slides.length === getIndex()) {
                pagination.previous();
                return;
            }

            refresh();
        },

        copySlide = function (getCopyIndex) {
            data.slides.splice(
               getIndex(), 1,
               JSON.parse(JSON.stringify(data.slides[getCopyIndex()]))
              );

            refresh();
        },

        updateTemplate = function(html, css) {
            data.template.html = html;
            data.template.css= css;
            refresh();
        },

        hasNext = function (index) {
            return index < data.slides.length - 1;
        },

        fromJSON = function(json) {
            data = JSON.parse(json);
            refresh();
        },

        toJSON = function() {
            return JSON.stringify(data);
        },

        createSlide = function() {
            return {
                text : "",
                image : ""
            }
        };

    return {
        refresh : refresh,
        updateSlide : updateSlide,
        updateTemplate : updateTemplate,
        toJSON : toJSON,
        fromJSON : fromJSON,
        next : pagination.next.bind(null, hasNext),
        previous : pagination.previous,
        goToSlide : pagination.goTo,
        swapSlide : swapSlide,
        copySlide : copySlide,
        deleteSlide : deleteSlide,
        insertSlide : insertSlide
    }
}


},{"./pagination.js":4}],7:[function(require,module,exports){

function refresh(slide, template, progress) {
    updateStyle(template.css);
    renderSlide(slide, template.html, template.fields);
    updateForms(slide, template);
    updateProgress(progress);
}


function renderSlide(slide, html, fields) {
    var div = document.createElement("div");

    div.innerHTML = fields.reduce(function(html, field) {
        return html.replace("{{" + field.name + "}}", slide[field.name]);
    }, html);

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
    buildContentForm(document.querySelector(".content"), template.fields);
    document.querySelector(".content textarea").value = slide.text;
    document.querySelector(".content [type=url]").value = slide.image;
    document.querySelector(".template .html").value = template.html;
    document.querySelector(".template .css").value = template.css;
}

function updateProgress(progress) {
    document.querySelector(".progress")
            .innerHTML = progress.current + " / " + progress.total;
}

function toggleForm(selector) {
    var form = document.querySelector(selector);
    form.style.visibility === "hidden" ? form.style.visibility = "" : form.style.visibility = "hidden";
}

function buildContentForm(contentForm, fields) {

    if (contentForm.firstElementChild)
        return;

    contentForm.innerHTML = fields.reduce(function(html, field) {

        html += "<div class=\"form-group\">";
        html += "<label>" + field.name + "</label>";
        switch (field.type) {
            case "textarea":
                html += "<textarea name=\"" + field.name + "\" class=\"form-control\"></textarea>";
                break;

            default:
                html += "<input type=\"" + field.type + "\" class=\"form-control\" name=\"" + field.name + "\" />";
                break;
        }
        html += "</div>";

        return html;
    }, "");
}

module.exports = {
    refresh : refresh,
    toggleForm : toggleForm
}


},{}],8:[function(require,module,exports){

function listenKeyboard(onUp, onRight, onDown, onLeft) {
    document.addEventListener("keyup", function(e){
        switch(e.keyCode) {
            case 37:
                onLeft();
                break;

            case 38:
                onUp();
                break;

            case 39:
                onRight();
                break;

            case 40:
                onDown();
                break;
        }
    });
}

function listenSlideChange(updateSlide) {
    document.querySelector(".content")
            .addEventListener("input", function() {

        var inputs  = document.querySelectorAll(".content textarea, .content input"),
            content = Array.prototype.reduce.call(inputs, function(content, input) {
                content[input.name] = input.value;
                return content;
            }, {});

        updateSlide(content);
    });
}

function listenButtons(onInsert, onDelete,
                       onGoToSlide, onCopySlide, onSwapSlide,
                       onFullscreen) {

    var listen = function (selector, cb) {
            document.querySelector(selector)
                    .addEventListener("click", cb);
        },
        getIndex = function () {
            return document.querySelector(".buttons [type=number]").value;
        }

    listen(".buttons .insert", onInsert);
    listen(".buttons .delete", onDelete);
    listen(".buttons .fullscreen", onFullscreen);
    listen(".buttons .goto", onGoToSlide.bind(null, getIndex));
    listen(".buttons .copy", onCopySlide.bind(null, getIndex));
    listen(".buttons .swap", onSwapSlide.bind(null,getIndex));
}

module.exports = {
    listenKeyboard : listenKeyboard,
    listenSlideChange : listenSlideChange,
    listenButtons : listenButtons
}


},{}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC9hcGkuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2NvZGUtbWlycm9yLXdyYXBwZXIuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2Z1bGxzY3JlZW4uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BhZ2luYXRpb24uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BvaW50bGVzcy5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvcHJlc2VudGF0aW9uLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC91aS5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvdXNlci1pbnRlcmFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIGxvYWQoaWQsIGNiKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vcGVuKFwiR0VUXCIsXCJ0ZXN0Lmpzb25cIiwgdHJ1ZSk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKHByZXNlbnRhdGlvbkRhdGEpIHtcbiAgICAgICAgY2IobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgfVxuICAgIHJlcS5zZW5kKG51bGwpO1xufVxuXG5mdW5jdGlvbiBzYXZlKGRhdGEsIGNiKSB7XG4gICAgLy9UT0RPXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxvYWQgOiBsb2FkLFxuICAgIHNhdmUgOiBzYXZlXG59XG4iLCJcbmZ1bmN0aW9uIGluaXQob25UZW1wbGF0ZUNoYW5nZSwgaHRtbCwgY3NzKSB7XG4gICAgdmFyIGh0bWxFZGl0b3IgPSBDb2RlTWlycm9yKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuaHRtbFwiKSwge1xuICAgICAgICAgICAgICAgIG1vZGUgOiBcImh0bWxtaXhlZFwiLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogaHRtbCxcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVycyA6IHRydWVcbiAgICAgICAgfSksXG4gICAgICAgIGNzc0VkaXRvciA9IENvZGVNaXJyb3IoXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5jc3NcIiksIHtcbiAgICAgICAgICAgICAgICBtb2RlIDogXCJjc3NcIixcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGNzcyxcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVycyA6IHRydWVcbiAgICAgICAgfSksXG4gICAgICAgIG9uQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvblRlbXBsYXRlQ2hhbmdlKGh0bWxFZGl0b3IuZ2V0VmFsdWUoKSwgY3NzRWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9O1xuXG4gICAgaHRtbEVkaXRvci5vbihcImNoYW5nZVwiLCBvbkNoYW5nZSk7XG4gICAgY3NzRWRpdG9yLm9uKFwiY2hhbmdlXCIsIG9uQ2hhbmdlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdCA6IGluaXRcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCkge1xuICAgIGlmIChlbC5tb3pSZXF1ZXN0RnVsbFNjcmVlbilcbiAgICAgICAgZWwubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcbiAgICBlbHNlIGlmIChlbC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbilcbiAgICAgICAgZWwud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4oKTtcbiAgICBlbHNlIGlmIChlbC5yZXF1ZXN0RnVsbFNjcmVlbilcbiAgICAgICAgZWwucmVxdWVzdEZ1bGxTY3JlZW47XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9uQ2hhbmdlKSB7XG5cbiAgICB2YXIgaW5kZXggPSAwLFxuXG4gICAgICAgIG5leHQgPSBmdW5jdGlvbihoYXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAoaGFzTmV4dChpbmRleCkpIHtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJldmlvdXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIGdvVG8gPSBmdW5jdGlvbihnZXRHb1RvSW5kZXgpIHtcbiAgICAgICAgICAgIGluZGV4ID0gZ2V0R29Ub0luZGV4KCk7XG4gICAgICAgICAgICBvbkNoYW5nZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0SW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG5leHQgOiBuZXh0LFxuICAgICAgICBwcmV2aW91cyA6IHByZXZpb3VzLFxuICAgICAgICBnb1RvIDogZ29UbyxcbiAgICAgICAgZ2V0SW5kZXggOiBnZXRJbmRleFxuICAgIH1cbn1cblxuIiwidmFyIFByZXNlbnRhdGlvbiA9IHJlcXVpcmUoXCIuL3ByZXNlbnRhdGlvbi5qc1wiKSxcbiAgICB1c2VySW50ZXJhY3Rpb24gPSByZXF1aXJlKFwiLi91c2VyLWludGVyYWN0aW9ucy5qc1wiKSxcbiAgICBjb2RlTWlycm9yV3JhcHBlciA9IHJlcXVpcmUoXCIuL2NvZGUtbWlycm9yLXdyYXBwZXIuanNcIiksXG4gICAgZW50ZXJGdWxsc2NyZWVuID0gcmVxdWlyZShcIi4vZnVsbHNjcmVlbi5qc1wiKSxcbiAgICBhcGkgPSByZXF1aXJlKFwiLi9hcGkuanNcIiksXG4gICAgdWkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcblxuZnVuY3Rpb24gbWFpbigpIHtcbiAgICAvL1RPRE8gOiByZXRyaWV2ZSBJRCBmcm9tIHF1ZXJ5IHN0cmluZ1xuICAgIGFwaS5sb2FkKDEyMzQsIGZ1bmN0aW9uKGVyciwgcHJlc2VudGF0aW9uRGF0YSkge1xuICAgICAgICB2YXIgcHJlc2VudGF0aW9uID0gUHJlc2VudGF0aW9uKHVpLnJlZnJlc2gpO1xuXG4gICAgICAgIHVzZXJJbnRlcmFjdGlvbi5saXN0ZW5LZXlib2FyZCh1aS50b2dnbGVGb3JtLmJpbmQobnVsbCwgXCIuY29udGVudFwiKSwgcHJlc2VudGF0aW9uLm5leHQsXG4gICAgICAgICAgICAgICAgICAgICAgIHVpLnRvZ2dsZUZvcm0uYmluZChudWxsLCBcIi50ZW1wbGF0ZVwiKSwgcHJlc2VudGF0aW9uLnByZXZpb3VzKTtcblxuICAgICAgICB1c2VySW50ZXJhY3Rpb24ubGlzdGVuU2xpZGVDaGFuZ2UocHJlc2VudGF0aW9uLnVwZGF0ZVNsaWRlKTtcblxuICAgICAgICB1c2VySW50ZXJhY3Rpb24ubGlzdGVuQnV0dG9ucyhwcmVzZW50YXRpb24uaW5zZXJ0U2xpZGUsIHByZXNlbnRhdGlvbi5kZWxldGVTbGlkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VudGF0aW9uLmdvVG9TbGlkZSwgcHJlc2VudGF0aW9uLmNvcHlTbGlkZSwgcHJlc2VudGF0aW9uLnN3YXBTbGlkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50ZXJGdWxsc2NyZWVuLmJpbmQobnVsbCwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZS1jb250YWluZXJcIikpKTtcblxuICAgICAgICB2YXIgdGVzdCA9IEpTT04ucGFyc2UocHJlc2VudGF0aW9uRGF0YSk7XG4gICAgICAgIGNvZGVNaXJyb3JXcmFwcGVyLmluaXQocHJlc2VudGF0aW9uLnVwZGF0ZVRlbXBsYXRlLCB0ZXN0LnRlbXBsYXRlLmh0bWwsIHRlc3QudGVtcGxhdGUuY3NzKTtcblxuICAgICAgICBwcmVzZW50YXRpb24uZnJvbUpTT04ocHJlc2VudGF0aW9uRGF0YSk7XG4gICAgfSk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluO1xuIiwidmFyIFBhZ2luYXRpb24gPSByZXF1aXJlKFwiLi9wYWdpbmF0aW9uLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvbkNoYW5nZSkge1xuXG4gICAgdmFyIGRhdGEgPSB7fSxcblxuICAgICAgICByZWZyZXNoID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIG9uQ2hhbmdlKGRhdGEuc2xpZGVzW2dldEluZGV4KCldLFxuICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgIHsgdG90YWwgOiBkYXRhLnNsaWRlcy5sZW5ndGgsIGN1cnJlbnQgOiBnZXRJbmRleCgpICsgMX1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYWdpbmF0aW9uID0gUGFnaW5hdGlvbihyZWZyZXNoKSxcblxuICAgICAgICBnZXRJbmRleCA9IHBhZ2luYXRpb24uZ2V0SW5kZXgsXG5cbiAgICAgICAgdXBkYXRlU2xpZGUgPSBmdW5jdGlvbiAoc2xpZGUpIHtcbiAgICAgICAgICAgIGRhdGEuc2xpZGVzW2dldEluZGV4KCldID0gc2xpZGU7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0U2xpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkYXRhLnNsaWRlcy5zcGxpY2UoZ2V0SW5kZXgoKSwgMCwgY3JlYXRlU2xpZGUoKSk7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3dhcFNsaWRlID0gZnVuY3Rpb24gKGdldFN3YXBJbmRleCkge1xuICAgICAgICAgICAgdmFyIHN3YXBwZWRTbGlkZSA9IGRhdGEuc2xpZGVzW2dldEluZGV4KCldLFxuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlICA9IGRhdGEuc2xpZGVzW2dldFN3YXBJbmRleCgpXTtcblxuICAgICAgICAgICAgZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0gPSB0YXJnZXRTbGlkZTtcbiAgICAgICAgICAgIGRhdGEuc2xpZGVzW2dldFN3YXBJbmRleCgpXSA9IHN3YXBwZWRTbGlkZTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWxldGVTbGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLnNsaWRlcy5sZW5ndGggPT09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBkYXRhLnNsaWRlcy5zcGxpY2UoZ2V0SW5kZXgoKSwgMSk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnNsaWRlcy5sZW5ndGggPT09IGdldEluZGV4KCkpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uLnByZXZpb3VzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29weVNsaWRlID0gZnVuY3Rpb24gKGdldENvcHlJbmRleCkge1xuICAgICAgICAgICAgZGF0YS5zbGlkZXMuc3BsaWNlKFxuICAgICAgICAgICAgICAgZ2V0SW5kZXgoKSwgMSxcbiAgICAgICAgICAgICAgIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGF0YS5zbGlkZXNbZ2V0Q29weUluZGV4KCldKSlcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oaHRtbCwgY3NzKSB7XG4gICAgICAgICAgICBkYXRhLnRlbXBsYXRlLmh0bWwgPSBodG1sO1xuICAgICAgICAgICAgZGF0YS50ZW1wbGF0ZS5jc3M9IGNzcztcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNOZXh0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPCBkYXRhLnNsaWRlcy5sZW5ndGggLSAxO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb21KU09OID0gZnVuY3Rpb24oanNvbikge1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGV4dCA6IFwiXCIsXG4gICAgICAgICAgICAgICAgaW1hZ2UgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZWZyZXNoIDogcmVmcmVzaCxcbiAgICAgICAgdXBkYXRlU2xpZGUgOiB1cGRhdGVTbGlkZSxcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUgOiB1cGRhdGVUZW1wbGF0ZSxcbiAgICAgICAgdG9KU09OIDogdG9KU09OLFxuICAgICAgICBmcm9tSlNPTiA6IGZyb21KU09OLFxuICAgICAgICBuZXh0IDogcGFnaW5hdGlvbi5uZXh0LmJpbmQobnVsbCwgaGFzTmV4dCksXG4gICAgICAgIHByZXZpb3VzIDogcGFnaW5hdGlvbi5wcmV2aW91cyxcbiAgICAgICAgZ29Ub1NsaWRlIDogcGFnaW5hdGlvbi5nb1RvLFxuICAgICAgICBzd2FwU2xpZGUgOiBzd2FwU2xpZGUsXG4gICAgICAgIGNvcHlTbGlkZSA6IGNvcHlTbGlkZSxcbiAgICAgICAgZGVsZXRlU2xpZGUgOiBkZWxldGVTbGlkZSxcbiAgICAgICAgaW5zZXJ0U2xpZGUgOiBpbnNlcnRTbGlkZVxuICAgIH1cbn1cblxuIiwiXG5mdW5jdGlvbiByZWZyZXNoKHNsaWRlLCB0ZW1wbGF0ZSwgcHJvZ3Jlc3MpIHtcbiAgICB1cGRhdGVTdHlsZSh0ZW1wbGF0ZS5jc3MpO1xuICAgIHJlbmRlclNsaWRlKHNsaWRlLCB0ZW1wbGF0ZS5odG1sLCB0ZW1wbGF0ZS5maWVsZHMpO1xuICAgIHVwZGF0ZUZvcm1zKHNsaWRlLCB0ZW1wbGF0ZSk7XG4gICAgdXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3MpO1xufVxuXG5cbmZ1bmN0aW9uIHJlbmRlclNsaWRlKHNsaWRlLCBodG1sLCBmaWVsZHMpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgIGRpdi5pbm5lckhUTUwgPSBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKGh0bWwsIGZpZWxkKSB7XG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoXCJ7e1wiICsgZmllbGQubmFtZSArIFwifX1cIiwgc2xpZGVbZmllbGQubmFtZV0pO1xuICAgIH0sIGh0bWwpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZS1jb250YWluZXJcIikuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNsaWRlLWNvbnRhaW5lclwiKS5hcHBlbmRDaGlsZChkaXYpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTdHlsZShjc3MpIHtcbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3R5bGVbZGF0YS1jc3NdXCIpO1xuICAgIGlmICghc3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgIHN0eWxlLnNldEF0dHJpYnV0ZShcImRhdGEtY3NzXCIsIFwiXCIpO1xuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICB9XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBjc3M7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUZvcm1zKHNsaWRlLCB0ZW1wbGF0ZSkge1xuICAgIGJ1aWxkQ29udGVudEZvcm0oZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLCB0ZW1wbGF0ZS5maWVsZHMpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudCB0ZXh0YXJlYVwiKS52YWx1ZSA9IHNsaWRlLnRleHQ7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50IFt0eXBlPXVybF1cIikudmFsdWUgPSBzbGlkZS5pbWFnZTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5odG1sXCIpLnZhbHVlID0gdGVtcGxhdGUuaHRtbDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5jc3NcIikudmFsdWUgPSB0ZW1wbGF0ZS5jc3M7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVByb2dyZXNzKHByb2dyZXNzKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wcm9ncmVzc1wiKVxuICAgICAgICAgICAgLmlubmVySFRNTCA9IHByb2dyZXNzLmN1cnJlbnQgKyBcIiAvIFwiICsgcHJvZ3Jlc3MudG90YWw7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUZvcm0oc2VsZWN0b3IpIHtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIGZvcm0uc3R5bGUudmlzaWJpbGl0eSA9PT0gXCJoaWRkZW5cIiA/IGZvcm0uc3R5bGUudmlzaWJpbGl0eSA9IFwiXCIgOiBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xufVxuXG5mdW5jdGlvbiBidWlsZENvbnRlbnRGb3JtKGNvbnRlbnRGb3JtLCBmaWVsZHMpIHtcblxuICAgIGlmIChjb250ZW50Rm9ybS5maXJzdEVsZW1lbnRDaGlsZClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgY29udGVudEZvcm0uaW5uZXJIVE1MID0gZmllbGRzLnJlZHVjZShmdW5jdGlvbihodG1sLCBmaWVsZCkge1xuXG4gICAgICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cIjtcbiAgICAgICAgaHRtbCArPSBcIjxsYWJlbD5cIiArIGZpZWxkLm5hbWUgKyBcIjwvbGFiZWw+XCI7XG4gICAgICAgIHN3aXRjaCAoZmllbGQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInRleHRhcmVhXCI6XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0ZXh0YXJlYSBuYW1lPVxcXCJcIiArIGZpZWxkLm5hbWUgKyBcIlxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCI+PC90ZXh0YXJlYT5cIjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPGlucHV0IHR5cGU9XFxcIlwiICsgZmllbGQudHlwZSArIFwiXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBuYW1lPVxcXCJcIiArIGZpZWxkLm5hbWUgKyBcIlxcXCIgLz5cIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBodG1sICs9IFwiPC9kaXY+XCI7XG5cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSwgXCJcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlZnJlc2ggOiByZWZyZXNoLFxuICAgIHRvZ2dsZUZvcm0gOiB0b2dnbGVGb3JtXG59XG5cbiIsIlxuZnVuY3Rpb24gbGlzdGVuS2V5Ym9hcmQob25VcCwgb25SaWdodCwgb25Eb3duLCBvbkxlZnQpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgICAgb25MZWZ0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICAgICAgb25VcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgICAgIG9uUmlnaHQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICBvbkRvd24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5TbGlkZUNoYW5nZSh1cGRhdGVTbGlkZSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5wdXRzICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY29udGVudCB0ZXh0YXJlYSwgLmNvbnRlbnQgaW5wdXRcIiksXG4gICAgICAgICAgICBjb250ZW50ID0gQXJyYXkucHJvdG90eXBlLnJlZHVjZS5jYWxsKGlucHV0cywgZnVuY3Rpb24oY29udGVudCwgaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50W2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgICAgICB9LCB7fSk7XG5cbiAgICAgICAgdXBkYXRlU2xpZGUoY29udGVudCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxpc3RlbkJ1dHRvbnMob25JbnNlcnQsIG9uRGVsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICBvbkdvVG9TbGlkZSwgb25Db3B5U2xpZGUsIG9uU3dhcFNsaWRlLFxuICAgICAgICAgICAgICAgICAgICAgICBvbkZ1bGxzY3JlZW4pIHtcblxuICAgIHZhciBsaXN0ZW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNiKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNiKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0SW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idXR0b25zIFt0eXBlPW51bWJlcl1cIikudmFsdWU7XG4gICAgICAgIH1cblxuICAgIGxpc3RlbihcIi5idXR0b25zIC5pbnNlcnRcIiwgb25JbnNlcnQpO1xuICAgIGxpc3RlbihcIi5idXR0b25zIC5kZWxldGVcIiwgb25EZWxldGUpO1xuICAgIGxpc3RlbihcIi5idXR0b25zIC5mdWxsc2NyZWVuXCIsIG9uRnVsbHNjcmVlbik7XG4gICAgbGlzdGVuKFwiLmJ1dHRvbnMgLmdvdG9cIiwgb25Hb1RvU2xpZGUuYmluZChudWxsLCBnZXRJbmRleCkpO1xuICAgIGxpc3RlbihcIi5idXR0b25zIC5jb3B5XCIsIG9uQ29weVNsaWRlLmJpbmQobnVsbCwgZ2V0SW5kZXgpKTtcbiAgICBsaXN0ZW4oXCIuYnV0dG9ucyAuc3dhcFwiLCBvblN3YXBTbGlkZS5iaW5kKG51bGwsZ2V0SW5kZXgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbGlzdGVuS2V5Ym9hcmQgOiBsaXN0ZW5LZXlib2FyZCxcbiAgICBsaXN0ZW5TbGlkZUNoYW5nZSA6IGxpc3RlblNsaWRlQ2hhbmdlLFxuICAgIGxpc3RlbkJ1dHRvbnMgOiBsaXN0ZW5CdXR0b25zXG59XG5cbiJdfQ==

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
            var index = document.querySelector(".buttons [type=number]").value;
            return parseInt(index) - 1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC9hcGkuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2NvZGUtbWlycm9yLXdyYXBwZXIuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2Z1bGxzY3JlZW4uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BhZ2luYXRpb24uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BvaW50bGVzcy5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvcHJlc2VudGF0aW9uLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC91aS5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvdXNlci1pbnRlcmFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gbG9hZChpZCwgY2IpIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9wZW4oXCJHRVRcIixcInRlc3QuanNvblwiLCB0cnVlKTtcbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24ocHJlc2VudGF0aW9uRGF0YSkge1xuICAgICAgICBjYihudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICB9XG4gICAgcmVxLnNlbmQobnVsbCk7XG59XG5cbmZ1bmN0aW9uIHNhdmUoZGF0YSwgY2IpIHtcbiAgICAvL1RPRE9cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbG9hZCA6IGxvYWQsXG4gICAgc2F2ZSA6IHNhdmVcbn1cbiIsIlxuZnVuY3Rpb24gaW5pdChvblRlbXBsYXRlQ2hhbmdlLCBodG1sLCBjc3MpIHtcbiAgICB2YXIgaHRtbEVkaXRvciA9IENvZGVNaXJyb3IoXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5odG1sXCIpLCB7XG4gICAgICAgICAgICAgICAgbW9kZSA6IFwiaHRtbG1peGVkXCIsXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBodG1sLFxuICAgICAgICAgICAgICAgIGxpbmVOdW1iZXJzIDogdHJ1ZVxuICAgICAgICB9KSxcbiAgICAgICAgY3NzRWRpdG9yID0gQ29kZU1pcnJvcihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmNzc1wiKSwge1xuICAgICAgICAgICAgICAgIG1vZGUgOiBcImNzc1wiLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogY3NzLFxuICAgICAgICAgICAgICAgIGxpbmVOdW1iZXJzIDogdHJ1ZVxuICAgICAgICB9KSxcbiAgICAgICAgb25DaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG9uVGVtcGxhdGVDaGFuZ2UoaHRtbEVkaXRvci5nZXRWYWx1ZSgpLCBjc3NFZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH07XG5cbiAgICBodG1sRWRpdG9yLm9uKFwiY2hhbmdlXCIsIG9uQ2hhbmdlKTtcbiAgICBjc3NFZGl0b3Iub24oXCJjaGFuZ2VcIiwgb25DaGFuZ2UpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0IDogaW5pdFxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsLm1velJlcXVlc3RGdWxsU2NyZWVuKVxuICAgICAgICBlbC5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpO1xuICAgIGVsc2UgaWYgKGVsLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKVxuICAgICAgICBlbC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbigpO1xuICAgIGVsc2UgaWYgKGVsLnJlcXVlc3RGdWxsU2NyZWVuKVxuICAgICAgICBlbC5yZXF1ZXN0RnVsbFNjcmVlbjtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob25DaGFuZ2UpIHtcblxuICAgIHZhciBpbmRleCA9IDAsXG5cbiAgICAgICAgbmV4dCA9IGZ1bmN0aW9uKGhhc05leHQpIHtcbiAgICAgICAgICAgIGlmIChoYXNOZXh0KGluZGV4KSkge1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ29UbyA9IGZ1bmN0aW9uKGdldEdvVG9JbmRleCkge1xuICAgICAgICAgICAgaW5kZXggPSBnZXRHb1RvSW5kZXgoKTtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dCA6IG5leHQsXG4gICAgICAgIHByZXZpb3VzIDogcHJldmlvdXMsXG4gICAgICAgIGdvVG8gOiBnb1RvLFxuICAgICAgICBnZXRJbmRleCA6IGdldEluZGV4XG4gICAgfVxufVxuXG4iLCJ2YXIgUHJlc2VudGF0aW9uID0gcmVxdWlyZShcIi4vcHJlc2VudGF0aW9uLmpzXCIpLFxuICAgIHVzZXJJbnRlcmFjdGlvbiA9IHJlcXVpcmUoXCIuL3VzZXItaW50ZXJhY3Rpb25zLmpzXCIpLFxuICAgIGNvZGVNaXJyb3JXcmFwcGVyID0gcmVxdWlyZShcIi4vY29kZS1taXJyb3Itd3JhcHBlci5qc1wiKSxcbiAgICBlbnRlckZ1bGxzY3JlZW4gPSByZXF1aXJlKFwiLi9mdWxsc2NyZWVuLmpzXCIpLFxuICAgIGFwaSA9IHJlcXVpcmUoXCIuL2FwaS5qc1wiKSxcbiAgICB1aSA9IHJlcXVpcmUoXCIuL3VpLmpzXCIpO1xuXG5mdW5jdGlvbiBtYWluKCkge1xuICAgIC8vVE9ETyA6IHJldHJpZXZlIElEIGZyb20gcXVlcnkgc3RyaW5nXG4gICAgYXBpLmxvYWQoMTIzNCwgZnVuY3Rpb24oZXJyLCBwcmVzZW50YXRpb25EYXRhKSB7XG4gICAgICAgIHZhciBwcmVzZW50YXRpb24gPSBQcmVzZW50YXRpb24odWkucmVmcmVzaCk7XG5cbiAgICAgICAgdXNlckludGVyYWN0aW9uLmxpc3RlbktleWJvYXJkKHVpLnRvZ2dsZUZvcm0uYmluZChudWxsLCBcIi5jb250ZW50XCIpLCBwcmVzZW50YXRpb24ubmV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgdWkudG9nZ2xlRm9ybS5iaW5kKG51bGwsIFwiLnRlbXBsYXRlXCIpLCBwcmVzZW50YXRpb24ucHJldmlvdXMpO1xuXG4gICAgICAgIHVzZXJJbnRlcmFjdGlvbi5saXN0ZW5TbGlkZUNoYW5nZShwcmVzZW50YXRpb24udXBkYXRlU2xpZGUpO1xuXG4gICAgICAgIHVzZXJJbnRlcmFjdGlvbi5saXN0ZW5CdXR0b25zKHByZXNlbnRhdGlvbi5pbnNlcnRTbGlkZSwgcHJlc2VudGF0aW9uLmRlbGV0ZVNsaWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW50YXRpb24uZ29Ub1NsaWRlLCBwcmVzZW50YXRpb24uY29weVNsaWRlLCBwcmVzZW50YXRpb24uc3dhcFNsaWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRlckZ1bGxzY3JlZW4uYmluZChudWxsLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNsaWRlLWNvbnRhaW5lclwiKSkpO1xuXG4gICAgICAgIHZhciB0ZXN0ID0gSlNPTi5wYXJzZShwcmVzZW50YXRpb25EYXRhKTtcbiAgICAgICAgY29kZU1pcnJvcldyYXBwZXIuaW5pdChwcmVzZW50YXRpb24udXBkYXRlVGVtcGxhdGUsIHRlc3QudGVtcGxhdGUuaHRtbCwgdGVzdC50ZW1wbGF0ZS5jc3MpO1xuXG4gICAgICAgIHByZXNlbnRhdGlvbi5mcm9tSlNPTihwcmVzZW50YXRpb25EYXRhKTtcbiAgICB9KTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW47XG4iLCJ2YXIgUGFnaW5hdGlvbiA9IHJlcXVpcmUoXCIuL3BhZ2luYXRpb24uanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9uQ2hhbmdlKSB7XG5cbiAgICB2YXIgZGF0YSA9IHt9LFxuXG4gICAgICAgIHJlZnJlc2ggPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgb25DaGFuZ2UoZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0sXG4gICAgICAgICAgICAgICAgICAgICBkYXRhLnRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICAgeyB0b3RhbCA6IGRhdGEuc2xpZGVzLmxlbmd0aCwgY3VycmVudCA6IGdldEluZGV4KCkgKyAxfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhZ2luYXRpb24gPSBQYWdpbmF0aW9uKHJlZnJlc2gpLFxuXG4gICAgICAgIGdldEluZGV4ID0gcGFnaW5hdGlvbi5nZXRJbmRleCxcblxuICAgICAgICB1cGRhdGVTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICAgICAgZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0gPSBzbGlkZTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnNlcnRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRhdGEuc2xpZGVzLnNwbGljZShnZXRJbmRleCgpLCAwLCBjcmVhdGVTbGlkZSgpKTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzd2FwU2xpZGUgPSBmdW5jdGlvbiAoZ2V0U3dhcEluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc3dhcHBlZFNsaWRlID0gZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0sXG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgID0gZGF0YS5zbGlkZXNbZ2V0U3dhcEluZGV4KCldO1xuXG4gICAgICAgICAgICBkYXRhLnNsaWRlc1tnZXRJbmRleCgpXSA9IHRhcmdldFNsaWRlO1xuICAgICAgICAgICAgZGF0YS5zbGlkZXNbZ2V0U3dhcEluZGV4KCldID0gc3dhcHBlZFNsaWRlO1xuICAgICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlbGV0ZVNsaWRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGRhdGEuc2xpZGVzLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIGRhdGEuc2xpZGVzLnNwbGljZShnZXRJbmRleCgpLCAxKTtcblxuICAgICAgICAgICAgaWYgKGRhdGEuc2xpZGVzLmxlbmd0aCA9PT0gZ2V0SW5kZXgoKSkge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRpb24ucHJldmlvdXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb3B5U2xpZGUgPSBmdW5jdGlvbiAoZ2V0Q29weUluZGV4KSB7XG4gICAgICAgICAgICBkYXRhLnNsaWRlcy5zcGxpY2UoXG4gICAgICAgICAgICAgICBnZXRJbmRleCgpLCAxLFxuICAgICAgICAgICAgICAgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkYXRhLnNsaWRlc1tnZXRDb3B5SW5kZXgoKV0pKVxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlVGVtcGxhdGUgPSBmdW5jdGlvbihodG1sLCBjc3MpIHtcbiAgICAgICAgICAgIGRhdGEudGVtcGxhdGUuaHRtbCA9IGh0bWw7XG4gICAgICAgICAgICBkYXRhLnRlbXBsYXRlLmNzcz0gY3NzO1xuICAgICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc05leHQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA8IGRhdGEuc2xpZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbUpTT04gPSBmdW5jdGlvbihqc29uKSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcbiAgICAgICAgICAgICAgICBpbWFnZSA6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlZnJlc2ggOiByZWZyZXNoLFxuICAgICAgICB1cGRhdGVTbGlkZSA6IHVwZGF0ZVNsaWRlLFxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSA6IHVwZGF0ZVRlbXBsYXRlLFxuICAgICAgICB0b0pTT04gOiB0b0pTT04sXG4gICAgICAgIGZyb21KU09OIDogZnJvbUpTT04sXG4gICAgICAgIG5leHQgOiBwYWdpbmF0aW9uLm5leHQuYmluZChudWxsLCBoYXNOZXh0KSxcbiAgICAgICAgcHJldmlvdXMgOiBwYWdpbmF0aW9uLnByZXZpb3VzLFxuICAgICAgICBnb1RvU2xpZGUgOiBwYWdpbmF0aW9uLmdvVG8sXG4gICAgICAgIHN3YXBTbGlkZSA6IHN3YXBTbGlkZSxcbiAgICAgICAgY29weVNsaWRlIDogY29weVNsaWRlLFxuICAgICAgICBkZWxldGVTbGlkZSA6IGRlbGV0ZVNsaWRlLFxuICAgICAgICBpbnNlcnRTbGlkZSA6IGluc2VydFNsaWRlXG4gICAgfVxufVxuXG4iLCJcbmZ1bmN0aW9uIHJlZnJlc2goc2xpZGUsIHRlbXBsYXRlLCBwcm9ncmVzcykge1xuICAgIHVwZGF0ZVN0eWxlKHRlbXBsYXRlLmNzcyk7XG4gICAgcmVuZGVyU2xpZGUoc2xpZGUsIHRlbXBsYXRlLmh0bWwsIHRlbXBsYXRlLmZpZWxkcyk7XG4gICAgdXBkYXRlRm9ybXMoc2xpZGUsIHRlbXBsYXRlKTtcbiAgICB1cGRhdGVQcm9ncmVzcyhwcm9ncmVzcyk7XG59XG5cblxuZnVuY3Rpb24gcmVuZGVyU2xpZGUoc2xpZGUsIGh0bWwsIGZpZWxkcykge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG4gICAgZGl2LmlubmVySFRNTCA9IGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24oaHRtbCwgZmllbGQpIHtcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShcInt7XCIgKyBmaWVsZC5uYW1lICsgXCJ9fVwiLCBzbGlkZVtmaWVsZC5uYW1lXSk7XG4gICAgfSwgaHRtbCk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNsaWRlLWNvbnRhaW5lclwiKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2xpZGUtY29udGFpbmVyXCIpLmFwcGVuZENoaWxkKGRpdik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGNzcykge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzdHlsZVtkYXRhLWNzc11cIik7XG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgICBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgc3R5bGUuc2V0QXR0cmlidXRlKFwiZGF0YS1jc3NcIiwgXCJcIik7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIH1cbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGNzcztcbn1cblxuZnVuY3Rpb24gdXBkYXRlRm9ybXMoc2xpZGUsIHRlbXBsYXRlKSB7XG4gICAgYnVpbGRDb250ZW50Rm9ybShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIiksIHRlbXBsYXRlLmZpZWxkcyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50IHRleHRhcmVhXCIpLnZhbHVlID0gc2xpZGUudGV4dDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQgW3R5cGU9dXJsXVwiKS52YWx1ZSA9IHNsaWRlLmltYWdlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmh0bWxcIikudmFsdWUgPSB0ZW1wbGF0ZS5odG1sO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmNzc1wiKS52YWx1ZSA9IHRlbXBsYXRlLmNzcztcbn1cblxuZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnByb2dyZXNzXCIpXG4gICAgICAgICAgICAuaW5uZXJIVE1MID0gcHJvZ3Jlc3MuY3VycmVudCArIFwiIC8gXCIgKyBwcm9ncmVzcy50b3RhbDtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlRm9ybShzZWxlY3Rvcikge1xuICAgIHZhciBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgZm9ybS5zdHlsZS52aXNpYmlsaXR5ID09PSBcImhpZGRlblwiID8gZm9ybS5zdHlsZS52aXNpYmlsaXR5ID0gXCJcIiA6IGZvcm0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ29udGVudEZvcm0oY29udGVudEZvcm0sIGZpZWxkcykge1xuXG4gICAgaWYgKGNvbnRlbnRGb3JtLmZpcnN0RWxlbWVudENoaWxkKVxuICAgICAgICByZXR1cm47XG5cbiAgICBjb250ZW50Rm9ybS5pbm5lckhUTUwgPSBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKGh0bWwsIGZpZWxkKSB7XG5cbiAgICAgICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlwiO1xuICAgICAgICBodG1sICs9IFwiPGxhYmVsPlwiICsgZmllbGQubmFtZSArIFwiPC9sYWJlbD5cIjtcbiAgICAgICAgc3dpdGNoIChmaWVsZC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidGV4dGFyZWFcIjpcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRleHRhcmVhIG5hbWU9XFxcIlwiICsgZmllbGQubmFtZSArIFwiXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj48L3RleHRhcmVhPlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8aW5wdXQgdHlwZT1cXFwiXCIgKyBmaWVsZC50eXBlICsgXCJcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIG5hbWU9XFxcIlwiICsgZmllbGQubmFtZSArIFwiXFxcIiAvPlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gXCI8L2Rpdj5cIjtcblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LCBcIlwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVmcmVzaCA6IHJlZnJlc2gsXG4gICAgdG9nZ2xlRm9ybSA6IHRvZ2dsZUZvcm1cbn1cblxuIiwiXG5mdW5jdGlvbiBsaXN0ZW5LZXlib2FyZChvblVwLCBvblJpZ2h0LCBvbkRvd24sIG9uTGVmdCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgICAgICBvbkxlZnQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgICAgICBvblVwKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICAgICAgb25SaWdodCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgICAgIG9uRG93bigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxpc3RlblNsaWRlQ2hhbmdlKHVwZGF0ZVNsaWRlKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpXG4gICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnB1dHMgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5jb250ZW50IHRleHRhcmVhLCAuY29udGVudCBpbnB1dFwiKSxcbiAgICAgICAgICAgIGNvbnRlbnQgPSBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoaW5wdXRzLCBmdW5jdGlvbihjb250ZW50LCBpbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgICAgIH0sIHt9KTtcblxuICAgICAgICB1cGRhdGVTbGlkZShjb250ZW50KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbGlzdGVuQnV0dG9ucyhvbkluc2VydCwgb25EZWxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgIG9uR29Ub1NsaWRlLCBvbkNvcHlTbGlkZSwgb25Td2FwU2xpZGUsXG4gICAgICAgICAgICAgICAgICAgICAgIG9uRnVsbHNjcmVlbikge1xuXG4gICAgdmFyIGxpc3RlbiA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY2IpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2IpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnV0dG9ucyBbdHlwZT1udW1iZXJdXCIpLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KGluZGV4KSAtIDE7XG4gICAgICAgIH1cblxuICAgIGxpc3RlbihcIi5idXR0b25zIC5pbnNlcnRcIiwgb25JbnNlcnQpO1xuICAgIGxpc3RlbihcIi5idXR0b25zIC5kZWxldGVcIiwgb25EZWxldGUpO1xuICAgIGxpc3RlbihcIi5idXR0b25zIC5mdWxsc2NyZWVuXCIsIG9uRnVsbHNjcmVlbik7XG4gICAgbGlzdGVuKFwiLmJ1dHRvbnMgLmdvdG9cIiwgb25Hb1RvU2xpZGUuYmluZChudWxsLCBnZXRJbmRleCkpO1xuICAgIGxpc3RlbihcIi5idXR0b25zIC5jb3B5XCIsIG9uQ29weVNsaWRlLmJpbmQobnVsbCwgZ2V0SW5kZXgpKTtcbiAgICBsaXN0ZW4oXCIuYnV0dG9ucyAuc3dhcFwiLCBvblN3YXBTbGlkZS5iaW5kKG51bGwsZ2V0SW5kZXgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbGlzdGVuS2V5Ym9hcmQgOiBsaXN0ZW5LZXlib2FyZCxcbiAgICBsaXN0ZW5TbGlkZUNoYW5nZSA6IGxpc3RlblNsaWRlQ2hhbmdlLFxuICAgIGxpc3RlbkJ1dHRvbnMgOiBsaXN0ZW5CdXR0b25zXG59XG5cbiJdfQ==

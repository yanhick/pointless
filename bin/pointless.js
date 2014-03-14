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

        userInteraction.listenButtons(presentation.deleteSlide,
                                      enterFullscreen.bind(null, document.querySelector(".slide-container")));

        var test = JSON.parse(presentationData);
        codeMirrorWrapper.init(presentation.updateTemplate, test.template.html, test.template.css);

        presentation.fromJSON(presentationData);
    });
}

window.onload = main;

},{"./api.js":1,"./code-mirror-wrapper.js":2,"./fullscreen.js":3,"./presentation.js":6,"./ui.js":7,"./user-interactions.js":8}],6:[function(require,module,exports){
var Pagination = require("./pagination.js");

function Presentation(onChange) {

    var data = {},

        refresh = function() {
            if (!data.slides[getIndex()])
                data.slides[getIndex()] = createSlide();

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

        deleteSlide = function () {
            if (data.slides.length === 1)
                return;

            data.slides.splice(getIndex(), 1);

            if (data.slides.length === getIndex()) {
                pagination.previous();
                return;
            }

            refresh();
        }

        updateTemplate = function(html, css) {
            data.template.html = html;
            data.template.css= css;
            refresh();
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
        next : pagination.next,
        previous : pagination.previous,
        deleteSlide : deleteSlide
    }
}

module.exports = Presentation;

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

function listenButtons(onDelete, onFullscreen) {
    document.querySelector(".buttons .delete")
            .addEventListener("click", onDelete);
    document.querySelector(".buttons .fullscreen")
            .addEventListener("click", onFullscreen);
}

module.exports = {
    listenKeyboard : listenKeyboard,
    listenSlideChange : listenSlideChange,
    listenButtons : listenButtons
}


},{}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC9hcGkuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2NvZGUtbWlycm9yLXdyYXBwZXIuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2Z1bGxzY3JlZW4uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BhZ2luYXRpb24uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BvaW50bGVzcy5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvcHJlc2VudGF0aW9uLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC91aS5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvdXNlci1pbnRlcmFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBsb2FkKGlkLCBjYikge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXEub3BlbihcIkdFVFwiLFwidGVzdC5qc29uXCIsIHRydWUpO1xuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbihwcmVzZW50YXRpb25EYXRhKSB7XG4gICAgICAgIGNiKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgIH1cbiAgICByZXEuc2VuZChudWxsKTtcbn1cblxuZnVuY3Rpb24gc2F2ZShkYXRhLCBjYikge1xuICAgIC8vVE9ET1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsb2FkIDogbG9hZCxcbiAgICBzYXZlIDogc2F2ZVxufVxuIiwiXG5mdW5jdGlvbiBpbml0KG9uVGVtcGxhdGVDaGFuZ2UsIGh0bWwsIGNzcykge1xuICAgIHZhciBodG1sRWRpdG9yID0gQ29kZU1pcnJvcihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmh0bWxcIiksIHtcbiAgICAgICAgICAgICAgICBtb2RlIDogXCJodG1sbWl4ZWRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGh0bWwsXG4gICAgICAgICAgICAgICAgbGluZU51bWJlcnMgOiB0cnVlXG4gICAgICAgIH0pLFxuICAgICAgICBjc3NFZGl0b3IgPSBDb2RlTWlycm9yKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuY3NzXCIpLCB7XG4gICAgICAgICAgICAgICAgbW9kZSA6IFwiY3NzXCIsXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBjc3MsXG4gICAgICAgICAgICAgICAgbGluZU51bWJlcnMgOiB0cnVlXG4gICAgICAgIH0pLFxuICAgICAgICBvbkNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb25UZW1wbGF0ZUNoYW5nZShodG1sRWRpdG9yLmdldFZhbHVlKCksIGNzc0VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgfTtcblxuICAgIGh0bWxFZGl0b3Iub24oXCJjaGFuZ2VcIiwgb25DaGFuZ2UpO1xuICAgIGNzc0VkaXRvci5vbihcImNoYW5nZVwiLCBvbkNoYW5nZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQgOiBpbml0XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoZWwubW96UmVxdWVzdEZ1bGxTY3JlZW4pXG4gICAgICAgIGVsLm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG4gICAgZWxzZSBpZiAoZWwud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4pXG4gICAgICAgIGVsLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKCk7XG4gICAgZWxzZSBpZiAoZWwucmVxdWVzdEZ1bGxTY3JlZW4pXG4gICAgICAgIGVsLnJlcXVlc3RGdWxsU2NyZWVuO1xufVxuXG4iLCJmdW5jdGlvbiBQYWdpbmF0aW9uKG9uQ2hhbmdlKSB7XG5cbiAgICB2YXIgaW5kZXggPSAwLFxuXG4gICAgICAgIG5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBvbkNoYW5nZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgb25DaGFuZ2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dCA6IG5leHQsXG4gICAgICAgIHByZXZpb3VzIDogcHJldmlvdXMsXG4gICAgICAgIGdldEluZGV4IDogZ2V0SW5kZXhcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdGlvbjtcbiIsInZhciBQcmVzZW50YXRpb24gPSByZXF1aXJlKFwiLi9wcmVzZW50YXRpb24uanNcIiksXG4gICAgdXNlckludGVyYWN0aW9uID0gcmVxdWlyZShcIi4vdXNlci1pbnRlcmFjdGlvbnMuanNcIiksXG4gICAgY29kZU1pcnJvcldyYXBwZXIgPSByZXF1aXJlKFwiLi9jb2RlLW1pcnJvci13cmFwcGVyLmpzXCIpLFxuICAgIGVudGVyRnVsbHNjcmVlbiA9IHJlcXVpcmUoXCIuL2Z1bGxzY3JlZW4uanNcIiksXG4gICAgYXBpID0gcmVxdWlyZShcIi4vYXBpLmpzXCIpLFxuICAgIHVpID0gcmVxdWlyZShcIi4vdWkuanNcIik7XG5cbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgLy9UT0RPIDogcmV0cmlldmUgSUQgZnJvbSBxdWVyeSBzdHJpbmdcbiAgICBhcGkubG9hZCgxMjM0LCBmdW5jdGlvbihlcnIsIHByZXNlbnRhdGlvbkRhdGEpIHtcbiAgICAgICAgdmFyIHByZXNlbnRhdGlvbiA9IFByZXNlbnRhdGlvbih1aS5yZWZyZXNoKTtcblxuICAgICAgICB1c2VySW50ZXJhY3Rpb24ubGlzdGVuS2V5Ym9hcmQodWkudG9nZ2xlRm9ybS5iaW5kKG51bGwsIFwiLmNvbnRlbnRcIiksIHByZXNlbnRhdGlvbi5uZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICB1aS50b2dnbGVGb3JtLmJpbmQobnVsbCwgXCIudGVtcGxhdGVcIiksIHByZXNlbnRhdGlvbi5wcmV2aW91cyk7XG5cbiAgICAgICAgdXNlckludGVyYWN0aW9uLmxpc3RlblNsaWRlQ2hhbmdlKHByZXNlbnRhdGlvbi51cGRhdGVTbGlkZSk7XG5cbiAgICAgICAgdXNlckludGVyYWN0aW9uLmxpc3RlbkJ1dHRvbnMocHJlc2VudGF0aW9uLmRlbGV0ZVNsaWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRlckZ1bGxzY3JlZW4uYmluZChudWxsLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNsaWRlLWNvbnRhaW5lclwiKSkpO1xuXG4gICAgICAgIHZhciB0ZXN0ID0gSlNPTi5wYXJzZShwcmVzZW50YXRpb25EYXRhKTtcbiAgICAgICAgY29kZU1pcnJvcldyYXBwZXIuaW5pdChwcmVzZW50YXRpb24udXBkYXRlVGVtcGxhdGUsIHRlc3QudGVtcGxhdGUuaHRtbCwgdGVzdC50ZW1wbGF0ZS5jc3MpO1xuXG4gICAgICAgIHByZXNlbnRhdGlvbi5mcm9tSlNPTihwcmVzZW50YXRpb25EYXRhKTtcbiAgICB9KTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW47XG4iLCJ2YXIgUGFnaW5hdGlvbiA9IHJlcXVpcmUoXCIuL3BhZ2luYXRpb24uanNcIik7XG5cbmZ1bmN0aW9uIFByZXNlbnRhdGlvbihvbkNoYW5nZSkge1xuXG4gICAgdmFyIGRhdGEgPSB7fSxcblxuICAgICAgICByZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGEuc2xpZGVzW2dldEluZGV4KCldKVxuICAgICAgICAgICAgICAgIGRhdGEuc2xpZGVzW2dldEluZGV4KCldID0gY3JlYXRlU2xpZGUoKTtcblxuICAgICAgICAgICAgb25DaGFuZ2UoZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0sXG4gICAgICAgICAgICAgICAgICAgICBkYXRhLnRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICAgeyB0b3RhbCA6IGRhdGEuc2xpZGVzLmxlbmd0aCwgY3VycmVudCA6IGdldEluZGV4KCkgKyAxfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhZ2luYXRpb24gPSBQYWdpbmF0aW9uKHJlZnJlc2gpLFxuXG4gICAgICAgIGdldEluZGV4ID0gcGFnaW5hdGlvbi5nZXRJbmRleCxcblxuICAgICAgICB1cGRhdGVTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICAgICAgZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0gPSBzbGlkZTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWxldGVTbGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLnNsaWRlcy5sZW5ndGggPT09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBkYXRhLnNsaWRlcy5zcGxpY2UoZ2V0SW5kZXgoKSwgMSk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnNsaWRlcy5sZW5ndGggPT09IGdldEluZGV4KCkpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uLnByZXZpb3VzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGh0bWwsIGNzcykge1xuICAgICAgICAgICAgZGF0YS50ZW1wbGF0ZS5odG1sID0gaHRtbDtcbiAgICAgICAgICAgIGRhdGEudGVtcGxhdGUuY3NzPSBjc3M7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbUpTT04gPSBmdW5jdGlvbihqc29uKSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcbiAgICAgICAgICAgICAgICBpbWFnZSA6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlZnJlc2ggOiByZWZyZXNoLFxuICAgICAgICB1cGRhdGVTbGlkZSA6IHVwZGF0ZVNsaWRlLFxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSA6IHVwZGF0ZVRlbXBsYXRlLFxuICAgICAgICB0b0pTT04gOiB0b0pTT04sXG4gICAgICAgIGZyb21KU09OIDogZnJvbUpTT04sXG4gICAgICAgIG5leHQgOiBwYWdpbmF0aW9uLm5leHQsXG4gICAgICAgIHByZXZpb3VzIDogcGFnaW5hdGlvbi5wcmV2aW91cyxcbiAgICAgICAgZGVsZXRlU2xpZGUgOiBkZWxldGVTbGlkZVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmVzZW50YXRpb247XG4iLCJcbmZ1bmN0aW9uIHJlZnJlc2goc2xpZGUsIHRlbXBsYXRlLCBwcm9ncmVzcykge1xuICAgIHVwZGF0ZVN0eWxlKHRlbXBsYXRlLmNzcyk7XG4gICAgcmVuZGVyU2xpZGUoc2xpZGUsIHRlbXBsYXRlLmh0bWwsIHRlbXBsYXRlLmZpZWxkcyk7XG4gICAgdXBkYXRlRm9ybXMoc2xpZGUsIHRlbXBsYXRlKTtcbiAgICB1cGRhdGVQcm9ncmVzcyhwcm9ncmVzcyk7XG59XG5cblxuZnVuY3Rpb24gcmVuZGVyU2xpZGUoc2xpZGUsIGh0bWwsIGZpZWxkcykge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG4gICAgZGl2LmlubmVySFRNTCA9IGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24oaHRtbCwgZmllbGQpIHtcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShcInt7XCIgKyBmaWVsZC5uYW1lICsgXCJ9fVwiLCBzbGlkZVtmaWVsZC5uYW1lXSk7XG4gICAgfSwgaHRtbCk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNsaWRlLWNvbnRhaW5lclwiKS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2xpZGUtY29udGFpbmVyXCIpLmFwcGVuZENoaWxkKGRpdik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGNzcykge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzdHlsZVtkYXRhLWNzc11cIik7XG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgICBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgc3R5bGUuc2V0QXR0cmlidXRlKFwiZGF0YS1jc3NcIiwgXCJcIik7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIH1cbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGNzcztcbn1cblxuZnVuY3Rpb24gdXBkYXRlRm9ybXMoc2xpZGUsIHRlbXBsYXRlKSB7XG4gICAgYnVpbGRDb250ZW50Rm9ybShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIiksIHRlbXBsYXRlLmZpZWxkcyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50IHRleHRhcmVhXCIpLnZhbHVlID0gc2xpZGUudGV4dDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQgW3R5cGU9dXJsXVwiKS52YWx1ZSA9IHNsaWRlLmltYWdlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmh0bWxcIikudmFsdWUgPSB0ZW1wbGF0ZS5odG1sO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmNzc1wiKS52YWx1ZSA9IHRlbXBsYXRlLmNzcztcbn1cblxuZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnByb2dyZXNzXCIpXG4gICAgICAgICAgICAuaW5uZXJIVE1MID0gcHJvZ3Jlc3MuY3VycmVudCArIFwiIC8gXCIgKyBwcm9ncmVzcy50b3RhbDtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlRm9ybShzZWxlY3Rvcikge1xuICAgIHZhciBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgZm9ybS5zdHlsZS52aXNpYmlsaXR5ID09PSBcImhpZGRlblwiID8gZm9ybS5zdHlsZS52aXNpYmlsaXR5ID0gXCJcIiA6IGZvcm0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ29udGVudEZvcm0oY29udGVudEZvcm0sIGZpZWxkcykge1xuXG4gICAgaWYgKGNvbnRlbnRGb3JtLmZpcnN0RWxlbWVudENoaWxkKVxuICAgICAgICByZXR1cm47XG5cbiAgICBjb250ZW50Rm9ybS5pbm5lckhUTUwgPSBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKGh0bWwsIGZpZWxkKSB7XG5cbiAgICAgICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlwiO1xuICAgICAgICBodG1sICs9IFwiPGxhYmVsPlwiICsgZmllbGQubmFtZSArIFwiPC9sYWJlbD5cIjtcbiAgICAgICAgc3dpdGNoIChmaWVsZC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidGV4dGFyZWFcIjpcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRleHRhcmVhIG5hbWU9XFxcIlwiICsgZmllbGQubmFtZSArIFwiXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIj48L3RleHRhcmVhPlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8aW5wdXQgdHlwZT1cXFwiXCIgKyBmaWVsZC50eXBlICsgXCJcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIG5hbWU9XFxcIlwiICsgZmllbGQubmFtZSArIFwiXFxcIiAvPlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gXCI8L2Rpdj5cIjtcblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LCBcIlwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVmcmVzaCA6IHJlZnJlc2gsXG4gICAgdG9nZ2xlRm9ybSA6IHRvZ2dsZUZvcm1cbn1cblxuIiwiXG5mdW5jdGlvbiBsaXN0ZW5LZXlib2FyZChvblVwLCBvblJpZ2h0LCBvbkRvd24sIG9uTGVmdCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgICAgICBvbkxlZnQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgICAgICBvblVwKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICAgICAgb25SaWdodCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgICAgIG9uRG93bigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxpc3RlblNsaWRlQ2hhbmdlKHVwZGF0ZVNsaWRlKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpXG4gICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnB1dHMgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5jb250ZW50IHRleHRhcmVhLCAuY29udGVudCBpbnB1dFwiKSxcbiAgICAgICAgICAgIGNvbnRlbnQgPSBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoaW5wdXRzLCBmdW5jdGlvbihjb250ZW50LCBpbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgICAgIH0sIHt9KTtcblxuICAgICAgICB1cGRhdGVTbGlkZShjb250ZW50KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbGlzdGVuQnV0dG9ucyhvbkRlbGV0ZSwgb25GdWxsc2NyZWVuKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idXR0b25zIC5kZWxldGVcIilcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25EZWxldGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnV0dG9ucyAuZnVsbHNjcmVlblwiKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvbkZ1bGxzY3JlZW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsaXN0ZW5LZXlib2FyZCA6IGxpc3RlbktleWJvYXJkLFxuICAgIGxpc3RlblNsaWRlQ2hhbmdlIDogbGlzdGVuU2xpZGVDaGFuZ2UsXG4gICAgbGlzdGVuQnV0dG9ucyA6IGxpc3RlbkJ1dHRvbnNcbn1cblxuIl19

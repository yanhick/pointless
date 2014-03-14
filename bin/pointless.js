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

},{}],4:[function(require,module,exports){
var Presentation = require("./presentation.js"),
    userInteraction = require("./user-interactions.js"),
    codeMirrorWrapper = require("./code-mirror-wrapper.js"),
    api = require("./api.js"),
    ui = require("./ui.js");

function main() {
    //TODO : retrieve ID from query string
    api.load(1234, function(err, presentationData) {
        var presentation = Presentation(ui.refresh);

        userInteraction.listenKeyboard(ui.toggleForm.bind(null, ".content"), presentation.next,
                       ui.toggleForm.bind(null, ".template"), presentation.previous);

        userInteraction.listenSlideChange(presentation.updateSlide);

        userInteraction.listenButtons(presentation.deleteSlide);

        var test = JSON.parse(presentationData);
        codeMirrorWrapper.init(presentation.updateTemplate, test.template.html, test.template.css);

        presentation.fromJSON(presentationData);
    });
}

window.onload = main;

},{"./api.js":1,"./code-mirror-wrapper.js":2,"./presentation.js":5,"./ui.js":6,"./user-interactions.js":7}],5:[function(require,module,exports){
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

},{"./pagination.js":3}],6:[function(require,module,exports){

function refresh(slide, template) {
    updateStyle(template.css);
    renderSlide(slide, template.html, template.fields);
    updateForms(slide, template);
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


},{}],7:[function(require,module,exports){

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

function listenButtons(onDelete) {
    document.querySelector(".buttons .delete")
            .addEventListener("click", onDelete);
}

module.exports = {
    listenKeyboard : listenKeyboard,
    listenSlideChange : listenSlideChange,
    listenButtons : listenButtons
}


},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC9hcGkuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2NvZGUtbWlycm9yLXdyYXBwZXIuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BhZ2luYXRpb24uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BvaW50bGVzcy5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvcHJlc2VudGF0aW9uLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC91aS5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvdXNlci1pbnRlcmFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIGxvYWQoaWQsIGNiKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vcGVuKFwiR0VUXCIsXCJ0ZXN0Lmpzb25cIiwgdHJ1ZSk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKHByZXNlbnRhdGlvbkRhdGEpIHtcbiAgICAgICAgY2IobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgfVxuICAgIHJlcS5zZW5kKG51bGwpO1xufVxuXG5mdW5jdGlvbiBzYXZlKGRhdGEsIGNiKSB7XG4gICAgLy9UT0RPXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxvYWQgOiBsb2FkLFxuICAgIHNhdmUgOiBzYXZlXG59XG4iLCJcbmZ1bmN0aW9uIGluaXQob25UZW1wbGF0ZUNoYW5nZSwgaHRtbCwgY3NzKSB7XG4gICAgdmFyIGh0bWxFZGl0b3IgPSBDb2RlTWlycm9yKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuaHRtbFwiKSwge1xuICAgICAgICAgICAgICAgIG1vZGUgOiBcImh0bWxtaXhlZFwiLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogaHRtbCxcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVycyA6IHRydWVcbiAgICAgICAgfSksXG4gICAgICAgIGNzc0VkaXRvciA9IENvZGVNaXJyb3IoXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5jc3NcIiksIHtcbiAgICAgICAgICAgICAgICBtb2RlIDogXCJjc3NcIixcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGNzcyxcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVycyA6IHRydWVcbiAgICAgICAgfSksXG4gICAgICAgIG9uQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvblRlbXBsYXRlQ2hhbmdlKGh0bWxFZGl0b3IuZ2V0VmFsdWUoKSwgY3NzRWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9O1xuXG4gICAgaHRtbEVkaXRvci5vbihcImNoYW5nZVwiLCBvbkNoYW5nZSk7XG4gICAgY3NzRWRpdG9yLm9uKFwiY2hhbmdlXCIsIG9uQ2hhbmdlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdCA6IGluaXRcbn1cbiIsImZ1bmN0aW9uIFBhZ2luYXRpb24ob25DaGFuZ2UpIHtcblxuICAgIHZhciBpbmRleCA9IDAsXG5cbiAgICAgICAgbmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIG9uQ2hhbmdlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJldmlvdXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICBvbkNoYW5nZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEluZGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBuZXh0IDogbmV4dCxcbiAgICAgICAgcHJldmlvdXMgOiBwcmV2aW91cyxcbiAgICAgICAgZ2V0SW5kZXggOiBnZXRJbmRleFxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdpbmF0aW9uO1xuIiwidmFyIFByZXNlbnRhdGlvbiA9IHJlcXVpcmUoXCIuL3ByZXNlbnRhdGlvbi5qc1wiKSxcbiAgICB1c2VySW50ZXJhY3Rpb24gPSByZXF1aXJlKFwiLi91c2VyLWludGVyYWN0aW9ucy5qc1wiKSxcbiAgICBjb2RlTWlycm9yV3JhcHBlciA9IHJlcXVpcmUoXCIuL2NvZGUtbWlycm9yLXdyYXBwZXIuanNcIiksXG4gICAgYXBpID0gcmVxdWlyZShcIi4vYXBpLmpzXCIpLFxuICAgIHVpID0gcmVxdWlyZShcIi4vdWkuanNcIik7XG5cbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgLy9UT0RPIDogcmV0cmlldmUgSUQgZnJvbSBxdWVyeSBzdHJpbmdcbiAgICBhcGkubG9hZCgxMjM0LCBmdW5jdGlvbihlcnIsIHByZXNlbnRhdGlvbkRhdGEpIHtcbiAgICAgICAgdmFyIHByZXNlbnRhdGlvbiA9IFByZXNlbnRhdGlvbih1aS5yZWZyZXNoKTtcblxuICAgICAgICB1c2VySW50ZXJhY3Rpb24ubGlzdGVuS2V5Ym9hcmQodWkudG9nZ2xlRm9ybS5iaW5kKG51bGwsIFwiLmNvbnRlbnRcIiksIHByZXNlbnRhdGlvbi5uZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICB1aS50b2dnbGVGb3JtLmJpbmQobnVsbCwgXCIudGVtcGxhdGVcIiksIHByZXNlbnRhdGlvbi5wcmV2aW91cyk7XG5cbiAgICAgICAgdXNlckludGVyYWN0aW9uLmxpc3RlblNsaWRlQ2hhbmdlKHByZXNlbnRhdGlvbi51cGRhdGVTbGlkZSk7XG5cbiAgICAgICAgdXNlckludGVyYWN0aW9uLmxpc3RlbkJ1dHRvbnMocHJlc2VudGF0aW9uLmRlbGV0ZVNsaWRlKTtcblxuICAgICAgICB2YXIgdGVzdCA9IEpTT04ucGFyc2UocHJlc2VudGF0aW9uRGF0YSk7XG4gICAgICAgIGNvZGVNaXJyb3JXcmFwcGVyLmluaXQocHJlc2VudGF0aW9uLnVwZGF0ZVRlbXBsYXRlLCB0ZXN0LnRlbXBsYXRlLmh0bWwsIHRlc3QudGVtcGxhdGUuY3NzKTtcblxuICAgICAgICBwcmVzZW50YXRpb24uZnJvbUpTT04ocHJlc2VudGF0aW9uRGF0YSk7XG4gICAgfSk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluO1xuIiwidmFyIFBhZ2luYXRpb24gPSByZXF1aXJlKFwiLi9wYWdpbmF0aW9uLmpzXCIpO1xuXG5mdW5jdGlvbiBQcmVzZW50YXRpb24ob25DaGFuZ2UpIHtcblxuICAgIHZhciBkYXRhID0ge30sXG5cbiAgICAgICAgcmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFkYXRhLnNsaWRlc1tnZXRJbmRleCgpXSlcbiAgICAgICAgICAgICAgICBkYXRhLnNsaWRlc1tnZXRJbmRleCgpXSA9IGNyZWF0ZVNsaWRlKCk7XG5cbiAgICAgICAgICAgIG9uQ2hhbmdlKGRhdGEuc2xpZGVzW2dldEluZGV4KCldLCBkYXRhLnRlbXBsYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYWdpbmF0aW9uID0gUGFnaW5hdGlvbihyZWZyZXNoKSxcblxuICAgICAgICBnZXRJbmRleCA9IHBhZ2luYXRpb24uZ2V0SW5kZXgsXG5cbiAgICAgICAgdXBkYXRlU2xpZGUgPSBmdW5jdGlvbiAoc2xpZGUpIHtcbiAgICAgICAgICAgIGRhdGEuc2xpZGVzW2dldEluZGV4KCldID0gc2xpZGU7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVsZXRlU2xpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5zbGlkZXMubGVuZ3RoID09PSAxKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgZGF0YS5zbGlkZXMuc3BsaWNlKGdldEluZGV4KCksIDEpO1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5zbGlkZXMubGVuZ3RoID09PSBnZXRJbmRleCgpKSB7XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbi5wcmV2aW91cygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlVGVtcGxhdGUgPSBmdW5jdGlvbihodG1sLCBjc3MpIHtcbiAgICAgICAgICAgIGRhdGEudGVtcGxhdGUuaHRtbCA9IGh0bWw7XG4gICAgICAgICAgICBkYXRhLnRlbXBsYXRlLmNzcz0gY3NzO1xuICAgICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb21KU09OID0gZnVuY3Rpb24oanNvbikge1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGV4dCA6IFwiXCIsXG4gICAgICAgICAgICAgICAgaW1hZ2UgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZWZyZXNoIDogcmVmcmVzaCxcbiAgICAgICAgdXBkYXRlU2xpZGUgOiB1cGRhdGVTbGlkZSxcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUgOiB1cGRhdGVUZW1wbGF0ZSxcbiAgICAgICAgdG9KU09OIDogdG9KU09OLFxuICAgICAgICBmcm9tSlNPTiA6IGZyb21KU09OLFxuICAgICAgICBuZXh0IDogcGFnaW5hdGlvbi5uZXh0LFxuICAgICAgICBwcmV2aW91cyA6IHBhZ2luYXRpb24ucHJldmlvdXMsXG4gICAgICAgIGRlbGV0ZVNsaWRlIDogZGVsZXRlU2xpZGVcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJlc2VudGF0aW9uO1xuIiwiXG5mdW5jdGlvbiByZWZyZXNoKHNsaWRlLCB0ZW1wbGF0ZSkge1xuICAgIHVwZGF0ZVN0eWxlKHRlbXBsYXRlLmNzcyk7XG4gICAgcmVuZGVyU2xpZGUoc2xpZGUsIHRlbXBsYXRlLmh0bWwsIHRlbXBsYXRlLmZpZWxkcyk7XG4gICAgdXBkYXRlRm9ybXMoc2xpZGUsIHRlbXBsYXRlKTtcbn1cblxuXG5mdW5jdGlvbiByZW5kZXJTbGlkZShzbGlkZSwgaHRtbCwgZmllbGRzKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICBkaXYuaW5uZXJIVE1MID0gZmllbGRzLnJlZHVjZShmdW5jdGlvbihodG1sLCBmaWVsZCkge1xuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKFwie3tcIiArIGZpZWxkLm5hbWUgKyBcIn19XCIsIHNsaWRlW2ZpZWxkLm5hbWVdKTtcbiAgICB9LCBodG1sKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2xpZGUtY29udGFpbmVyXCIpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZS1jb250YWluZXJcIikuYXBwZW5kQ2hpbGQoZGl2KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUoY3NzKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInN0eWxlW2RhdGEtY3NzXVwiKTtcbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNzc1wiLCBcIlwiKTtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVGb3JtcyhzbGlkZSwgdGVtcGxhdGUpIHtcbiAgICBidWlsZENvbnRlbnRGb3JtKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKSwgdGVtcGxhdGUuZmllbGRzKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQgdGV4dGFyZWFcIikudmFsdWUgPSBzbGlkZS50ZXh0O1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudCBbdHlwZT11cmxdXCIpLnZhbHVlID0gc2xpZGUuaW1hZ2U7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuaHRtbFwiKS52YWx1ZSA9IHRlbXBsYXRlLmh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuY3NzXCIpLnZhbHVlID0gdGVtcGxhdGUuY3NzO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVGb3JtKHNlbGVjdG9yKSB7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPT09IFwiaGlkZGVuXCIgPyBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiIDogZm9ybS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbn1cblxuZnVuY3Rpb24gYnVpbGRDb250ZW50Rm9ybShjb250ZW50Rm9ybSwgZmllbGRzKSB7XG5cbiAgICBpZiAoY29udGVudEZvcm0uZmlyc3RFbGVtZW50Q2hpbGQpXG4gICAgICAgIHJldHVybjtcblxuICAgIGNvbnRlbnRGb3JtLmlubmVySFRNTCA9IGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24oaHRtbCwgZmllbGQpIHtcblxuICAgICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XCI7XG4gICAgICAgIGh0bWwgKz0gXCI8bGFiZWw+XCIgKyBmaWVsZC5uYW1lICsgXCI8L2xhYmVsPlwiO1xuICAgICAgICBzd2l0Y2ggKGZpZWxkLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ0ZXh0YXJlYVwiOlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGV4dGFyZWEgbmFtZT1cXFwiXCIgKyBmaWVsZC5uYW1lICsgXCJcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPjwvdGV4dGFyZWE+XCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjxpbnB1dCB0eXBlPVxcXCJcIiArIGZpZWxkLnR5cGUgKyBcIlxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgbmFtZT1cXFwiXCIgKyBmaWVsZC5uYW1lICsgXCJcXFwiIC8+XCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSBcIjwvZGl2PlwiO1xuXG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sIFwiXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWZyZXNoIDogcmVmcmVzaCxcbiAgICB0b2dnbGVGb3JtIDogdG9nZ2xlRm9ybVxufVxuXG4iLCJcbmZ1bmN0aW9uIGxpc3RlbktleWJvYXJkKG9uVXAsIG9uUmlnaHQsIG9uRG93biwgb25MZWZ0KSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgIG9uTGVmdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgICAgIG9uVXAoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgICAgICBvblJpZ2h0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgb25Eb3duKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbGlzdGVuU2xpZGVDaGFuZ2UodXBkYXRlU2xpZGUpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIilcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlucHV0cyAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNvbnRlbnQgdGV4dGFyZWEsIC5jb250ZW50IGlucHV0XCIpLFxuICAgICAgICAgICAgY29udGVudCA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbChpbnB1dHMsIGZ1bmN0aW9uKGNvbnRlbnQsIGlucHV0KSB7XG4gICAgICAgICAgICAgICAgY29udGVudFtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICAgICAgfSwge30pO1xuXG4gICAgICAgIHVwZGF0ZVNsaWRlKGNvbnRlbnQpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5CdXR0b25zKG9uRGVsZXRlKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idXR0b25zIC5kZWxldGVcIilcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25EZWxldGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsaXN0ZW5LZXlib2FyZCA6IGxpc3RlbktleWJvYXJkLFxuICAgIGxpc3RlblNsaWRlQ2hhbmdlIDogbGlzdGVuU2xpZGVDaGFuZ2UsXG4gICAgbGlzdGVuQnV0dG9ucyA6IGxpc3RlbkJ1dHRvbnNcbn1cblxuIl19

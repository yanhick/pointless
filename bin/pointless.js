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
        //userInteraction.listenTemplateChange(presentation.updateTemplate);

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
        previous : pagination.previous
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

function listenTemplateChange(updateTemplate) {
    var html = document.querySelector(".template .html"),
        css  = document.querySelector(".template .css");

    document.querySelector(".template")
            .addEventListener("input", function() {
        updateTemplate(html.value, css.value);
    });
}

module.exports = {
    listenKeyboard : listenKeyboard,
    listenSlideChange : listenSlideChange,
    listenTemplateChange : listenTemplateChange
}


},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC9hcGkuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L2NvZGUtbWlycm9yLXdyYXBwZXIuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BhZ2luYXRpb24uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BvaW50bGVzcy5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvcHJlc2VudGF0aW9uLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC91aS5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvdXNlci1pbnRlcmFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gbG9hZChpZCwgY2IpIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9wZW4oXCJHRVRcIixcInRlc3QuanNvblwiLCB0cnVlKTtcbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24ocHJlc2VudGF0aW9uRGF0YSkge1xuICAgICAgICBjYihudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICB9XG4gICAgcmVxLnNlbmQobnVsbCk7XG59XG5cbmZ1bmN0aW9uIHNhdmUoZGF0YSwgY2IpIHtcbiAgICAvL1RPRE9cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbG9hZCA6IGxvYWQsXG4gICAgc2F2ZSA6IHNhdmVcbn1cbiIsIlxuZnVuY3Rpb24gaW5pdChvblRlbXBsYXRlQ2hhbmdlLCBodG1sLCBjc3MpIHtcbiAgICB2YXIgaHRtbEVkaXRvciA9IENvZGVNaXJyb3IoXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5odG1sXCIpLCB7XG4gICAgICAgICAgICAgICAgbW9kZSA6IFwiaHRtbG1peGVkXCIsXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBodG1sLFxuICAgICAgICAgICAgICAgIGxpbmVOdW1iZXJzIDogdHJ1ZVxuICAgICAgICB9KSxcbiAgICAgICAgY3NzRWRpdG9yID0gQ29kZU1pcnJvcihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmNzc1wiKSwge1xuICAgICAgICAgICAgICAgIG1vZGUgOiBcImNzc1wiLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogY3NzLFxuICAgICAgICAgICAgICAgIGxpbmVOdW1iZXJzIDogdHJ1ZVxuICAgICAgICB9KSxcbiAgICAgICAgb25DaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG9uVGVtcGxhdGVDaGFuZ2UoaHRtbEVkaXRvci5nZXRWYWx1ZSgpLCBjc3NFZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH07XG5cbiAgICBodG1sRWRpdG9yLm9uKFwiY2hhbmdlXCIsIG9uQ2hhbmdlKTtcbiAgICBjc3NFZGl0b3Iub24oXCJjaGFuZ2VcIiwgb25DaGFuZ2UpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0IDogaW5pdFxufVxuIiwiZnVuY3Rpb24gUGFnaW5hdGlvbihvbkNoYW5nZSkge1xuXG4gICAgdmFyIGluZGV4ID0gMCxcblxuICAgICAgICBuZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgb25DaGFuZ2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG5leHQgOiBuZXh0LFxuICAgICAgICBwcmV2aW91cyA6IHByZXZpb3VzLFxuICAgICAgICBnZXRJbmRleCA6IGdldEluZGV4XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb247XG4iLCJ2YXIgUHJlc2VudGF0aW9uID0gcmVxdWlyZShcIi4vcHJlc2VudGF0aW9uLmpzXCIpLFxuICAgIHVzZXJJbnRlcmFjdGlvbiA9IHJlcXVpcmUoXCIuL3VzZXItaW50ZXJhY3Rpb25zLmpzXCIpLFxuICAgIGNvZGVNaXJyb3JXcmFwcGVyID0gcmVxdWlyZShcIi4vY29kZS1taXJyb3Itd3JhcHBlci5qc1wiKSxcbiAgICBhcGkgPSByZXF1aXJlKFwiLi9hcGkuanNcIiksXG4gICAgdWkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcblxuZnVuY3Rpb24gbWFpbigpIHtcbiAgICAvL1RPRE8gOiByZXRyaWV2ZSBJRCBmcm9tIHF1ZXJ5IHN0cmluZ1xuICAgIGFwaS5sb2FkKDEyMzQsIGZ1bmN0aW9uKGVyciwgcHJlc2VudGF0aW9uRGF0YSkge1xuICAgICAgICB2YXIgcHJlc2VudGF0aW9uID0gUHJlc2VudGF0aW9uKHVpLnJlZnJlc2gpO1xuXG4gICAgICAgIHVzZXJJbnRlcmFjdGlvbi5saXN0ZW5LZXlib2FyZCh1aS50b2dnbGVGb3JtLmJpbmQobnVsbCwgXCIuY29udGVudFwiKSwgcHJlc2VudGF0aW9uLm5leHQsXG4gICAgICAgICAgICAgICAgICAgICAgIHVpLnRvZ2dsZUZvcm0uYmluZChudWxsLCBcIi50ZW1wbGF0ZVwiKSwgcHJlc2VudGF0aW9uLnByZXZpb3VzKTtcblxuICAgICAgICB1c2VySW50ZXJhY3Rpb24ubGlzdGVuU2xpZGVDaGFuZ2UocHJlc2VudGF0aW9uLnVwZGF0ZVNsaWRlKTtcbiAgICAgICAgLy91c2VySW50ZXJhY3Rpb24ubGlzdGVuVGVtcGxhdGVDaGFuZ2UocHJlc2VudGF0aW9uLnVwZGF0ZVRlbXBsYXRlKTtcblxuICAgICAgICB2YXIgdGVzdCA9IEpTT04ucGFyc2UocHJlc2VudGF0aW9uRGF0YSk7XG4gICAgICAgIGNvZGVNaXJyb3JXcmFwcGVyLmluaXQocHJlc2VudGF0aW9uLnVwZGF0ZVRlbXBsYXRlLCB0ZXN0LnRlbXBsYXRlLmh0bWwsIHRlc3QudGVtcGxhdGUuY3NzKTtcblxuICAgICAgICBwcmVzZW50YXRpb24uZnJvbUpTT04ocHJlc2VudGF0aW9uRGF0YSk7XG4gICAgfSk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluO1xuIiwidmFyIFBhZ2luYXRpb24gPSByZXF1aXJlKFwiLi9wYWdpbmF0aW9uLmpzXCIpO1xuXG5mdW5jdGlvbiBQcmVzZW50YXRpb24ob25DaGFuZ2UpIHtcblxuICAgIHZhciBkYXRhID0ge30sXG5cbiAgICAgICAgcmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFkYXRhLnNsaWRlc1tnZXRJbmRleCgpXSlcbiAgICAgICAgICAgICAgICBkYXRhLnNsaWRlc1tnZXRJbmRleCgpXSA9IGNyZWF0ZVNsaWRlKCk7XG5cbiAgICAgICAgICAgIG9uQ2hhbmdlKGRhdGEuc2xpZGVzW2dldEluZGV4KCldLCBkYXRhLnRlbXBsYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYWdpbmF0aW9uID0gUGFnaW5hdGlvbihyZWZyZXNoKSxcblxuICAgICAgICBnZXRJbmRleCA9IHBhZ2luYXRpb24uZ2V0SW5kZXgsXG5cbiAgICAgICAgdXBkYXRlU2xpZGUgPSBmdW5jdGlvbiAoc2xpZGUpIHtcbiAgICAgICAgICAgIGRhdGEuc2xpZGVzW2dldEluZGV4KCldID0gc2xpZGU7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlVGVtcGxhdGUgPSBmdW5jdGlvbihodG1sLCBjc3MpIHtcbiAgICAgICAgICAgIGRhdGEudGVtcGxhdGUuaHRtbCA9IGh0bWw7XG4gICAgICAgICAgICBkYXRhLnRlbXBsYXRlLmNzcz0gY3NzO1xuICAgICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb21KU09OID0gZnVuY3Rpb24oanNvbikge1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGV4dCA6IFwiXCIsXG4gICAgICAgICAgICAgICAgaW1hZ2UgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZWZyZXNoIDogcmVmcmVzaCxcbiAgICAgICAgdXBkYXRlU2xpZGUgOiB1cGRhdGVTbGlkZSxcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUgOiB1cGRhdGVUZW1wbGF0ZSxcbiAgICAgICAgdG9KU09OIDogdG9KU09OLFxuICAgICAgICBmcm9tSlNPTiA6IGZyb21KU09OLFxuICAgICAgICBuZXh0IDogcGFnaW5hdGlvbi5uZXh0LFxuICAgICAgICBwcmV2aW91cyA6IHBhZ2luYXRpb24ucHJldmlvdXNcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJlc2VudGF0aW9uO1xuIiwiXG5mdW5jdGlvbiByZWZyZXNoKHNsaWRlLCB0ZW1wbGF0ZSkge1xuICAgIHVwZGF0ZVN0eWxlKHRlbXBsYXRlLmNzcyk7XG4gICAgcmVuZGVyU2xpZGUoc2xpZGUsIHRlbXBsYXRlLmh0bWwsIHRlbXBsYXRlLmZpZWxkcyk7XG4gICAgdXBkYXRlRm9ybXMoc2xpZGUsIHRlbXBsYXRlKTtcbn1cblxuXG5mdW5jdGlvbiByZW5kZXJTbGlkZShzbGlkZSwgaHRtbCwgZmllbGRzKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICBkaXYuaW5uZXJIVE1MID0gZmllbGRzLnJlZHVjZShmdW5jdGlvbihodG1sLCBmaWVsZCkge1xuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKFwie3tcIiArIGZpZWxkLm5hbWUgKyBcIn19XCIsIHNsaWRlW2ZpZWxkLm5hbWVdKTtcbiAgICB9LCBodG1sKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2xpZGUtY29udGFpbmVyXCIpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZS1jb250YWluZXJcIikuYXBwZW5kQ2hpbGQoZGl2KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUoY3NzKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInN0eWxlW2RhdGEtY3NzXVwiKTtcbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNzc1wiLCBcIlwiKTtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVGb3JtcyhzbGlkZSwgdGVtcGxhdGUpIHtcbiAgICBidWlsZENvbnRlbnRGb3JtKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKSwgdGVtcGxhdGUuZmllbGRzKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQgdGV4dGFyZWFcIikudmFsdWUgPSBzbGlkZS50ZXh0O1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudCBbdHlwZT11cmxdXCIpLnZhbHVlID0gc2xpZGUuaW1hZ2U7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuaHRtbFwiKS52YWx1ZSA9IHRlbXBsYXRlLmh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuY3NzXCIpLnZhbHVlID0gdGVtcGxhdGUuY3NzO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVGb3JtKHNlbGVjdG9yKSB7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPT09IFwiaGlkZGVuXCIgPyBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiIDogZm9ybS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbn1cblxuZnVuY3Rpb24gYnVpbGRDb250ZW50Rm9ybShjb250ZW50Rm9ybSwgZmllbGRzKSB7XG5cbiAgICBpZiAoY29udGVudEZvcm0uZmlyc3RFbGVtZW50Q2hpbGQpXG4gICAgICAgIHJldHVybjtcblxuICAgIGNvbnRlbnRGb3JtLmlubmVySFRNTCA9IGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24oaHRtbCwgZmllbGQpIHtcblxuICAgICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XCI7XG4gICAgICAgIGh0bWwgKz0gXCI8bGFiZWw+XCIgKyBmaWVsZC5uYW1lICsgXCI8L2xhYmVsPlwiO1xuICAgICAgICBzd2l0Y2ggKGZpZWxkLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ0ZXh0YXJlYVwiOlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dGV4dGFyZWEgbmFtZT1cXFwiXCIgKyBmaWVsZC5uYW1lICsgXCJcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPjwvdGV4dGFyZWE+XCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjxpbnB1dCB0eXBlPVxcXCJcIiArIGZpZWxkLnR5cGUgKyBcIlxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgbmFtZT1cXFwiXCIgKyBmaWVsZC5uYW1lICsgXCJcXFwiIC8+XCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSBcIjwvZGl2PlwiO1xuXG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sIFwiXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWZyZXNoIDogcmVmcmVzaCxcbiAgICB0b2dnbGVGb3JtIDogdG9nZ2xlRm9ybVxufVxuXG4iLCJcbmZ1bmN0aW9uIGxpc3RlbktleWJvYXJkKG9uVXAsIG9uUmlnaHQsIG9uRG93biwgb25MZWZ0KSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgIG9uTGVmdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgICAgIG9uVXAoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgICAgICBvblJpZ2h0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgb25Eb3duKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbGlzdGVuU2xpZGVDaGFuZ2UodXBkYXRlU2xpZGUpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIilcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlucHV0cyAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNvbnRlbnQgdGV4dGFyZWEsIC5jb250ZW50IGlucHV0XCIpLFxuICAgICAgICAgICAgY29udGVudCA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbChpbnB1dHMsIGZ1bmN0aW9uKGNvbnRlbnQsIGlucHV0KSB7XG4gICAgICAgICAgICAgICAgY29udGVudFtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICAgICAgfSwge30pO1xuXG4gICAgICAgIHVwZGF0ZVNsaWRlKGNvbnRlbnQpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5UZW1wbGF0ZUNoYW5nZSh1cGRhdGVUZW1wbGF0ZSkge1xuICAgIHZhciBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuaHRtbFwiKSxcbiAgICAgICAgY3NzICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGUgLmNzc1wiKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGVtcGxhdGVcIilcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHVwZGF0ZVRlbXBsYXRlKGh0bWwudmFsdWUsIGNzcy52YWx1ZSk7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxpc3RlbktleWJvYXJkIDogbGlzdGVuS2V5Ym9hcmQsXG4gICAgbGlzdGVuU2xpZGVDaGFuZ2UgOiBsaXN0ZW5TbGlkZUNoYW5nZSxcbiAgICBsaXN0ZW5UZW1wbGF0ZUNoYW5nZSA6IGxpc3RlblRlbXBsYXRlQ2hhbmdlXG59XG5cbiJdfQ==

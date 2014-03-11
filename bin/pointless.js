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

},{}],3:[function(require,module,exports){
var Presentation = require("./presentation.js"),
    userInteraction = require("./user-interactions.js"),
    api = require("./api.js"),
    ui = require("./ui.js");

function main() {
    //TODO : retrieve ID from query string
    api.load(1234, function(err, presentationData) {
        var presentation = Presentation(ui.refresh);

        userInteraction.listenKeyboard(ui.toggleForm.bind(null, ".content"), presentation.next,
                       ui.toggleForm.bind(null, ".template"), presentation.previous);

        userInteraction.listenSlideChange(presentation.updateSlide);
        userInteraction.listenTemplateChange(presentation.updateTemplate);

        presentation.fromJSON(presentationData);
    });
}

window.onload = main;

},{"./api.js":1,"./presentation.js":4,"./ui.js":5,"./user-interactions.js":6}],4:[function(require,module,exports){
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

},{"./pagination.js":2}],5:[function(require,module,exports){

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
        switch (field.type) {
            case "textarea":
                return html + "<textarea name=\"" + field.name + "\"></textarea>";

            default:
                return html + "<input type=\"" + field.type + "\" name=\"" + field.name + "\" />";
        }
    }, "");
}

module.exports = {
    refresh : refresh,
    toggleForm : toggleForm
}


},{}],6:[function(require,module,exports){

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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC9hcGkuanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BhZ2luYXRpb24uanMiLCIvaG9tZS95YW5uaWNrL2Rldi9wb2ludGxlc3MvY2xpZW50L3BvaW50bGVzcy5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvcHJlc2VudGF0aW9uLmpzIiwiL2hvbWUveWFubmljay9kZXYvcG9pbnRsZXNzL2NsaWVudC91aS5qcyIsIi9ob21lL3lhbm5pY2svZGV2L3BvaW50bGVzcy9jbGllbnQvdXNlci1pbnRlcmFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIGxvYWQoaWQsIGNiKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vcGVuKFwiR0VUXCIsXCJ0ZXN0Lmpzb25cIiwgdHJ1ZSk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKHByZXNlbnRhdGlvbkRhdGEpIHtcbiAgICAgICAgY2IobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgfVxuICAgIHJlcS5zZW5kKG51bGwpO1xufVxuXG5mdW5jdGlvbiBzYXZlKGRhdGEsIGNiKSB7XG4gICAgLy9UT0RPXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxvYWQgOiBsb2FkLFxuICAgIHNhdmUgOiBzYXZlXG59XG4iLCJmdW5jdGlvbiBQYWdpbmF0aW9uKG9uQ2hhbmdlKSB7XG5cbiAgICB2YXIgaW5kZXggPSAwLFxuXG4gICAgICAgIG5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBvbkNoYW5nZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgb25DaGFuZ2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dCA6IG5leHQsXG4gICAgICAgIHByZXZpb3VzIDogcHJldmlvdXMsXG4gICAgICAgIGdldEluZGV4IDogZ2V0SW5kZXhcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdGlvbjtcbiIsInZhciBQcmVzZW50YXRpb24gPSByZXF1aXJlKFwiLi9wcmVzZW50YXRpb24uanNcIiksXG4gICAgdXNlckludGVyYWN0aW9uID0gcmVxdWlyZShcIi4vdXNlci1pbnRlcmFjdGlvbnMuanNcIiksXG4gICAgYXBpID0gcmVxdWlyZShcIi4vYXBpLmpzXCIpLFxuICAgIHVpID0gcmVxdWlyZShcIi4vdWkuanNcIik7XG5cbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgLy9UT0RPIDogcmV0cmlldmUgSUQgZnJvbSBxdWVyeSBzdHJpbmdcbiAgICBhcGkubG9hZCgxMjM0LCBmdW5jdGlvbihlcnIsIHByZXNlbnRhdGlvbkRhdGEpIHtcbiAgICAgICAgdmFyIHByZXNlbnRhdGlvbiA9IFByZXNlbnRhdGlvbih1aS5yZWZyZXNoKTtcblxuICAgICAgICB1c2VySW50ZXJhY3Rpb24ubGlzdGVuS2V5Ym9hcmQodWkudG9nZ2xlRm9ybS5iaW5kKG51bGwsIFwiLmNvbnRlbnRcIiksIHByZXNlbnRhdGlvbi5uZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICB1aS50b2dnbGVGb3JtLmJpbmQobnVsbCwgXCIudGVtcGxhdGVcIiksIHByZXNlbnRhdGlvbi5wcmV2aW91cyk7XG5cbiAgICAgICAgdXNlckludGVyYWN0aW9uLmxpc3RlblNsaWRlQ2hhbmdlKHByZXNlbnRhdGlvbi51cGRhdGVTbGlkZSk7XG4gICAgICAgIHVzZXJJbnRlcmFjdGlvbi5saXN0ZW5UZW1wbGF0ZUNoYW5nZShwcmVzZW50YXRpb24udXBkYXRlVGVtcGxhdGUpO1xuXG4gICAgICAgIHByZXNlbnRhdGlvbi5mcm9tSlNPTihwcmVzZW50YXRpb25EYXRhKTtcbiAgICB9KTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW47XG4iLCJ2YXIgUGFnaW5hdGlvbiA9IHJlcXVpcmUoXCIuL3BhZ2luYXRpb24uanNcIik7XG5cbmZ1bmN0aW9uIFByZXNlbnRhdGlvbihvbkNoYW5nZSkge1xuXG4gICAgdmFyIGRhdGEgPSB7fSxcblxuICAgICAgICByZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGEuc2xpZGVzW2dldEluZGV4KCldKVxuICAgICAgICAgICAgICAgIGRhdGEuc2xpZGVzW2dldEluZGV4KCldID0gY3JlYXRlU2xpZGUoKTtcblxuICAgICAgICAgICAgb25DaGFuZ2UoZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0sIGRhdGEudGVtcGxhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhZ2luYXRpb24gPSBQYWdpbmF0aW9uKHJlZnJlc2gpLFxuXG4gICAgICAgIGdldEluZGV4ID0gcGFnaW5hdGlvbi5nZXRJbmRleCxcblxuICAgICAgICB1cGRhdGVTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICAgICAgZGF0YS5zbGlkZXNbZ2V0SW5kZXgoKV0gPSBzbGlkZTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGh0bWwsIGNzcykge1xuICAgICAgICAgICAgZGF0YS50ZW1wbGF0ZS5odG1sID0gaHRtbDtcbiAgICAgICAgICAgIGRhdGEudGVtcGxhdGUuY3NzPSBjc3M7XG4gICAgICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbUpTT04gPSBmdW5jdGlvbihqc29uKSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcbiAgICAgICAgICAgICAgICBpbWFnZSA6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlZnJlc2ggOiByZWZyZXNoLFxuICAgICAgICB1cGRhdGVTbGlkZSA6IHVwZGF0ZVNsaWRlLFxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSA6IHVwZGF0ZVRlbXBsYXRlLFxuICAgICAgICB0b0pTT04gOiB0b0pTT04sXG4gICAgICAgIGZyb21KU09OIDogZnJvbUpTT04sXG4gICAgICAgIG5leHQgOiBwYWdpbmF0aW9uLm5leHQsXG4gICAgICAgIHByZXZpb3VzIDogcGFnaW5hdGlvbi5wcmV2aW91c1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmVzZW50YXRpb247XG4iLCJcbmZ1bmN0aW9uIHJlZnJlc2goc2xpZGUsIHRlbXBsYXRlKSB7XG4gICAgdXBkYXRlU3R5bGUodGVtcGxhdGUuY3NzKTtcbiAgICByZW5kZXJTbGlkZShzbGlkZSwgdGVtcGxhdGUuaHRtbCwgdGVtcGxhdGUuZmllbGRzKTtcbiAgICB1cGRhdGVGb3JtcyhzbGlkZSwgdGVtcGxhdGUpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTbGlkZShzbGlkZSwgaHRtbCwgZmllbGRzKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICBkaXYuaW5uZXJIVE1MID0gZmllbGRzLnJlZHVjZShmdW5jdGlvbihodG1sLCBmaWVsZCkge1xuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKFwie3tcIiArIGZpZWxkLm5hbWUgKyBcIn19XCIsIHNsaWRlW2ZpZWxkLm5hbWVdKTtcbiAgICB9LCBodG1sKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2xpZGUtY29udGFpbmVyXCIpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbGlkZS1jb250YWluZXJcIikuYXBwZW5kQ2hpbGQoZGl2KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUoY3NzKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInN0eWxlW2RhdGEtY3NzXVwiKTtcbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNzc1wiLCBcIlwiKTtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVGb3JtcyhzbGlkZSwgdGVtcGxhdGUpIHtcbiAgICBidWlsZENvbnRlbnRGb3JtKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKSwgdGVtcGxhdGUuZmllbGRzKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQgdGV4dGFyZWFcIikudmFsdWUgPSBzbGlkZS50ZXh0O1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudCBbdHlwZT11cmxdXCIpLnZhbHVlID0gc2xpZGUuaW1hZ2U7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuaHRtbFwiKS52YWx1ZSA9IHRlbXBsYXRlLmh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuY3NzXCIpLnZhbHVlID0gdGVtcGxhdGUuY3NzO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVGb3JtKHNlbGVjdG9yKSB7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPT09IFwiaGlkZGVuXCIgPyBmb3JtLnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiIDogZm9ybS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbn1cblxuZnVuY3Rpb24gYnVpbGRDb250ZW50Rm9ybShjb250ZW50Rm9ybSwgZmllbGRzKSB7XG5cbiAgICBpZiAoY29udGVudEZvcm0uZmlyc3RFbGVtZW50Q2hpbGQpXG4gICAgICAgIHJldHVybjtcblxuICAgIGNvbnRlbnRGb3JtLmlubmVySFRNTCA9IGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24oaHRtbCwgZmllbGQpIHtcbiAgICAgICAgc3dpdGNoIChmaWVsZC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidGV4dGFyZWFcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbCArIFwiPHRleHRhcmVhIG5hbWU9XFxcIlwiICsgZmllbGQubmFtZSArIFwiXFxcIj48L3RleHRhcmVhPlwiO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBodG1sICsgXCI8aW5wdXQgdHlwZT1cXFwiXCIgKyBmaWVsZC50eXBlICsgXCJcXFwiIG5hbWU9XFxcIlwiICsgZmllbGQubmFtZSArIFwiXFxcIiAvPlwiO1xuICAgICAgICB9XG4gICAgfSwgXCJcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlZnJlc2ggOiByZWZyZXNoLFxuICAgIHRvZ2dsZUZvcm0gOiB0b2dnbGVGb3JtXG59XG5cbiIsIlxuZnVuY3Rpb24gbGlzdGVuS2V5Ym9hcmQob25VcCwgb25SaWdodCwgb25Eb3duLCBvbkxlZnQpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgICAgb25MZWZ0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICAgICAgb25VcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgICAgIG9uUmlnaHQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICBvbkRvd24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5TbGlkZUNoYW5nZSh1cGRhdGVTbGlkZSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5wdXRzICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY29udGVudCB0ZXh0YXJlYSwgLmNvbnRlbnQgaW5wdXRcIiksXG4gICAgICAgICAgICBjb250ZW50ID0gQXJyYXkucHJvdG90eXBlLnJlZHVjZS5jYWxsKGlucHV0cywgZnVuY3Rpb24oY29udGVudCwgaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50W2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgICAgICB9LCB7fSk7XG5cbiAgICAgICAgdXBkYXRlU2xpZGUoY29udGVudCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxpc3RlblRlbXBsYXRlQ2hhbmdlKHVwZGF0ZVRlbXBsYXRlKSB7XG4gICAgdmFyIGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRlbXBsYXRlIC5odG1sXCIpLFxuICAgICAgICBjc3MgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZSAuY3NzXCIpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZW1wbGF0ZVwiKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUoaHRtbC52YWx1ZSwgY3NzLnZhbHVlKTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbGlzdGVuS2V5Ym9hcmQgOiBsaXN0ZW5LZXlib2FyZCxcbiAgICBsaXN0ZW5TbGlkZUNoYW5nZSA6IGxpc3RlblNsaWRlQ2hhbmdlLFxuICAgIGxpc3RlblRlbXBsYXRlQ2hhbmdlIDogbGlzdGVuVGVtcGxhdGVDaGFuZ2Vcbn1cblxuIl19

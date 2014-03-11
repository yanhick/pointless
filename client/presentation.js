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

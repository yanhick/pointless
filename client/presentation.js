var Pagination = require("./pagination.js");

function Presentation(data, onChange) {

    var refresh = function() {
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

        getData = function() {
            return data;
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
        getData : getData,
        next : pagination.next,
        previous : pagination.previous
    }
}

module.exports = Presentation;

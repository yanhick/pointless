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

        load = function(id) {
            var req = new XMLHttpRequest();
            req.open("GET","test.json", true);
            req.onload = function(presentationData) {
                data = JSON.parse(req.responseText);
                onChange(data.slides[getIndex()], data.template);
            }
            req.send(null);
        };

    return {
        refresh : refresh,
        updateSlide : updateSlide,
        updateTemplate : updateTemplate,
        load : load,
        next : pagination.next,
        previous : pagination.previous
    }
}

module.exports = Presentation

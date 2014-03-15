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


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


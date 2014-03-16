
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


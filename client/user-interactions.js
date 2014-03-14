
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



function listenKeyboard(onUp, onRight, onDown, onLeft) {
    document.addEventListener("keyup", function(e){
        switch(e.keyCode) {
            case 37:
                onLeft();
                break;

            case 38:
                onUp();
                //up
                break;

            case 39:
                onRight();
                break;

            case 40:
                onDown();
                //down
                break;
        }
    });
}

function listenSlideChange(updateContent) {
    var text  = document.querySelector(".content textarea"),
        image = document.querySelector(".content [type=url]");

    document.querySelector(".content")
            .addEventListener("input", function() {
        updateContent({
            text : text.value,
            image : image.value
        });
    });
}

function listenTemplateChange(updateTemplate) {
    var html = document.querySelector(".template .html"),
        css  = document.querySelector(".template .css");

    document.querySelector(".template")
            .addEventListener("input", function() {
        updateTemplate({
            html : html.value,
            css  : css.value
        });
    });
}

module.exports = {
    listenKeyboard : listenKeyboard,
    listenSlideChange : listenSlideChange,
    listenTemplateChange : listenTemplateChange
}


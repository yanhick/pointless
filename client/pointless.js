var Presentation = require("./presentation.js"),
    userInteraction = require("./user-interactions.js"),
    api = require("./api.js"),
    ui = require("./ui.js");

function main() {
    //TODO : retrieve ID from query string
    api.load(1234, function(err, presentationData) {
        var presentation = Presentation(presentationData, ui.refresh);

        userInteraction.listenKeyboard(ui.toggleForm.bind(null, ".content"), presentation.next,
                       ui.toggleForm.bind(null, ".template"), presentation.previous);

        userInteraction.listenSlideChange(presentation.updateSlide);
        userInteraction.listenTemplateChange(presentation.updateTemplate);

        presentation.refresh();
    });
}

window.onload = main;

function refresh(slide, template) {
    updateStyle(template.css);
    renderSlide(slide, template.html);
    updateForms(slide, template);
}

function renderSlide(slide, html) {
    var div = document.createElement("div");

    div.innerHTML = html.replace("{{text}}", slide.text)
                                 .replace("{{image}}", slide.image);

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
    document.querySelector(".content textarea").value = slide.text;
    document.querySelector(".content [type=url]").value = slide.image;
    document.querySelector(".template .html").value = template.html;
    document.querySelector(".template .css").value = template.css;
}

function toggleForm(selector) {
    var form = document.querySelector(selector);
    form.style.visibility === "hidden" ? form.style.visibility = "" : form.style.visibility = "hidden";
}

module.exports = {
    refresh : refresh,
    toggleForm : toggleForm
}

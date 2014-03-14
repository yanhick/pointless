
module.exports = function(el) {
    if (el.mozRequestFullScreen)
        el.mozRequestFullScreen();
    else if (el.webkitRequestFullScreen)
        el.webkitRequestFullScreen();
    else if (el.requestFullScreen)
        el.requestFullScreen;
}


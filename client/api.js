function load(id, cb) {
    var req = new XMLHttpRequest();
    req.open("GET","test.json", true);
    req.onload = function(presentationData) {
        data = JSON.parse(req.responseText);
        cb(null, data);
    }
    req.send(null);

}

function save(data, cb) {
    //TODO
}

module.exports = {
    load : load,
    save : save
}

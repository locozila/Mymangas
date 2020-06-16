let mlist = document.getElementById('mlist');
let saveBt = document.getElementById('save');
let clearBt = document.getElementById("clear");

function saveList(){
    var text = mlist.value;
    chrome.storage.local.set({'list': text.toLowerCase()});
    alert("Lista salva!");
}

function load() {
    var mangas = "";
    chrome.storage.local.get('list', function(result) {
        mangas = result.list;
        (mangas === undefined) ? mlist.value = "" : mlist.value = mangas;
    });
}

function clearList(){
    chrome.storage.local.clear(function(result) {
        load();
        alert("Lista de mangás limpa!");
    });
}

window.onload = load();
saveBt.onclick = function() {saveList()};
clearBt.onclick = function() {clearList()};
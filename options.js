let mlist = document.getElementById('mlist');
let saveBt = document.getElementById('save');

function saveList(){
    var text = mlist.value;
    chrome.storage.sync.set({'list': text.toLowerCase()});
    alert("Lista salva!");
}

function load() {
    chrome.storage.sync.get('list', function(result) {      
        mlist.value = (result.list === undefined || result.list === "") ? "": result.list;
    });
}

window.onload = load();
saveBt.onclick = function() {saveList()};
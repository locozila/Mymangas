let mlist = document.getElementById('mlist');
let saveBt = document.getElementById('save');

let item = `
    <div class="item">
        <div class="mangaName">
            <p>Se eu colocar uma titulo muito grande ele vai ficar assim</p>
        </div>
        <div class="mangaCap">
            <p>Cap 80</p>
        </div>
    </div>`;

function saveList(){
    var text = mlist.value;
    chrome.storage.sync.set({'list': text});
    alert("Lista salva!");
}

function load() {
    chrome.storage.sync.get('list', function(result) {      
        mlist.value = (result.list === undefined || result.list === "") ? "": result.list;
    });
}

window.onload = load();
saveBt.onclick = function() {saveList()};
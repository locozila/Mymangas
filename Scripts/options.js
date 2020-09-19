import * as Utils from "./utils.js";

let cancelBt = document.getElementById('btn-cancel');
let newBt = document.getElementById('btn-add');
let editBt = document.getElementById('btn-edit');
let saveAddBt = document.getElementById('btn-save-add');
let saveEditBt = document.getElementById('btn-save-edit');

let arrayMangas = [];
let mangasNameList = [];

let flag1 = 0;
let flag2 = 0;

let item = `<div class="item">
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

async function getMangaData(){
    var mData = new Promise(function(resolve, reject){
        chrome.storage.sync.get('list', function(result) {        
            resolve(result.list);
        }); 
    });

    return await mData;
}

function loadData(){
    getMangaData().then(function(lista){
        if(lista !== undefined && lista !== ""){
            arrayMangas = lista.split('\n');

            arrayMangas.sort(function(a, b){
                var mangaA = a.split(" - ");
                var mangaB = b.split(" - ");

                var mangaNameA = Utils.formatText(Utils.getNameByUrl(mangaA[0]));
                var mangaNameB = Utils.formatText(Utils.getNameByUrl(mangaB[0]));

                if (mangaNameA > mangaNameB) return 1;
                else return -1;
            });

            var mlist = document.getElementById('mlist');
            var htmlContent = '';
            for(var i in arrayMangas){
                var content = arrayMangas[i].split(' - ');
                var mangaName = Utils.formatText(Utils.getNameByUrl(content[0]));
                mangasNameList.push(mangaName);

                var mangaCap = 'Não lido';
                if (content[1] != 'x'){
                    mangaCap = "Cap "+Utils.getNameByUrl(content[1]);
                }                

                htmlContent += `
                <div class="item" id="item-${i}">
                    <div class="mangaName">
                        <p>${mangaName}</p>
                    </div>
                    <div class="mangaCap">
                        <p>${mangaCap}</p>
                    </div>
                </div>`;
            }
            mlist.innerHTML = htmlContent;
        }
    });
}

function showAddOptions(){
    var addOptions = document.getElementById('add-item');
    if(!flag1){
        addOptions.removeAttribute('hidden');
        flag1 = 1;

        cancelEditSave('edit-item');
        flag2 = 0;
    }else{
        cancelEditSave('add-item');
        flag1 = 0;
    }
}

function showEditOptions(){
    var editOptions = document.getElementById('edit-item');
    if(!flag2){
        editOptions.removeAttribute('hidden');
        flag2 = 1;

        cancelEditSave('add-item');
        flag1 = 0;
    }else{
        cancelEditSave('edit-item');
        flag2 = 0;
    }
}

function saveNewManga(){
    var mangaURL = document.getElementById('manga-link');
    var capURL = document.getElementById('cap-link');

    if (mangaURL.value === ""){
        alert("Insira o Link para o Mangá");
    }else{
        var mangaName = Utils.formatText(Utils.getNameByUrl(mangaURL.value));
        if (mangasNameList.includes(mangaName)){
            alert("O Mangá já está na sua lista");
        }else{
            var capData = (capURL.value === "") ? "x" : capURL.value;
            arrayMangas.push(`${mangaURL.value} - ${capData}`);

            var mangaList = arrayMangas.join("\n");
            chrome.storage.sync.set({'list': mangaList});

            mangaURL.value = '';
            capURL.value = '';
            loadData();
            alert("Mangá Adicionado");
        }
    }
}

function saveNewCap(){
    var manga = document.getElementById('manga-name');
    var capURL = document.getElementById('cap-number');
    var item = document.getElementById('manga-index');
    var index = item.value;

    var capData = (capURL.value === "") ? 'x' : capURL.value;

    var mangaURL = arrayMangas[index].split(' - ')[0];
    console.log(capURL.value);
    arrayMangas[index] = `${mangaURL} - ${capData}`;

    var mangaList = arrayMangas.join("\n");
    chrome.storage.sync.set({'list': mangaList});

    manga.value = '';
    capURL.value = '';
    item.value = '';
    loadData();
    alert("Mangá Atualizado");
}

function cancel(){
    cancelEditSave('add-item');
    cancelEditSave('edit-item');

    flag1 = 0;
    flag2 = 0;
}

function cancelEditSave(elem){
    var saveEdit = document.getElementById(elem);
    saveEdit.setAttribute('hidden', '');

    document.getElementById('manga-name').value = "";
    document.getElementById('cap-number').value = "";
    document.getElementById('manga-link').value = "";
    document.getElementById('cap-link').value = "";
    document.getElementById('manga-index').value = "";
}

function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}

var ul = document.getElementById('mlist');
ul.onclick = function(event) {
    var target = getEventTarget(event).parentNode.parentNode.id;
    var index = target.split('item-')[1];

    if (flag2){
        var content = arrayMangas[index].split(' - ');
        var mangaName = Utils.formatText(Utils.getNameByUrl(content[0]));

        var mangaCap = '';
        if (content[1] != 'x'){
            mangaCap = content[1];
        }

        document.getElementById('manga-name').value = mangaName;
        document.getElementById('cap-number').value = mangaCap;
        document.getElementById('manga-index').value = index;
    }
};

window.onload = loadData();
cancelBt.onclick = function() {cancel()};
newBt.onclick = function() {showAddOptions()};
editBt.onclick = function() {showEditOptions()};
saveAddBt.onclick = function() {saveNewManga()};
saveEditBt.onclick = function() {saveNewCap()};
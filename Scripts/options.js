let newBt = document.getElementById('btn-add');
let editBt = document.getElementById('btn-edit');
let delBt = document.getElementById('btn-del');
let saveAddBt = document.getElementById('btn-save-add');
let saveEditBt = document.getElementById('btn-save-edit');
let expBt = document.getElementById('exp-file');
let impBt = document.getElementById('imp-file');
let fileInput = document.getElementById('file-input');

let arrayMangas = [];
let mangasNameList = [];

let flag1 = 0;
let flag2 = 0;
let flag3 = 0;

//Function to Get data from storage
async function getMangaData(){
    var mData = new Promise(function(resolve){
        chrome.storage.sync.get('list', function(result) {        
            resolve(result.list);
        }); 
    });

    return await mData;
}

//Load manga list
function loadData(){
    var mlist = document.getElementById('mlist');

    getMangaData().then(function(lista){
        if(lista !== undefined && lista !== ""){
            arrayMangas = lista.split('\n');

            arrayMangas.sort(function(a, b){
                var mangaA = a.split(" - ");
                var mangaB = b.split(" - ");

                var mangaNameA = formatText(getNameByUrl(mangaA[0]));
                var mangaNameB = formatText(getNameByUrl(mangaB[0]));

                if (mangaNameA > mangaNameB) return 1;
                else return -1;
            });

            var htmlContent = '';
            for(var i in arrayMangas){
                var content = arrayMangas[i].split(' - ');
                var mangaName = formatText(getNameByUrl(content[0]));
                mangasNameList.push(mangaName);

                var mangaCap = 'Não lido';
                if (content[1] != 'x'){
                    mangaCap = "Cap "+getNameByUrl(content[1]);
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
        }else{
            mlist.innerHTML = '';
        }
    });
}

//Enabling add manga option
function showAddOptions(){
    var addOptions = document.getElementById('add-item');
    if(!flag1){
        addOptions.removeAttribute('hidden');
        flag1 = 1;

        cancelEditSave('edit-item');
        flag2 = 0;
        flag3 = 0;
    }else{
        cancelEditSave('add-item');
        flag1 = 0;
    }
}

//Enabling edit manga option
function showEditOptions(){
    var editOptions = document.getElementById('edit-item');
    if(!flag2){
        document.getElementById('alert').removeAttribute('hidden');
        document.getElementById('txt-alert').innerText = "Selecione o Mangá que deseja Editar...";
        document.getElementById('label-margin').setAttribute('hidden', '');
        editOptions.removeAttribute('hidden');
        flag2 = 1;

        cancelEditSave('add-item');
        flag1 = 0;
        flag3 = 0;
    }else{
        cancelEditSave('edit-item');
        flag2 = 0;
    }
}

//Enabling delete manga option
function showDelOptions(){
    cancelEditSave('add-item');
    cancelEditSave('edit-item');
    flag1 = 0;
    flag2 = 0;
    
    if(!flag3){
        document.getElementById('alert').removeAttribute('hidden');
        document.getElementById('txt-alert').innerText = "Selecione o Mangá que deseja Excluir...";
        document.getElementById('label-margin').setAttribute('hidden', '');

        flag3 = 1;    
    }else{
        flag3 = 0;
    }
}

//Saving the new manga
function saveNewManga(){
    var mangaURL = document.getElementById('manga-link');
    var capURL = document.getElementById('cap-link');

    if (mangaURL.value === ""){
        alert("Insira o Link para o Mangá");
    }else{
        var mangaName = formatText(getNameByUrl(mangaURL.value));
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

//Updating manga cap
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

    cancelEditSave('edit-item');
    flag2 = 0;
    
    loadData();
    alert("Mangá Atualizado");
}

//Function to hide form elements
function cancelEditSave(elem){
    if (elem !== 'del-item'){
        var saveEdit = document.getElementById(elem);
        saveEdit.setAttribute('hidden', '');
    }

    document.getElementById('manga-name').value = "";
    document.getElementById('cap-number').value = "";
    document.getElementById('manga-link').value = "";
    document.getElementById('cap-link').value = "";
    document.getElementById('manga-index').value = "";

    if(elem === 'edit-item' || elem === 'del-item'){
        document.getElementById('alert').setAttribute('hidden', '');
        document.getElementById('txt-alert').innerText = '';
        document.getElementById('label-margin').removeAttribute('hidden');
    }
}

//Function to get the element clicked (selected)
function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}

//Confirming the importation
function importMangas(){
    if (confirm('Atenção: A lista será substituída pela contida no arquivo.\nDeseja realmente importar?')) {
        fileInput.click();
    }
}

//Function to get the file content to save
fileInput.onchange = e => { 
    var file = e.target.files[0];
    var fileExtension = file.name.toLowerCase().split('.')[1];

    if (fileExtension === 'txt'){
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
    
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            chrome.storage.sync.set({'list': content});
    
            loadData();
        }
    }
}

function exportMangas(){
    var mangas = arrayMangas.join('\n');
    download(mangas, "Meus mangás.txt");
}

//Create a file to download
function download(text, filename){
    var blob = new Blob([text], {type: "text/plain"});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
}

//List to captain the element click (selection)
var ul = document.getElementById('mlist');
ul.onclick = function(event) {
    //Getting the element clicked (selected)
    var elem = getEventTarget(event).parentNode;
    if (elem.parentNode.id !== ''){
        var target = (elem.parentNode.id === 'mlist') ? elem.id : elem.parentNode.id;
        var index = target.split('item-')[1];
    
        if (flag2){ //If was selected to edition
            var content = arrayMangas[index].split(' - ');
            var mangaName = formatText(getNameByUrl(content[0]));
    
            var mangaCap = '';
            if (content[1] != 'x'){
                mangaCap = content[1];
            }
    
            //Filling in the fields
            document.getElementById('manga-name').value = mangaName;
            document.getElementById('cap-number').value = mangaCap;
            document.getElementById('manga-index').value = index;
        }else if (flag3 && !flag2){ //If was selected to exclusion
            deleteManga(index);
        }
    }
};

//Function to delete manga from list
function deleteManga(index){
    var content = arrayMangas[index].split(' - ');
    var mangaName = formatText(getNameByUrl(content[0]));
    if (confirm(`Deseja realmente excluir o Mangá: ${mangaName}?`)) {
        removeElementFromArray(arrayMangas, arrayMangas[index]);
        chrome.storage.sync.set({'list': arrayMangas.join('\n')});

        loadData();
    }

    cancelEditSave('del-item');
    flag3 = 0;
}

//Get manga name from URL
function getNameByUrl(url, index=1){
    var arrayString = url.split("/");
    return arrayString[arrayString.length-index];
}

//Format text to manga list
function formatText(text){
    var listRomanNumbers = ["C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
    "X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
    "I","II","III","IV","V","VI","VII","VIII","IX"];
    
    var list = text.split('-');
    list = removeElementFromArray(list, '');
    for(var i in list){
        var upper = list[i].toUpperCase();

        list[i] = (listRomanNumbers.includes(upper)) ? list[i] = upper : list[i].charAt(0).toUpperCase() + list[i].slice(1);
    }
    return list.join(" ");
}

//Removing element from manga name
function removeElementFromArray(arr, elem="-"){
    for(var i = 0; i < arr.length; i++){
        if(arr[i] === elem) {
            arr.splice(i, 1);
        } 
    }
    return arr;
}

//Functions for each event
window.onload = loadData();
newBt.onclick = function() {showAddOptions()};
editBt.onclick = function() {showEditOptions()};
delBt.onclick = function() {showDelOptions()};
saveAddBt.onclick = function() {saveNewManga()};
saveEditBt.onclick = function() {saveNewCap()};
expBt.onclick = function() {exportMangas()};
impBt.onclick = function() {importMangas()};
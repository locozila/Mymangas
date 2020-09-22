window.onload = function() {
    console.log("Saving cap...");
    var url = window.location.href;
    if(url.search("/leitor/") != -1) capPage(url, 1);
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if(tabs[0].url.search("/perfil-manga/") != -1 || tabs[0].url.search("/manga/") != -1){
            mangaPage(tabs[0].url);
        }else if(tabs[0].url.search("/leitor/") != -1){
            capPage(tabs[0].url);
        }else{
            listMangas();
        }
    });
});

//Function to show manga list on home page
function listMangas(){    
    var mangaInfo = document.getElementById('mangaInfo');

    chrome.storage.sync.get('list', function(result) {   
        if(result.list === undefined || result.list === ""){        
            mangaInfo.innerHTML = `<p class="capInfo">Nenhum Mangá Salvo!</p>`;          
        }else{
            var content = `<table align="center">`;
            var mangaList = result.list.split('\n');

            mangaList.sort(function(a, b){
                var mangaA = a.split(" - ");
                var mangaB = b.split(" - ");

                var mangaNameA = formatText(getNameByUrl(mangaA[0]));
                var mangaNameB = formatText(getNameByUrl(mangaB[0]));

                if (mangaNameA > mangaNameB) return 1;
                else return -1;
            });

            for (var i in mangaList){
                var manga = mangaList[i].split(" - ");
                var mangaName = formatText(getNameByUrl(manga[0]));        

                var link = (manga[1] !== 'x') ? manga[1] : manga[0];
                content += `<tr><td><a href="${link}" target="_blank">${mangaName}</a></td></tr>`;
            }
            content += `</tr></table>`;
            mangaInfo.innerHTML = content;
        }
    });
}

//Funcion to analyse perfil manga page
function mangaPage(url){
    chrome.storage.sync.get('list', function(result) {   
        if(result.list === undefined || result.list === ""){
            addMangaToList(url);
        }else{
            var mangaList = result.list.split('\n');
            var info = arraySearch(mangaList, url);
            refreshLabel(info, url);
        }
    });   
}

//Function to analyse cap manga page
function capPage(url, auto=0){
    chrome.storage.sync.get('list', function(result) {    
        if(result.list === undefined || result.list === ""){
            addMangaToList(url, 1, auto);
        }else{
            var mangaList = result.list.split('\n');
            var info = arraySearch(mangaList, url, 1);
            refreshLabel(info, url, 1, auto);
        }
    });
}

//Add an entry on storage
function addMangaToList(url, type=0, auto=0){
    var urlPerfilManga = (url.includes("unionleitor")) ? "https://unionleitor.top/manga/" : "https://unionmangas.top/manga/";
    var p = document.getElementById('mangaInfo');
    var mangaData = "";

    //Verify if was called from manga page or cap page
    if(type){
        var mName = url.split('/');
        mName = mName[mName.length-2].split('_');
        mName = removeElementFromArray(mName);
        var mangaName = mName.join('-');
        mangaData = urlPerfilManga + mangaName + " - " + url;
    }else{
        mangaData = url + " - x";
    }
    
    chrome.storage.sync.get('list', function(result) {      
        var mangas = (result.list === undefined || result.list === "") ? mangaData : result.list + "\n" + mangaData;
        chrome.storage.sync.set({'list': mangas});
    }); 
    
    if(!auto) p.innerHTML = `<p class="capInfo">Mangá Salvo!</p>`;
}

//Update the label with the corresponding action
function refreshLabel(info, url, type=0, auto=0){
    var mangaInfo = document.getElementById('mangaInfo');
    
    if(info === ""){ //If was a new manga, add to list
        if(!type){
            addMangaToList(url, type);
        }else{
            addMangaToList(url, type, 1);
        }
    }else{
        if(!auto) document.styleSheets[0].rules[3].style.width = '';
        //verify if this a new unread manga
        if(info[1] === 'x'){
            if(!type){
                mangaInfo.innerHTML = `<p class="capInfo">Este mangá ainda não foi lido.</p>`;
            }else{
                updateLine(info, url);
                var capNum = getNameByUrl(url);
                mangaInfo.innerHTML = `<p class="capInfo">Você está lendo Cap <i><a href="${url}" target="_blank">${capNum}</a></i></p>`;
            }
        }else{
            if(!type){
                //Get the cap number from URL
                var capNum = getNameByUrl(info[1]);
                mangaInfo.innerHTML = `<p class="capInfo">Você está lendo Cap <i><a href="${info[1]}" target="_blank">${capNum}</a></i></p>`;
            }else{
                var urlNum = getNameByUrl(url);

                var capNum = getNameByUrl(info[1]);
                var numberLabel = capNum;
                var urlData = info[1];

                if(urlNum > capNum){
                    updateLine(info, url);
                    numberLabel = urlNum;
                    urlData = url;
                }
                
                if (!auto) mangaInfo.innerHTML = `<p class="capInfo">Você está lendo Cap <i><a href="${urlData}" target="_blank">${numberLabel}</a></i></p>`;
            }
        }
    }
}

//Update the row value
function updateLine(info, url){
    chrome.storage.sync.get('list', function(result) {      
        var array = result.list.split("\n");
        for(var i in array){
            if(array[i] === info.join(" - ")){
                array[i] = info[0] + " - " + url;
            }
        }
        var mangaList = array.join("\n");
        chrome.storage.sync.set({'list': mangaList});
    });
}


/**
* Index 0 - Manga link
* Index 1 - Cap link
* 
* The type is default with the index 1
* */
function arraySearch(array, obj, type=0){
    var infos = "";
    var t = type;
   
    if(!type){
        obj = getNameByUrl(obj);
    }else{
        t = 0;
        obj = getNameByUrl(obj, 2);

        var aux = obj.split('_');
        aux = removeElementFromArray(aux);
        obj = aux.join('-');
    }
    
    obj = obj.replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');    
    for(var i in array){
        var manga = array[i].split(" - ");

        if(manga[t] !== 'x'){
           manga[t] = getNameByUrl(manga[t]);
        }
        
        manga[t] = manga[t].replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

        if(manga[t].localeCompare(obj, undefined, { sensitivity: 'base' }) === 0){
           infos = array[i].split(" - ");
        }
    }

    return infos;
}

//Function to get manga name from url
function getNameByUrl(url, index=1){
    var arrayString = url.split("/");
    return arrayString[arrayString.length-index];
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
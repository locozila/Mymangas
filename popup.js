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

function listMangas(){
    var mName = document.getElementById('mangaName');
    var mangaInfo = document.getElementById('mangaInfo');

    getMangaData().then(function(defs){
        if(defs === undefined || defs === ""){        
            mName.innerText = "Nenhum Mangá Salvo!";
        }else{
            var content = ``;
            var mangaList = defs.split('\n');

            for (i in mangaList){
                var manga = mangaList[i].split(" - ");
                var mangaName = "";

                if(manga[1] !== 'x'){
                    var aux = manga[1].split("/");
                    var mangaName = aux[aux.length-2].replace(/_/g, " ");

                    var mangaCap = manga[1].split("/");
                    var capNum = mangaCap[mangaCap.length-1];

                    content += `${mangaName} - <b><i>Cap <a href="${manga[1]}" target="_blank">${capNum}</a></i></b><br>`;
                }else{
                    var mN = manga[0].split("/");
                    mangaName = formatText(mN[mN.length-1]);

                    content += `${mangaName} - <b>X</b><br>`;
                }
            }
            mName.innerText = "Lista de Mangás";
            mangaInfo.innerHTML = content;
        }
    });
}

function formatText(text){
    var list = text.split('-');
    for(i in list){
        list[i] = list[i].charAt(0).toUpperCase() + list[i].slice(1);
    }
    return list.join(" ");
}

//Funcion to analyse perfil manga page
function mangaPage(url){
    var p = document.getElementById('mangaInfo');
    //Get the manga name from the page content
    getMangaNameFromPage('document.querySelector("body > div.container > div:nth-child(4) > div.col-md-8.tamanho-bloco-perfil > div:nth-child(1) > div > h2").outerText');

    //Analyse if this manga is already storage
    getMangaData().then(function(defs){
        if(defs === undefined || defs === ""){
            addMangaToList(url);
        }else{
            var mangaList = defs.split('\n');
            var info = arraySearch(mangaList, url);
            refreshLabel(info, url);
        }
    });
}

//Function to analyse cap manga page
function capPage(url){
    var p = document.getElementById('mangaInfo');
    var urlNumCap = url.split('/');
    urlNumCap = urlNumCap[urlNumCap.length-1];
    getMangaNameFromPage('document.evaluate("/html/body/div[1]/div/h1", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText');

    getMangaData().then(function(defs){
        if(defs === undefined || defs === ""){
            addMangaToList(url, 1);
        }else{
            var mangaList = defs.split('\n');
            var info = arraySearch(mangaList, url, 1);
            refreshLabel(info, url, 1);
        }
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
        aux = obj.split("/");
        obj = aux[aux.length-1];
    }else{
        t = 0;
        aux = obj.split("/");
        obj = aux[aux.length-2];
        aux = obj.split('_');
        aux = removeElementFromArray(aux);
        obj = aux.join('-');
    }    
    
    for(i in array){
        var manga = array[i].split(" - ");

        if(manga[t] !== 'x'){
            var aux = manga[t].split("/");
            manga[t] = aux[aux.length-1];
        }
        
        if(manga[t].localeCompare(obj, undefined, { sensitivity: 'base' }) === 0){
            infos = array[i].split(" - ");
        }
    }
    return infos;
}

//Get the storage local
async function getMangaData(){
    var mData = new Promise(function(resolve, reject){
        chrome.storage.sync.get('list', function(result) {        
            resolve(result.list);
        }); 
    });

    return await mData;
}

//Use the specific code from page to extract the name of mangá
function getMangaNameFromPage(myCode){
    var mName = document.getElementById("mangaName");
    chrome.tabs.executeScript(null, {
        code: myCode,
        allFrames: false,
        runAt: 'document_start',
    }, function(results) {
        var result = results[0].split(" - ")[0];
        mName.innerText = result;
    });
}

//Add an entry on storage
function addMangaToList(url, type=0){
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
        mangas = (result.list === undefined || result.list === "") ?  mangaData : result.list + "\n" + mangaData;
        chrome.storage.sync.set({'list': mangas});
    }); 
    
    p.innerText = "Mangá salvo!";
}

//Update the label with the corresponding action
function refreshLabel(info, url, type=0){
    var p = document.getElementById('mangaInfo');
    
    if(info === ""){ //If was a new manga, add to list
        if(!type){
            addMangaToList(url, type);
        }else{
            addMangaToList(url, type, 1);
        }
    }else{
        //verify if this a new unread manga
        if(info[1] === 'x'){
            if(!type){
                p.innerHTML = "Este mangá ainda não foi lido."
            }else{
                updateLine(info, url);
                var capNum = url.split("/");
                capNum = capNum[capNum.length-1];
                p.innerHTML = "Você está lendo Cap <b><i><a href='"+url+"' target='_blank'>"+capNum+"</a></i></b>";
            }
        }else{
            if(!type){
                //Get the cap number from URL
                var capNum = info[1].split("/");
                capNum = capNum[capNum.length-1];
                p.innerHTML = "Você está lendo Cap <b><i><a href='"+info[1]+"' target='_blank'>"+capNum+"</a></i></b>";
            }else{
                var urlNum = url.split("/");
                urlNum = urlNum[urlNum.length-1];

                var capNum = info[1].split("/");
                capNum = capNum[capNum.length-1];

                if(urlNum > capNum){
                    updateLine(info, url);
                }
                p.innerHTML = "Você está lendo Cap <b><i><a href='"+url+"' target='_blank'>"+capNum+"</a></i></b>";
            }
        }
    }
}

//Update the row value
function updateLine(info, url){
    chrome.storage.sync.get('list', function(result) {      
        var array = result.list.split("\n");
        for(i in array){
            if(array[i] === info.join(" - ")){
                array[i] = info[0] + " - " + url;
            }
        }
        var mangaList = array.join("\n");
        chrome.storage.sync.set({'list': mangaList});
    });
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

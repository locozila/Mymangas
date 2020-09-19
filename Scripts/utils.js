function formatText(text){
    text.toLowerCase();

    var listRomanNumbers = ["C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
    "X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
    "I","II","III","IV","V","VI","VII","VIII","IX"];
    
    var list = text.split('-');
    for(var i in list){
        var upper = list[i].toUpperCase();

        list[i] = (listRomanNumbers.includes(upper)) ? list[i] = upper : list[i].charAt(0).toUpperCase() + list[i].slice(1);
    }
    return list.join(" ");
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
   
    for(var i in array){
        var manga = array[i].split(" - ");

        if(manga[t] !== 'x'){
           manga[t] = getNameByUrl(manga[t]);
        }
       
        if(manga[t].localeCompare(obj, undefined, { sensitivity: 'base' }) === 0){
           infos = array[i].split(" - ");
        }
    }
    return infos;
}

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

export {
    arraySearch,
    formatText,
    getNameByUrl,
    removeElementFromArray
};
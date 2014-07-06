//HELPER FUNCTIONS
if (!document.getElementsByClassName) {
    document.getElementsByClassName=function(cn) {
        var allT=document.getElementsByTagName('*'), allCN=[], i=0, a;
        while(a=allT[i++]) {
            a.className==cn ? allCN[allCN.length]=a : null;
        }
        return allCN
    }
}

function addStyleInfo(files){
	for (var i = 0; i < files.length; i++) {
		var link = document.createElement("link");
		var root = document.getElementsByTagName('body')[0];
		var head = document.getElementsByTagName("head")[0];
		if( !head){
			head = document.createElement("head"); 
			root.appendChild( head); 
		}
		link.href = chrome.extension.getURL(files[i]);
		link.type = "text/css";
		link.rel = "stylesheet";
		head.appendChild(link);
  }
}

function addScript(files){
	for (var i = 0; i < files.length; i++) {  
		var link = document.createElement("script");
		var root = document.getElementsByTagName('body')[0];
		var head = document.getElementsByTagName("head")[0];
		if( !head){
			head = document.createElement("head"); 
			root.appendChild( head); 
		}
		link.href = chrome.extension.getURL(files[i]);
		link.type = "text/javascript";
		link.rel = "script";
		head.appendChild(link);
  }
}


var clone = (function(){ 
  return function (obj) { Clone.prototype=obj; return new Clone() };
  function Clone(){}
}());




function onReady(callbackFunction){
    if(document.readyState === "complete")
     {
	     
          callbackFunction();
     } else {
          setTimeout(function(){onReady(callbackFunction)}, 100)
     }
}



function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}




function findPos(obj) {
 var obj2 = obj;
 var curtop = 0;
 var curleft = 0;
 if (document.getElementById || document.all) {
  do  {
   curleft += obj.offsetLeft-obj.scrollLeft;
   curtop += obj.offsetTop-obj.scrollTop;
   obj = obj.offsetParent;
   obj2 = obj2.parentNode;
   while (obj2!=obj) {
    curleft -= obj2.scrollLeft;
    curtop -= obj2.scrollTop;
    obj2 = obj2.parentNode;
   }
  } while (obj.offsetParent)
 } else if (document.layers) {
  curtop += obj.y;
  curleft += obj.x;
 }
 return [curtop, curleft];
}   // end of findPos()


function removeElementsByClass(obj,className){
    elements = obj.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}
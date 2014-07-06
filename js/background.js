function adjustImage(src,sendResponse) {
	
    var img = new Image();
	img.crossOrigin="";
    img.onload = function() {
		var canvas = document.createElement("canvas");
		canvas.width = this.naturalWidth;
		canvas.height = this.naturalHeight;
		var ctx = canvas.getContext("2d");
		ctx.drawImage( this, 0, 0);

		var dataURL = canvas.toDataURL("image/jpeg", 0.93);
		delete canvas;
		sendResponse({cmd: "toDataURL", data: dataURL});
    };
    img.src = src;
	img=null;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name == "toDataURL"){
		var data=adjustImage(request.url,sendResponse);
		return true
	}else if (request.name == "noChanges"){
		var data = request.dataURL;
		return true;
	}else {
		return false;
	}
});
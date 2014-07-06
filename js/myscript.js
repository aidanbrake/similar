//debugger;

// add our plugin style file



var SearchObject = function( _imageElement){ 

    // private 
	
    this.imageElement = _imageElement;
	var theElement=_imageElement
	this.imageElement.offsetParent.onmouseover=function(event){
		var toolbar=SearchObject.prototype.getToolbar(this);
		
		SearchObject.prototype.updateSearchButtonPosition(theElement,toolbar)
		var buttons=this.getElementsByClassName('search_toolbar');  
		for (var i = 0; i < buttons.length; ++i) {
			var item = buttons[i];  
			item.style.visibility = "visible";
		}
	}
	this.imageElement.offsetParent.onmouseout=function(){
		var buttons=this.getElementsByClassName('search_toolbar');  
		for (var i = 0; i < buttons.length; ++i) {
			var item = buttons[i];  
			// item.style.visibility = "hidden";
		}
	}	
	
    this.searchButtonToolbar = document.createElement("div");		
	this.searchButtonToolbar.className="search_toolbar";	
	this.searchButtonToolbar.style.visibility = "hidden";	
	this.searchButtonToolbar.style.backgroundColor = "hidden";	
    this.searchButtonToolbar.style.zIndex = 100;	
	
	this.searchButton = document.createElement("button");
    this.searchButton.name = "SearchButton";
    this.searchButton.type = "button";
    this.searchButton.onclick = this.openSearch.bind(this)
    this.searchButton.style.zIndex = 101;
	this.searchButtonToolbar.appendChild( this.searchButton);
	this.searchButton.className="search_button";
	this.searchButton.textContent = "Search";
	
    this.searchButton = document.createElement("button");
    this.searchButton.name = "SearchButton";
    this.searchButton.type = "button";
    this.searchButton.onclick = this.crop.bind(this)
    this.searchButton.style.zIndex = 101;
    this.searchButtonToolbar.appendChild( this.searchButton);
	this.searchButton.className="search_button";
	this.searchButton.innerHTML='Crop'	
    
	
	this.imageElement.offsetParent.appendChild( this.searchButtonToolbar);
	this.updateSearchButtonPosition( this.imageElement,this.searchButtonToolbar); 
	var self=this;
	
};

    addEventListener("keydown",    function(e){ 
	
		if (e.keyCode==27){
			SearchObject.prototype.clearWindows()
		} 
	},
	false);	


SearchObject.prototype.getToolbar = function (image){
		var toolbar=image.getElementsByClassName('search_toolbar')[0];  
		return toolbar
}

SearchObject.prototype.updateSearchButtonPosition = function (image,toolbar){
	
    var left = image.offsetLeft ;
    var bottom = image.offsetTop + image.offsetHeight;
	
	toolbar.style.position="absolute";
    toolbar.style.left = ""+(left)+"px";
    toolbar.style.top = ""+(bottom-26)+"px";	
	toolbar.style.width = ""+(image.offsetWidth)+"px";	
};

SearchObject.prototype.isDialogOpen=function (){
	
	var dialog=document.body.getElementsByClassName('cortexicaDialogWindow');  
	if (dialog.length==0)
		return false
	return true;
}

SearchObject.prototype.EnableAll=function (enabled){
	
	var buttons=document.body.getElementsByClassName('search_button');  
	
	for (var i = 0; i < buttons.length; ++i) {
		var item = buttons[i];  
		if (enabled)
			item.style.display = '';
		else
		item.style.display = 'none';
	}
}

SearchObject.prototype.clearWindows = function(){
	removeElementsByClass(document,"cropClass")	
	removeElementsByClass(document,"cortexicaDialogWindow")	
	removeElementsByClass(document,"canvasreset")
}

SearchObject.prototype.draw=function(img,canvas,context,control){

	var ratio=img.naturalWidth/img.naturalHeight
	context.clearCanvas()
	context.drawImage( img, 0, 0,canvas.width,canvas.height);
}

SearchObject.prototype.crop = function(e){
	var self=this
	if (e)
	e.stopPropagation()

	this.clearWindows();
	
	chrome.runtime.sendMessage({url: this.imageElement.src,name:"toDataURL"}, function(response) {		
		if (response.cmd === "toDataURL") {
			var newImg = document.createElement("img");
			newImg.src=response.data;
			
			 
			
			var canvas = document.createElement("canvas");
			canvas.className="cropClass";
			

			
			canvas.width = self.imageElement.naturalWidth;
			canvas.height = self.imageElement.naturalHeight
			canvas.width = self.imageElement.offsetWidth;
			canvas.height = self.imageElement.offsetHeight			
			canvas.style.backgroundColor="white"
			var pos=findPos(self.imageElement)

			
			
			document.body.appendChild(canvas);
			canvas.position="absolute";
			canvas.style.top = pos[0]+"px";
			canvas.style.left = pos[1]+"px";						

			canvas.id = "cropcanvas";
		
			canvas.onclick=function(){			
				var dat=this.toDataURL("image/jpeg", 0.93);
				self.clearWindows();				
				self.searchBox(dat)
				
			}.bind(canvas);
			
			canvas.onblur=function(){
			
				self.clearWindows();
			}
			
			var ctx = canvas.getContext("2d");
			CanvasManipulation.prototype.m=1
			CanvasManipulation.prototype.l=20
			CanvasManipulation.prototype.drag=function(){}
			this.control = new CanvasManipulation(canvas, function (){self.draw(newImg,canvas,ctx,self.control)}
			,{leftTop : {x: 0, y: 0},rightBottom : {x: -1, y: -1}})

			this.control.init()
			this.control.layout()
			self.draw(newImg,canvas,ctx,this.control)
			canvas.title="Using mouse wheel to zoom in/out and press button to search for similar images. Press 1:1 to reset image and X to close window"
			var canvasreset = document.createElement("button");	
			canvasreset.innerHTML="1:1"
			canvasreset.style.position="absolute";
			canvasreset.style.top = pos[0]+"px";
			canvasreset.style.left = pos[1]+"px";			
			canvasreset.className="canvasreset"
			canvasreset.onclick=function(e){
				self.crop();
			}
			document.body.appendChild(canvasreset );
			
			var canvasclose = document.createElement("button");	
			canvasclose.innerHTML="X"
			canvasclose.style.position="absolute";
			canvasclose.style.top = pos[0]+"px";
			canvasclose.style.left = (pos[1]+self.imageElement.offsetWidth-70)+"px";			
			canvasclose.className="canvasreset"
			canvasclose.onclick=function(e){
				self.clearWindows()
			}
			document.body.appendChild(canvasclose );			
		}
	})
}

SearchObject.prototype.openSearch = function(e){
	e.stopPropagation()
	var self=this;

	this.clearWindows()

	chrome.runtime.sendMessage({url: this.imageElement.src,name:"toDataURL"}, function(response) {
		if (response.cmd === "toDataURL") {
			self.searchBox(response.data);
		}
	});
}


SearchObject.prototype.dynamicImages = function(container,loadingImg,dataURL,category){	
	var http = new XMLHttpRequest();
    var url = "http://apifs.cortexica.com/api/searchsimilar";

    http.open("POST", url, true);
    var params = new FormData();
    params.append( "ApiKey", "EJNBG349FJR459NE68E502Q39JS9BNDME3059EJFNS83H92L"); // asos live
    params.append( "Longitude", "0.00");
    params.append( "Latitude", "0.84");
    params.append( "DeviceName", "TestDrive");
    params.append( "AppVersion", "CortexicaDemo=1.0.0");
    params.append( "CategoryId", category);  
    params.append( "ColourRatio", "0");
    params.append( "TextureRatio", "0");
    params.append( "Image", dataURItoBlob( dataURL));
      console.log(params)  
    http.onreadystatechange = function() {//Call a function when the state changes.
    	if(http.readyState == 4){
          if( http.status == 200) {
            var data = JSON.parse( http.response)["fashions"];

			
			if (loadingImg!=null&&loadingImg.parentNode!=null)
				loadingImg.parentNode.removeChild( loadingImg);
            
            for( var i = 0; i < data.length; i++){
                
                var a = document.createElement('a');
                a.href = data[i].productPageURL;
                a.title=data[i].description;
				
                var imgArea = document.createElement('div');
                imgArea.className = "cortexicaThumbnailArea";
                a.appendChild( imgArea);
				
				
                var imgTitle = document.createElement('div');
				imgTitle.innerHTML=data[i].title;
                imgTitle.className = "cortexicaThumbnailTitle";
                imgArea.appendChild( imgTitle);

                
                var img = document.createElement('img');
                img.src = data[i].imageURL;
                img.className = "cortexicaThumbnail";
                imgArea.appendChild( img);
				container.appendChild( a);
            }
          } else {
            alert(http.statusText);
          }
    	}
    }
    
    http.send( params);
}

SearchObject.prototype.searchBox = function(dataURL){	
	var self=this;
    var root = document.getElementsByTagName('body')[0];
    var rect = this.imageElement.getBoundingClientRect();
    var scrollX = window.pageXOffset; 
    var scrollY = window.pageYOffset;
    var posX = scrollX+rect.right;
    var posY = scrollY+rect.top; 

    var dialogDiv = document.createElement('div');
    dialogDiv.style.position="absolute";
    dialogDiv.style.left = ""+posX+"px";
    dialogDiv.style.top = ""+posY+"px";
    dialogDiv.className = "cortexicaDialogWindow";
	dialogDiv.id="dialogDiv"
    document.getElementsByTagName('body')[0].appendChild(dialogDiv);


    var theHeader = document.createElement('div');
    theHeader.className = "cortexicaHeader dynDiv_moveParentDiv";
	theHeader.innerHTML="Similar Items";
	
    var theHeaderClose = document.createElement('div');
    theHeaderClose.className = "cortexicaHeaderClose";	
	theHeaderClose.innerHTML="x";
	theHeaderClose.onclick=function(e){self.clearWindows()}
	theHeader.appendChild(theHeaderClose);
	dialogDiv.appendChild(theHeader);

	
	
	
    this.imageDiv = document.createElement('div');
    this.imageDiv.className = "cortexicaImageArea";
    dialogDiv.appendChild( this.imageDiv);  
    var imageDiv = this.imageDiv;

    this.imageDiv2 = document.createElement('div');
    this.imageDiv2.className = "cortexicaImageArea";
    dialogDiv.appendChild( this.imageDiv2);  
    this.imageDiv2.style.display = 'none';
    var imageDiv2 = this.imageDiv2;

    var loadingImg = document.createElement('img');
    loadingImg.className = "cortexicaWaitingImage";
    loadingImg.src = chrome.extension.getURL("images/loading7.gif");
    this.imageDiv.appendChild( loadingImg);

    var bottomDiv = document.createElement('div');
    bottomDiv.className = "cortexicaBottomArea";
    bottomDiv.textContent = "Search powered by ";
    dialogDiv.appendChild( bottomDiv);

    var cortexicaLink = document.createElement('a');
    cortexicaLink.className = "cortexicaCortexicaLink";
    cortexicaLink.href = "http://www.cortexica.com";
    cortexicaLink.textContent = " Cortexica ";
    bottomDiv.appendChild( cortexicaLink);

    var dressLink = document.createElement('a');
    dressLink.textContent = " Show Dresses";
    bottomDiv.appendChild( dressLink);
    dressLink.style.display = 'none';                

    var topLink = document.createElement('a');
    topLink.textContent = " Show Tops";
    bottomDiv.appendChild( topLink);


    dressLink.onclick = function(){
        imageDiv.style.display = 'block';
        dressLink.style.display = 'none';                
        imageDiv2.style.display = 'none';
        topLink.style.display = 'inline';                
    };
    topLink.onclick = function(){
        imageDiv.style.display = 'none';
        dressLink.style.display = 'inline';                
        imageDiv2.style.display = 'block';
        topLink.style.display = 'none';                
    };
    

    
    var closeLink = document.createElement('a');
    closeLink.className = "cortexicaCloseLink";
    closeLink.onclick = function(){
		self.clearWindows();
    };
    closeLink.textContent = "Close";
    bottomDiv.appendChild( closeLink);
    
	var dynDiv_resizeDiv_tl = document.createElement('div');
	dynDiv_resizeDiv_tl.className = "dynDiv_resizeDiv_tl";
	dialogDiv.appendChild( dynDiv_resizeDiv_tl);
	
	var dynDiv_resizeDiv_tr = document.createElement('div');
	dynDiv_resizeDiv_tr.className = "dynDiv_resizeDiv_tr";
	dialogDiv.appendChild( dynDiv_resizeDiv_tr);

	var dynDiv_resizeDiv_bl = document.createElement('div');
	dynDiv_resizeDiv_bl.className = "dynDiv_resizeDiv_bl";
	dialogDiv.appendChild( dynDiv_resizeDiv_bl);

	var dynDiv_resizeDiv_br = document.createElement('div');
	dynDiv_resizeDiv_br.className = "dynDiv_resizeDiv_br";
	dialogDiv.appendChild( dynDiv_resizeDiv_br);	
	
 
	ByRei_dynDiv.init.main()
    
	this.dynamicImages(imageDiv, loadingImg,dataURL,"10201")
	this.dynamicImages(imageDiv2,loadingImg,dataURL,"10202")	
          
};



addStyleInfo(["css/myStyle.css"]);
addStyleInfo(["css/dynamicdiv.css"]);
addScript(["js/dynamicdiv.js"]);
onReady(runAll);

function runAll(){ 

  var images = document.images;
  for (var i=0; i<images.length; i++){
    var img = images[i];
    if( img.width * img.height > 66000 & img.naturalHeight * img.naturalWidth > 20000 & (img.offsetWidth > 0 || img.offsetHeight > 0)){
        new SearchObject( img);
    }
  }
}



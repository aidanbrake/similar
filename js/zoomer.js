var Zoomer = $.klass({
	//image 	Image obj
	//level 	Zoom Level
	//radius 	Radius of magnifying
	// x left
	// y  top
	canvas:null,
	context:null,
	zcanvas:null,
	zcontext:null,	
	mouseX:-1,
	mouseY:-1,
	mouseDown:false,
	init: function( options ) {
		var self=this
		this.options = options;
		
		if (this.options.level===undefined) this.options.level=2;
		if (this.options.radius===undefined) this.options.radius=40;
		
		if (this.options.cwidth===undefined) this.options.cwidth=100;		
		if (this.options.cheight===undefined) this.options.cheight=100;				
	
		this.canvas = $(document.createElement("canvas"));
		var img=$(this.options.image);
		
		this.canvas.addClass("cropClass");
		this.canvas.css("width",img.css("width"));		
		this.canvas.css("height",img.css("height")	);		
		
		this.canvas.width(img.width())	
		this.canvas.height(img.height())

		this.canvas[0].width=img.width()	
		this.canvas[0].height=img.height()
		
		this.canvas.css("backgroundColor","white")
		$(document.body).append(this.canvas);
		this.canvas.css("position","absolute");

		this.canvas.css("top",this.options.y+"px");
		this.canvas.css("left",this.options.x+"px");						

		this.canvas.attr("id", "cropcanvas");
		
		
		
		
		
		this.context = this.canvas[0].getContext("2d");
		this.draw();
		
		this.canvas.bind("mousedown.move_circle",self.mouseDown.bind(self))
		this.zoomedCanvasOn()
		
		//this.showInfo(img)
		//this.showInfo(this.canvas)
		/*	canvas.onclick=function(){			
				var dat=this.toDataURL("image/jpeg", 0.93);
				self.clearWindows();				
				self.searchBox(dat)
				
			}.bind(canvas);
			
			canvas.onblur=function(){
			
				self.clearWindows();
			}	
		*/
	},
	getCanvas:function(){
		return this.canvas;
	},
	getZoomedCanvas:function(){
		return this.zcanvas;
	},	
	mouseDown:function(e){
		var self=this
		self.mouseDown=true;
		
		self.mouseX=e.offsetX
		self.mouseY=e.offsetY
		self.canvas.bind( 'mouseup.move_circle' , self.mouseUp.bind(this));	
		self.canvas.bind( 'mousemove.move_circle' , self.mouseMove.bind(this));	
		this.context.save();
		self.zoomedCanvasOn()
		self.draw()
	},	
	mouseUp:function(e){
		var self=this
		self.mouseDown=false;
		self.mouseX=-1
		self.mouseY=-1	
		self.draw()		
		self.canvas.unbind( 'mouseup.move_circle' );	
		self.canvas.unbind( 'mousemove.move_circle' );		
		self.context.restore();
		self.zoomedCanvasOff()
	},
	mouseMove:function(e){
		var self=this	
		self.mouseX=e.offsetX
		self.mouseY=e.offsetY		

		self.draw()		
		
	},	
	draw:function(){
		var self=this
		this.clearCanvas()	
		var img=this.options.image[0]
		var context=this.context
		this.context.drawImage( img, 0, 0,this.canvas[0].width,this.canvas[0].height);
		
		if ( self.mouseX>-1&&self.mouseY>-1 ){
			context.beginPath();
			context.rect(this.mouseX-(self.options.cwidth/2), this.mouseY-(self.options.cheight/2), self.options.cheight,self.options.cheight);
			context.strokeStyle = '#ffffff';
			context.stroke()
			this.zdraw(this.mouseX-(self.options.cwidth/2), this.mouseY-(self.options.cheight/2), self.options.cheight,self.options.cheight);
		}
	}	,
	clearCanvas:function(){
		this.context.save();
		this.context.setTransform(1,0,0,1,0,0);
		this.context.clearRect(0,0,this.canvas.width(),this.canvas.height());
		this.context.restore();
	},
	
	zoomedCanvasOn:function(){
		//console.log("on");
		var img=$(this.options.image);
		this.zcanvas = $(document.createElement("canvas"));		
		this.zcanvas.addClass("cropClass");
		this.zcanvas.css("width",img.css("width"));		
		this.zcanvas.css("height",img.css("height")	);		
		this.zcanvas.css("border","1px solid white");		
		
		this.zcanvas.width(img.width())	
		this.zcanvas.height(img.height())

		this.zcanvas[0].width=img.width()	
		this.zcanvas[0].height=img.height()
		
		this.zcanvas.css("backgroundColor","white")
		$(document.body).append(this.zcanvas);
		this.zcanvas.css("position","absolute");

		this.zcanvas.css("top",this.options.y+"px");
		this.zcanvas.css("left",30+this.options.x+this.zcanvas[0].width+"px");						

		this.zcanvas.attr("id", "target");
		this.zcontext = this.zcanvas[0].getContext("2d");
		this.resetZoom()
		
	},
	zdraw:function(x,y,w,h){
		
		this.zcontext.drawImage(this.canvas[0], x,y,w,h,0,0,this.zcanvas.width(),this.zcanvas.height());
	},
	zoomedCanvasOff:function(){
	return;
		console.log("off");
		if (this.zcanvas!=null){
			this.zcontext=null;
			var obj=this.zcanvas;
			if (!(obj  instanceof jQuery)){}			
				obj=$(obj);
			obj.remove();
		}	
	
	},
	resetZoom:function(){
		this.zdraw(0,0,this.canvas.width(),this.canvas.height())
	}	,
	showInfo:function(element){
		var obj=element;
		if (element  instanceof jQuery){}
		else
			obj=$(element);
		console.log(obj)	
		console.log(obj.prop("tagName")+" "+obj.attr("id")+"\n"+ 
					"------------------------\n"+
					"Width:"+ obj.width()+"\n"+
					"Height:"+ obj.height()+"\n"+
					"NWidth:"+ obj[0].naturalWidth+"\n"+
					"NHeight:"+ obj[0].naturalHeight+"\n"+					
					"CSS Width:"+ obj.css("width")+"\n"+
					"CSS Height:"+ obj.css("height")+"\n"+
					"Offset Left:"+ obj.offset().left+"\n"+
					"Offset Top:"+ obj.offset().top+"\n"+					
					"CSS Left:"+ obj.css("left")+"\n"+
					"CSS Top:"+ obj.css("top")+"\n"+							
					"Position Top:"+ obj.position().top+"\n"+
					"Position Left:"+ obj.position().left+"\n"					
					)
	}
	
})
		



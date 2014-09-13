  /* options
	url Search Location
	key API KEY,
	categories Categories to open
	minX  Minimum image width to qualify	
	minY  Minimum image height to qualify
	images Image collection eg. document.images for all images
	theme Theme to use for box
	debug true or false for debug info
	loadingImage
  */
var Searchbox = $.klass({
	canvas:null,
	context:null,
	dataURL:null,
	items:[],
	gridItems:[],
	imageObjects:[],
	loadingImage:null,
	loadingContainer:null,
	loadingContainerImage:null,
	loadingContainerLogo:null,
	resultContainer:null,
	dialogWindow:null,
	zoomWindow:null,
	initialized:false,
	genderOptionFlag:false,
	currentViewOption: "grid",
	currentCategory: null,
	currentIndexOfCategory:0,
	init: function( options ) {

		this.options = options
		this.updateFromLocalStorage();
		
		this.options.debug==(this.options.debug===undefined?false:this.options.debug)

		if (this.options.minX===undefined) this.options.minX=200
		if (this.options.minY===undefined) this.options.minY=100
		
		if (this.options.url===undefined) this.options.url="http://apifs.cortexica.com/api/searchsimilar"
		if (this.options.loadingImage===undefined) {
			this.options.loadingImage="images/loading7.gif"
		}

		if (this.options.loadingContainerImage === undefined) this.options.loadingContainerImage = "images/loadingContainerImage.gif"
		
		if (this.options.loadingContainerLogo === undefined) this.options.loadingContainerLogo = "images/loadingContainerLogo.gif"			
		
		if (this.options.images!=undefined){
			//this.logger(this.options.images.length)
			
			for (var i=0; i<this.options.images.length; i++){
				var img = this.options.images[i];
				//if( img.width * img.height > 66000 & img.naturalHeight * img.naturalWidth > 20000 & (img.offsetWidth > 0 || img.offsetHeight > 0)){
				var totalPixels=this.options.minX * this.options.minY
				
				
				
				if( img.width * img.height > (totalPixels*3) & img.naturalHeight *  img.naturalWidth > totalPixels & (img.offsetWidth > 0 || img.offsetHeight > 0)){
					this.setupImage(img)
				}
			}
		}

		if (this.options.genderOptionFlag === undefined)
			this.options.genderOptionFlag = false;

		if (this.currentCategory == null) this.options.categories[0].value[0];
	},

	updateFromLocalStorage: function() {
		var self = this;
		chrome.runtime.sendMessage({name: "getOptionData"}, function(response) {
			self.options.categories = response.categories || self.options.categories;
			self.options.apiKey = response.apiKey || self.options.apiKey;
			self.options.genderOptionFlag = response.genderOption || self.options.genderOptionFlag;
			self.refreshCurrentCategory();
		});
	},

	sleep : function(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds){
				break;
			}
		}
	},

	refreshCurrentCategory: function() {
		var categories = this.options.categories;
		for ( var i = 0; i < categories.length; i++ )
		{
			if ( categories[0].value.length > 0 ) {
				this.currentCategory = categories[0][0];
				return;
			}
		}
		this.currentCategory = null;
		return;
	},

	logger:function (text){
		if (this.options.debug){
			if (arguments.length>1)
				console.log(arguments)
			else
				console.log(text)
		}
	},
	clearWindows:function(){
		removeElementsByClass(document,"cropClass")	
		removeElementsByClass(document,"cortexicaDialogWindow")	
		removeElementsByClass(document,"canvasreset");
		$('#canvasThumbResult').remove();
	},
	getToolbar:function(image){ 
		var toolbar=image.parent().find('.cortexica_search_toolbar');  
		return toolbar
	},
	getTopMenubar: function(image) {
		var topMenubar = image.parent().find('.cortexica_top_menubar');
		return topMenubar;
	},

	isFinishedAjaxRequest:function() {
		return true;
		// return this.currentIndexOfCategory == this.countOfCategories;
	},

	initGridList:function() {
		self = this;
		if ( self.gridItems != null && self.getCurrentCategory().id == $('#gridViewCategorySelect').val() )
		{
			// jQuery(document).ready(function($){

				//	Getting items for grid view
					var gridResult = [];
					var itemClassName = "cortexicaGridImageArea" + $('#gridViewCategorySelect').val();
					for(var i = 0; i < self.gridItems.length; i++) {
						var curItem = self.gridItems[i];
						if ( curItem.hasClass(itemClassName) )
							gridResult.push(curItem);
					}

					if ( gridResult[0] == null )
						return;

					$('.item-found-grid-container li').remove();
					$('.item-found-grid-container').append(gridResult);
					$('.item-found-grid-container li').hover(
						function() {
							$(this).find('.gridItemOverlay').show();
						},
						function() {
							$(this).find('.gridItemOverlay').hide();
						});
				//--------------------------------------

				// $('#gridViewCategorySelect').change();
			// });
		}
		return false;
	},

	initCarousel:function(flag) {
		self = this;
		if ( (this.currentIndexOfCategory != 0 && this.isFinishedAjaxRequest() && self.items != null) || (flag) )
		{
			jQuery(document).ready(function($){
				//	Getting items for closeup view
					var result = [];
					var itemClassName = "cortexicaCloseupImageArea" + $('#closeupViewCategorySelect').val();
					for(var i = 0; i < self.items.length; i++) {
						var curItem = self.items[i];
						if ( curItem.hasClass(itemClassName) )
							result.push(curItem);
					}

					if ( result[0] == null )
						return;

					$('.bx-wrapper').remove();
					$('.bxslider').remove();
					slider = $(document.createElement('ul')).addClass('bxslider');
					slider.append(result);
				

					//	Initializing hover state ...
					$('.hover-state a').attr({'href': result[0].find('img').attr('href')});
					$('#cycle-1 img').attr('src', result[0].find('img').attr('src'));
					$('.hover-state label').text(result[0].find('img').attr('title'));

					var tempItemNameText = result[0].find('img').attr('name');
					$('.hover-state label')
							.text((tempItemNameText == null)
								? "Empty"
								: (tempItemNameText.length > 30) ? (tempItemNameText.substr(0, 27) + "...") : tempItemNameText)
							.attr({
								'title' : tempItemNameText
							});
					result[0].addClass('active');
					//-----------------------------

					$('#slideshow-2').append(slider);

					jQuery(document).ready(function($){

						$('.results .prv > .bx-prev').remove();
						$('.results .nxt > .bx-next').remove();
						
						// if ($('.bxslider').)
						$('.bxslider').bxSlider({
							infiniteLoop: false,
							pagerType: 'short',
							minSlides: 4,
							maxSlides: 4,
							slideWidth: 150,
							slideMargin: 10,
							moveSlides: 4,
							hideControlOnEnd: true,
							nextText: "",
							prevText: "",
							nextSelector: '.results .nxt',
							prevSelector: '.results .prv'
						});

						$('.bxslider li').click(function() {
							event.preventDefault();
							event.stopPropagation();

							$('.cortexicaDialogWindow .results .bx-viewport li.active').removeClass('active');
							$(this).addClass('active');
							$('.hover-state a').attr({'href': $(this).find('img').attr('href')});
							$('#cycle-1 img').attr('src', $(this).find('img').attr('src'));

							var tempItemNameText = $(this).find('img').attr('name');
							$('.hover-state label')
									.text((tempItemNameText == null)
											? "Untitled"
											: (tempItemNameText.length > 30) ? (tempItemNameText.substr(0, 27) + "...") : tempItemNameText)
									.attr({
										'title' : tempItemNameText
									});
						});
					});

  				//------------------------------------
			});

			this.currentIndexOfCategory = 0;
			$('#slideshow-2').animate({'opacity': 1}, "fast");
			return true;
		}
		return false;
	},

	correctPosition:function(image){
		var toolbar=(this.getToolbar(image));
		var topMenubar = (this.getTopMenubar(image));
		var left = image.position().left ;
		var bottom = image.position().top + image.height();
		
		toolbar.css({
						"position": "absolute",
						"left": ""+(left)+"px",
						"height": "" + (image.height() * 0.07) + "px",
						"top": ""+(bottom - image.height() * 0.07)+"px",
						"padding": "" + ((image.height() * 0.07 - 40) / 2) + "px 20px 0",
						"width": "" + (image.width() - 40) + "px"
					});


		topMenubar.css({
						"position": "absolute",
						"left": "" + (left) + "px",
						"top": "" + (image.position().top) + "px",
						"width": "" + (image.width() - 18 * 2) + "px"
					});

		this.initCarousel(false);
		// this.initGridList();
	},

	setupImage:function(image){
		var self=this
		var img=$(image),
			parent = img.parent();
		img.parent().mouseenter(function(event){
			event.preventDefault();
			event.stopPropagation();

			var toolbar=self.getToolbar(this),
				topMenubar = self.getTopMenubar(this);

			self.correctPosition(img);
			toolbar.css("visibility", "visible");
			topMenubar.css("visibility", "visible");

		}.bind(img))
		
		img.parent().mouseleave(function(event){
			event.preventDefault();
			event.stopPropagation();

			var toolbar=self.getToolbar(this),
				topMenubar = self.getTopMenubar(this);
			toolbar.css("visibility", "hidden");
			topMenubar.css("visibility", "hidden");
		}.bind(img))

		var searchButtonToolbar = $(document.createElement("div"));
		searchButtonToolbar.addClass("cortexica_search_toolbar");	
		searchButtonToolbar.css("visibility","hidden");
		searchButtonToolbar.css("zIndex",100);
		searchButtonToolbar.click (function(event) {
			event.preventDefault();
			event.stopPropagation();
		});
	
		var searchButton = $(document.createElement("span"));
		searchButton.name = "SearchButton";
		searchButton.click (function(event) {
				self.openSearch(img);
				event.preventDefault();
				event.stopPropagation();
			});
		searchButton.css("zIndex",101);
		searchButton.addClass("styledButton search_button");
		searchButtonToolbar.append( searchButton);		

		cropButton = $(document.createElement("span"));
		cropButton.name = "CropButton";
		cropButton.click (function(event) {
				self.clearWindows();
				self.crop(img);
				event.preventDefault();
				event.stopPropagation();
			});
		cropButton.css("zIndex",101);
		cropButton.addClass("crop_button styledButton");
		searchButtonToolbar.append( cropButton);

		var infoButton = $(document.createElement("span")),
			tooltipText = "Useful Tips\nSearch: Clicking search will show a list of products similar to the one you are looking at.\nCrop: If the product photo has colorful objects in the background, use this tool to improve your search results. Simply click \"Crop\", select the area, then click \"Search\".";

		infoButton.name = "InfoButton";
		infoButton.addClass("info_button styledButton");
		infoButton.attr({
							"title": tooltipText,
							"id": "infoButton"
						});
		infoButton.click( function(event) {
				event.preventDefault();
				event.stopPropagation();
			});
		searchButtonToolbar.append(infoButton);

		var tooltipDiv = $(document.createElement('div'))
							.attr("id", "divToolTip")
							.css({
								"background-color": "#FFFFE1",
								"border": "1px solid black",
								"border-radius": "3px",
								"color": "black",
								"font-family": "Tahoma",
								"font-size": "12px",
								"padding": "2px",
								"max-width": "150px",
								"display": "none"
							});

		img.parent().append( searchButtonToolbar);
		img.parent().append(tooltipDiv);
		this.correctPosition(img); 
	},

	crop:function(img) {
		var self = this,
			onSelected = function(img, sel) {
				if ( sel.width * sel.height == 0 )
				{
					self.dataURL = null;
					return;
				}
				$('#canvasThumbResult').remove();
				$('#imgThumbResult').remove();
				$body =  $('body');
				$x_ratio = img.width / img.naturalWidth;
				$y_ratio = img.height / img.naturalHeight;
				$tempCanvas = $('<canvas/>', {'id': 'canvasThumbResult', 'display':'block'})
							.width(sel.width)
							.height(sel.height)
							.css({
								'display': 'none',
								'position': 'absolute',
								'top': sel.height + 50 + 'px',
								'left': "" + (img.width + 50) + "px"
							})
							.appendTo($body);
				$tempImage = $('<img/>', {'id': 'imgThumbResult', 'display': 'block'})
							.css({
								'display': 'none',
								'position': 'absolute',
								'top': '0',
								'left': "" + (img.width + 50) + "px"
							})
							.width(sel.width)
							.height(sel.height)
							.appendTo($body);

				$tempImage.load(function(){
						var canvas = document.getElementById('canvasThumbResult');
						var ctx = canvas.getContext("2d");
						ctx.canvas.width = sel.width;
						ctx.canvas.height = sel.height;
						ctx.drawImageFromRect(img, sel.x1 / $x_ratio, sel.y1 / $y_ratio, sel.width / $x_ratio, sel.height / $y_ratio, 0, 0, sel.width, sel.height);
						self.dataURL = canvas.toDataURL("Image/Jpeg");
					});
				$tempImage.attr("src", img.src);

			},
			onCanceled = function() {
					self.dataURL = null;
					self.clearWindows();
			}

  		$(img).imgAreaSelect({
	        handles: true,
	        onSelectEnd: onSelected,
	        cancelSelection : onCanceled,
	    });

		event.preventDefault();
		event.stopPropagation();
	},


	zoom:function(img){
		var self=this;
		
		chrome.runtime.sendMessage({url: img.attr("src"),name:"toDataURL"}, function(response) {		
			if (response.cmd === "toDataURL") {
				var newImg = $(document.createElement("img"));
				newImg.attr("src",response.data);		

				newImg.css("width",img.css("width"));
				newImg.css("height",img.css("height"));
				newImg.css("position","absolute");				
				newImg.css("top",img.offset().top+"px");
				newImg.css("left",img.offset().left+"px");				
				
				var zoomer=new Zoomer({
					image:newImg,
					x:img.offset().left,
					y:img.offset().top
				
				});

				var pos=zoomer.getCanvas().offset();

				
				var canvasclose = $(document.createElement("button"));	
				canvasclose.text("X")
				canvasclose.addClass("canvasreset styledButton")
				canvasclose.css("position","absolute");
				canvasclose.css("top",pos.top+"px");
				$(document.body).append(canvasclose );			
				canvasclose.css("left",(pos.left+img.width()-canvasclose.width())+"px");				
										
				canvasclose.click(function(e){
					self.clearWindows()
				})
				
				var canvasreset = $(document.createElement("button"));	
				canvasreset.text("1:1")
				canvasreset.addClass("canvasreset styledButton")
				canvasreset.css("position","absolute");
				canvasreset.css("top",pos.top+"px");
				canvasreset.css("left",pos.left+"px");
				$(document.body).append(canvasreset );					
				canvasreset.click(function(e){
					zoomer.resetZoom()
				})				
				
				var canvassend = $(document.createElement("button"));	
				canvassend.text("Search")
				canvassend.addClass("canvasreset styledButton")
				canvassend.css("position","absolute");
				canvassend.css("left",pos.left+"px");
				canvassend.css("top",(pos.top+img.height()-canvasclose[0].offsetHeight-10)+"px");				
				$(document.body).append(canvassend );					
			
				canvassend.click(function(e){
					var data=zoomer.getZoomedCanvas()[0].toDataURL("image/jpeg", 0.93);
					self.clearWindows();
					self.openDialog(img,data)
				});
				
			}
		})
		event.preventDefault();
		event.stopPropagation();
	},
	
	openSearch:function(img){
		var self=this;
		this.clearWindows();

		if (this.dataURL == null) {
			chrome.runtime.sendMessage({url: img.attr("src"),name:"toDataURL"}, function(response) {
				if (response.cmd === "toDataURL") {
					self.updateFromLocalStorage();
					self.openDialog(img,response.data);
				}
			});
		} else {
			self.updateFromLocalStorage();
			self.openDialog(img,this.dataURL);
		}
	},

	getGenderFromId: function(id) {
		for( var i = 0; i < this.options.categories.length; i++ ) {
			for( var j = 0; j < this.options.categories[i].value.length; j++ ) {
				var curCategory = this.options.categories[i].value[j];
				if ( curCategory.id == id )
					return this.options.categories[i].gender;
			}
		}
		return 'women';
	},

	getGenderFromCategory: function(category) {
		return (category == undefined) ? null : this.getGenderFromId(category.id);
	},

	getCategoryFromId: function(id) {
		for( var i = 0; i < this.options.categories.length; i++ ) {
			for( var j = 0; j < this.options.categories[i].value.length; j++ ) {
				var curCategory = this.options.categories[i].value[j];
				if ( curCategory.id == id )
					return curCategory;
			}
		}
		return null;
	},

	getCategoriesFromGender: function(gender) {
		for (var i = self.options.categories.length - 1; i >= 0; i--) {
			if ( self.options.categories[i].gender == gender )
				return self.options.categories[i];
		};

		return {};
	},

	openDialog:function(img,dataURL){
		var self=this;
		var rect = img[0].getBoundingClientRect();
		var scrollX = window.pageXOffset; 
		var scrollY = window.pageYOffset;
		var posX = scrollX+rect.right;
		var posY = scrollY+rect.top;
		var curCategory = this.currentCategory;

		var dialogDiv = $(document.createElement('div'));
		dialogDiv.css("position","absolute");
		dialogDiv.css("left",""+img.width()+"px");
		dialogDiv.css("top", 0);
		dialogDiv.css("width", "" + img.width() + "px");
		dialogDiv.css("height", "" + (img.height() - 50) + "px");
		dialogDiv.addClass ("cortexicaDialogWindow");
		dialogDiv.attr("id","dialogDiv")
		$(document.getElementsByTagName('body')[0]).append(dialogDiv);

		$(document.body).keydown(function(e){ 
			if (e.keyCode==27){
				self.clearWindows()
			} 
		});

		self.loadingContainer = $(document.createElement('section'));
		self.loadingContainer.addClass("loader hidden left");

		var loadingContainerTitle = $(document.createElement('h1'));
		loadingContainerTitle.text("Finding matches...");
		self.loadingContainer.append(loadingContainerTitle);

		var loadingHolderContainer = $(document.createElement('div'));
		loadingHolderContainer.addClass("loader-holder");
		self.loadingContainer.append(loadingHolderContainer);

		var loadingContainerLogo = $(document.createElement('div'));
		loadingContainerLogo.addClass("loadingContainerLogo");
		self.loadingContainer.append(loadingContainerLogo);

		var resultSection = $(document.createElement('section'));
		resultSection.addClass('results left');
		$(document.createElement('h1')).text('Similar Items').appendTo(resultSection);

		var viewOptionContainer = $(document.createElement('div')).addClass('viewOptionContainer'),
			closeupViewOption = $(document.createElement('h6')).addClass('viewOption').attr('id', 'viewOption-closeup').text('Closeup View'),
			gridViewOption = $(document.createElement('h6')).addClass('viewOption').attr('id', 'viewOption-grid').text('Grid View');

		
		viewOptionContainer.append(closeupViewOption, $(document.createElement('h6')).text(' | '), gridViewOption);
		resultSection.append(viewOptionContainer);


		/**
		 *	Start of Closeup view
		 */
			var itemFoundDiv = $(document.createElement('div')).addClass('item-found-closeup hidden'),
				slideShow1 = $(document.createElement('div')).attr("id", "slideshow-1"),
				cycle1 = $(document.createElement('div')).attr("id", "cycle-1").addClass("cycle-slideshow"),
				tempDiv1 = $(document.createElement('div')),
				img1 = $(document.createElement('img')).css({'width': 'auto', 'height': '100%'}),
				div1 = $(document.createElement('div')).addClass('hover-state'),
				label1 = $(document.createElement('label')),
				a1 = $(document.createElement('a')).addClass('btn').text('Visit Website').attr({'target': '_blank', 'href': '#'}),
				itemFoundCloseupDivgenderCaption = $(document.createElement('label')).addClass('gender-caption').text('Show'),
				itemFoundCloseupDivControlsContainer = $(document.createElement('div')).addClass('item-found-closeup-controls'),
				itemFoundCloseupDivGenderWomen = $(document.createElement('input')).attr({
																					'id' : 'closeup-women',
																					'value' : 'women',
																					'class' : 'closeup-gender',
																					'name' : 'closeup-gender',
																					'type' : 'radio',
																				}),
				itemFoundCloseupDivGenderWomenLabel = $(document.createElement('label')).attr('for', 'closeup-women').text('Women'),
				itemFoundCloseupDivGenderMen = $(document.createElement('input')).attr({
																					'id' : 'closeup-men',
																					'value' : 'men',
																					'class' : 'closeup-gender',
																					'name' : 'closeup-gender',
																					'type' : 'radio'
																				}),
				itemFoundCloseupDivGenderMenLabel = $(document.createElement('label')).attr('for', 'closeup-men').text('Men'),
				closeupDivCategorySelect = $('<select/>', {'id': 'closeupViewCategorySelect', 'class':'categorySelect'}),

				categoryContainer = $('<div/>', {'id': 'categoryContainer', 'class': 'categoryContainer'}),
				categorySelect = $('<select/>', {'id': 'categorySelect', 'class':'categorySelect'}),

				slideShow2 = $(document.createElement('div')).attr("id", "slideshow-2"),
				cycle2 = $(document.createElement('div')).attr("id", "cycle-2").addClass("cycle-slideshow"),
				pager1 = $(document.createElement('p')).addClass('pager'),
				pager2 = $(document.createElement('p')).addClass('pager'),
				logo = $(document.createElement('a')).addClass('logo').attr({'href':'http://www.cortexica.com/', 'target':'_blank'});
				

			cycle1.hover(
				function(){
					$('.hover-state').css('display', 'block');
				},
				function() {
					$('.hover-state').css('display', 'none');
				}
			);
			
			
			$(document.createElement('a')).addClass('cycle-prev prv').attr("href", "#").appendTo(pager1);
			$(document.createElement('a')).addClass('cycle-prev nxt').attr("href", "#").appendTo(pager1);
			div1.append(label1);
			div1.append(a1);
			tempDiv1.append(img1);			
			tempDiv1.append(div1);
			cycle1.attr("data-cycle-slides", "> div");
			cycle1.attr("data-cycle-timeout", "0");
			cycle1.attr("data-cycle-prev", "#slideshow-2 .cycle-prev");
			cycle1.attr("data-cycle-next", "#slideshow-2 .cycle-next");
			cycle1.attr("data-cycle-fx", "tileBlind");
			cycle1.append(tempDiv1);
			slideShow1.append(cycle1);
			itemFoundDiv.append(slideShow1);

			$(document.createElement('a')).addClass('cycle-prev prv').appendTo(pager2);
			$(document.createElement('a')).addClass('cycle-next nxt').appendTo(pager2);
			cycle2.attr("data-cycle-slides", "> div");
			cycle2.attr("data-cycle-timeout", "0");
			cycle2.attr("data-cycle-fx", "carousel");
			cycle2.attr("data-cycle-carousel-visible","4");
	        cycle2.attr("data-cycle-carousel-fluid", true);
	        cycle2.attr("data-allow-wrap", false);

			var slider = $(document.createElement('ul')).addClass('bxslider');
			slideShow2.append(slider);
			slideShow2.append(pager2);
			///////////////////

			if (self.options.genderOptionFlag == "true" || self.options.genderOptionFlag == true) {
				if ( self.getGenderFromCategory(self.getCurrentCategory()) == 'women') {
					var curGenderCategory = self.getCategoriesFromGender("women");
					itemFoundCloseupDivGenderWomen.attr('checked', true);
					for (var i = 0; i < curGenderCategory.value.length; i++){
						// var opt = "<option value='" + curGenderCategory.value[i].id + "'>" + curGenderCategory.value[i].value + "</option>";
						var $opt = $('<option/>', {'value': curGenderCategory.value[i].id}).text(curGenderCategory.value[i].value);
						closeupDivCategorySelect.append($opt);
					}
				} else {
					var curGenderCategory = self.getCategoriesFromGender("men");
					itemFoundCloseupDivGenderMen.attr('checked', true);
					for (var i = 0; i < curGenderCategory.value.length; i++){
						// var opt = "<option value='" + curGenderCategory.value[i].id + "'>" + curGenderCategory.value[i].value + "</option>";
						var $opt = $('<option/>', {'value': curGenderCategory.value[i].id}).text(curGenderCategory.value[i].value);
						closeupDivCategorySelect.append($opt);
					}
				}
			}else {
				itemFoundCloseupDivgenderCaption.hide();
				itemFoundCloseupDivGenderWomen.hide();
				itemFoundCloseupDivGenderWomenLabel.hide();
				itemFoundCloseupDivGenderMen.hide();
				itemFoundCloseupDivGenderMenLabel.hide();

				for (var j = 0; j < self.options.categories.length; j++) {
					for (var i = 0; i < self.options.categories[1].value.length; i++){
						var opt = "<option value='" + self.options.categories[j].value[i].id + "'>" + self.options.categories[j].value[i].value + "</option>";
						closeupDivCategorySelect.append(opt);
					}
				}
			}

			closeupDivCategorySelect.val(self.getCurrentCategory().id).change();

			var getItems = function(className) {
				var result = [];
				for(var i = 0; i < self.items.length; i++) {
					var curItem = self.items[i];
					if ( curItem.hasClass(className) )
						result.push(curItem);
				}

				return result;
			}

			var getGridItems = function(className) {
				var result = [];
				for(var i = 0; i < self.gridItems.length; i++) {
					var curItem = self.gridItems[i];
					if ( curItem.hasClass(className) )
						result.push(curItem);
				}

				return result;
			}
			itemFoundCloseupDivControlsContainer.append(itemFoundCloseupDivgenderCaption,
														itemFoundCloseupDivGenderWomen,
														itemFoundCloseupDivGenderWomenLabel,
														itemFoundCloseupDivGenderMen,
														itemFoundCloseupDivGenderMenLabel,
														closeupDivCategorySelect);
			itemFoundDiv.append(itemFoundCloseupDivControlsContainer);


			itemFoundDiv.append(slideShow2);

			itemFoundDiv.append(logo);
			resultSection.append(itemFoundDiv);
		/**
		 *	End of closeup view
		 */


		/**
		 *	Start of Grid view
		 */

			var itemFoundGridDiv = $(document.createElement('div')).addClass('item-found-gridview'),//.hide(),
				itemFoundGridContainerUl = $(document.createElement('ul')).addClass('item-found-grid-container'),
				itemFoundGridDivControlsContainer = $(document.createElement('div')).addClass('item-found-gridview-controls'),
				itemFoundGridDivGenderCaption = $(document.createElement('label')).addClass('gender-caption').text('Show'),
				itemFoundGridDivGenderWomen = $(document.createElement('input')).attr({
																					'id' : 'grid-women',
																					'value' : 'women',
																					'class' : 'grid-gender',
																					'name' : 'grid-gender',
																					'type' : 'radio',
																				}),
				itemFoundGridDivGenderWomenLabel = $(document.createElement('label')).attr('for', 'grid-women').text('Women'),
				itemFoundGridDivGenderMen = $(document.createElement('input')).attr({
																					'id' : 'grid-men',
																					'value' : 'men',
																					'class' : 'grid-gender',
																					'name' : 'grid-gender',
																					'type' : 'radio'
																				}),
				itemFoundGridDivGenderMenLabel = $(document.createElement('label')).attr('for', 'grid-men').text('Men'),
				gridDivCategorySelect = $('<select/>', {'id': 'gridViewCategorySelect', 'class':'categorySelect'}),
				gridDivLogo = $(document.createElement('a')).addClass('logo').attr({'href':'http://www.cortexica.com/', 'target':'_blank'});

			if (self.options.genderOptionFlag == "true" || self.options.genderOptionFlag == true) {
				if ( self.getGenderFromCategory(self.getCurrentCategory()) == 'women') {
					var curGenderCategory = self.getCategoriesFromGender("women");
					itemFoundGridDivGenderWomen.attr('checked', true);
					for (var i = 0; i < curGenderCategory.value.length; i++){
						var opt = "<option value='" + curGenderCategory.value[i].id + "'>" + curGenderCategory.value[i].value + "</option>";
						gridDivCategorySelect.append(opt);
					}
				} else {
					itemFoundGridDivGenderMen.attr('checked', true);
					for (var i = 0; i < curGenderCategory.value.length; i++){
						var opt = "<option value='" + curGenderCategory.value[i].id + "'>" + curGenderCategory.value[i].value + "</option>";
						gridDivCategorySelect.append(opt);
					}
				}
			} else {
				itemFoundGridDivGenderCaption.hide();
				itemFoundGridDivGenderWomen.hide();
				itemFoundGridDivGenderWomenLabel.hide();
				itemFoundGridDivGenderMen.hide();
				itemFoundGridDivGenderMenLabel.hide();

				for (var j = 0; j < self.options.categories.length; j++) {
					for (var i = 0; i < self.options.categories[j].value.length; i++){
						var opt = "<option value='" + self.options.categories[j].value[i].id+"'>"+self.options.categories[j].value[i].value+"</option>"
						gridDivCategorySelect.append(opt);
					}
				}
			}

			gridDivCategorySelect.val(self.getCurrentCategory().id).change();

			itemFoundGridDivControlsContainer.append(itemFoundGridDivGenderCaption,
													 itemFoundGridDivGenderWomen,
													 itemFoundGridDivGenderWomenLabel,
													 itemFoundGridDivGenderMen,
													 itemFoundGridDivGenderMenLabel,
													 gridDivCategorySelect);
			itemFoundGridDiv.append(itemFoundGridContainerUl, itemFoundGridDivControlsContainer, gridDivLogo);
			resultSection.append(itemFoundGridDiv);
			

		/**
		 *	End of Grid view
		 */


		//	Handling event of category selector
			closeupDivCategorySelect.change(function() {
				var closeupResult = [];
				var itemClassName = "cortexicaCloseupImageArea" + $('#closeupViewCategorySelect').val();

				self.currentCategory = self.getCategoryFromId($('#closeupViewCategorySelect').val());

				for(var i = 0; i < self.gridItems.length; i++) {
					var curItem = self.items[i];
					curItem.removeClass('active');
					if ( curItem.hasClass(itemClassName) )
						closeupResult.push(curItem);
				}

				if ( closeupResult[0] == null )
					self.openSearch(img);

				$('.bx-wrapper').remove();
				slider = $(document.createElement('ul')).addClass('bxslider');
				slider.append(closeupResult);
				slideShow2.append(slider);

				//	Initializing hover state ...
					if (closeupResult.length > 0){
						$('.hover-state a').attr({'href': closeupResult[0].find('img').attr('href')});
						$('#cycle-1 img').attr('src', closeupResult[0].find('img').attr('src'));
						$('.hover-state label').text(closeupResult[0].find('img').attr('title'));

						var tempItemNameText = closeupResult[0].find('img').attr('name');
						$('.hover-state label')
								.text((tempItemNameText == null)
									? "Empty"
									: (tempItemNameText.length > 30) ? (tempItemNameText.substr(0, 27) + "...") : tempItemNameText)
								.attr({
									'title' : tempItemNameText
								});

						closeupResult[0].addClass('active');
					}
				//-----------------------------

				$('.bxslider li').click(function() {
					event.preventDefault();
					event.stopPropagation();

					$('.cortexicaDialogWindow .results .bx-viewport li.active').removeClass('active');
					$(this).addClass('active');

					$('.hover-state a').attr({
						'href': $(this).find('img').attr('href')
					});

					$('#cycle-1 img').attr('src', $(this).find('img').attr('src'));

					var tempItemNameText = $(this).find('img').attr('name');

					$('.hover-state label')
							.text((tempItemNameText.length > 30) ? (tempItemNameText.substr(0, 27) + "...") : tempItemNameText)
							.attr({
								'title' : tempItemNameText
							});

					
				});

				jQuery(document).ready(function($){
					$('.bxslider').bxSlider({
					  infiniteLoop: false,
					  pagerType: 'short',
					  minSlides: 4,
					  maxSlides: 4,
					  slideWidth: 150,
					  slideMargin: 10,
					  moveSlides: 4,
					  hideControlOnEnd: true,
					  nextText: "",
					  prevText: "",
					  nextSelector: '.results .nxt',
					  prevSelector: '.results .prv'
					});
				});

				if ($('a.bx-prev')[0] != undefined )
					$('a.bx-prev')[0].remove();

				if ($('a.bx-next')[0] != undefined)
					$('a.bx-next')[0].remove();

				gridDivCategorySelect.val(self.getCurrentCategory().id);
			});

  			gridDivCategorySelect.change(function() {
				var gridResult = [];
				var itemClassName = "cortexicaGridImageArea" + $('#gridViewCategorySelect').val();

				//--	Setting current Category in global
				self.currentCategory = self.getCategoryFromId($('#gridViewCategorySelect').val());
				//----

				for(var i = 0; i < self.gridItems.length; i++) {
					var curItem = self.gridItems[i];
					if ( curItem.hasClass(itemClassName) )
						gridResult.push(curItem);
				}

				if ( gridResult[0] == null )
					self.openSearch(img);
				else {
					$('.item-found-grid-container li').remove();
					$('.item-found-grid-container').append(gridResult);
					$('.item-found-grid-container li').hover(
						function() {
							$(this).find('.gridItemOverlay').show();
						},
						function() {
							$(this).find('.gridItemOverlay').hide();
						});
				}

				closeupDivCategorySelect.val(self.getCurrentCategory().id);
			});
		//

		//	Setting visible of div
		if (self.currentViewOption == 'grid' ) {
			gridViewOption.addClass('active');
			closeupViewOption.removeClass('active');
			itemFoundDiv.hide();
			itemFoundGridDiv.show();
		} else {
			gridViewOption.removeClass('active');
			closeupViewOption.addClass('active');
			itemFoundDiv.show();
			itemFoundGridDiv.hide();
		}
		//	

		self.resultContainer = resultSection;
		this.currentIndexOfCategory = 0;

		if ( this.dataURL != null )
		{
			this.items = [];
			this.gridItems = [];
		}

		self.getImages(slider, dataURL, self.getCurrentCategory());
		
		

		dialogDiv.append(self.loadingContainer);
		self.loadingContainer.removeClass('hidden');

		dialogDiv.append(self.resultContainer);
		self.resultContainer.addClass('hidden');
		$('#slideshow-2').css('opacity', '0');




		$(document).ready(function() {
			$('#viewOption-closeup').click(function() {
				self.currentViewOption = 'closeup';
				$('.item-found-gridview').css('display', 'none');
				$('#viewOption-grid').removeClass('active');
				$('.item-found-closeup').css('display', 'block');
				$('#viewOption-closeup').addClass('active');
				self.initCarousel(true);
			});

			$('#viewOption-grid').click(function() {
				self.currentViewOption = 'grid';
				$('.item-found-closeup').css('display', 'none');
				$('#viewOption-closeup').removeClass('active');
				$('.item-found-gridview').css('display', 'block');
				$('#viewOption-grid').addClass('active');
				$('.item-found-grid-container').append(self.gridItems);
				self.initGridList();
			});

			// $('#grid-women').checked = true;

			$('input[name=grid-gender]:radio').change(function(event) {
				if ($(this).val() == 'men'){
					var curGenderCatetory = self.getCategoriesFromGender("men");
					$('#gridViewCategorySelect option').remove();
					for (var i = 0; i < curGenderCatetory.value.length; i++) {
						var opt = "<option value='" + curGenderCatetory.value[i].id + "'>" + curGenderCatetory.value[i].value + "</option>";
						$('#gridViewCategorySelect').append(opt);
					};

					$('input#closeup-men').click();
				}
				else {
					var curGenderCatetory = self.getCategoriesFromGender("women");
					$tmpGridCategoryOption = $('#gridViewCategorySelect option').remove();
					for (var i = 0; i < curGenderCatetory.value.length; i++) {
						var opt = "<option value='" + curGenderCatetory.value[i].id + "'>" + curGenderCatetory.value[i].value + "</option>";
						$('#gridViewCategorySelect').append(opt);
					};

					$('input#closeup-women').click();
				}

				$('#gridViewCategorySelect').change();
				self.initGridList();
			});

			$('input[name=closeup-gender]:radio').change(function(event) {
				if ($(this).val() == 'men'){
					var curGenderCatetory = self.getCategoriesFromGender("men");
					$('#closeupViewCategorySelect option').remove();
					for (var i = 0; i < curGenderCatetory.value.length; i++) {
						var opt= "<option value='" + curGenderCatetory.value[i].id + "'>" + curGenderCatetory.value[i].value+"</option>";
						$('#closeupViewCategorySelect').append(opt);
					};

					$('input#grid-men').click();
				}
				else {
					var curGenderCatetory = self.getCategoriesFromGender("women");
					$('#closeupViewCategorySelect option').remove();
					for (var i = 0; i < curGenderCatetory.value.length; i++) {
						var opt = "<option value='" + curGenderCatetory.value[i].id + "'>" + curGenderCatetory.value[i].value+"</option>"
						$('#closeupViewCategorySelect').append(opt);
					};

					$('input#grid-women').click();
				}
				$('#closeupViewCategorySelect').change();
				self.initCarousel(true);
			});

		});

	},

	getCurrentCategory : function() {
		if( this.currentCategory == null ) {
			if ( this.options.categories[0].value.length > 0 )
				return this.options.categories[0].value[0];
			else if ( this.options.categories[1].value.length > 0 )
				return this.options.categories[1].value[0];
			else
				return null;
		}
		else
			return this.currentCategory;
	},

	getImages : function(container, dataURL, category){	
		var self=this;
	
		var params = new FormData()
		params.append( "ApiKey", this.options.key); // asos live
		params.append( "Longitude", "0.00");
		params.append( "Latitude", "0.84");
		params.append( "DeviceName", "TestDrive");
		params.append( "AppVersion", "CortexicaDemo=1.0.0");
		params.append( "CategoryId", category.id);  
		params.append( "ColourRatio", "0");
		params.append( "TextureRatio", "0");
		params.append( "Image", dataURItoBlob( dataURL));
		$.ajax({
			type: "POST",
			url: self.options.url,
			data: params,
			processData:false,
			contentType: false,
			async : true,
			success: function(response){

				var id = response["id"];
				if ( id == -1 )
				{
					console.log(response.status);
					console.log("Please input the correct category id.");
					// alert(response["status"]);
					// self.resultContainer.addClass('hidden');
					// self.loadingContainer.addClass('hidden');
					// return;
				}
				
				var data=response["fashions"];
				if (self.loadingImg!=null)
					self.loadingImg.remove();

				if ( self.loadingContainer != null )
					self.loadingContainer.remove();

				
				for( var i = 0; i < data.length; i++){

					div = $(document.createElement('div'))
							.addClass('product-item-pic')
							.append($(document.createElement('img'))
										.css({
											'width':'auto', 
											'height':'100%'
										})
										.attr({
												'src': data[i].imageURL,
												'href': data[i].productPageURL,
												'title': data[i].title,
												'description': data[i].description
												})
									);

					var $li = $(document.createElement('li'))
							.addClass("cortexicaCloseupImageArea")
							.addClass("cortexicaCloseupImageArea" + category.id)
								.append(
									$(document.createElement('img')).attr({
										'src': data[i].imageURL,
										'title': data[i].description,
										'name': data[i].title,
										'href': data[i].productPageURL
									})
								);

					var $gridLi = $(document.createElement('li'))
							.addClass("cortexicaGridImageArea cortexicaGridImageArea" + category.id)
							.css({
									'background': "url(" + data[i].imageURL + ")",
									'background-size': 'auto 100%',
									'background-repeat' : 'no-repeat',
									'background-position': 'center'
								})
							.append(
								$(document.createElement('div'))
										.addClass('gridItemOverlay')
										.append(
												$(document.createElement('h6'))
														.addClass('gridItem-title')
														.text((data[i].title != null && data[i].title.length > 20) ? data[i].title.substr(0, 27) + "..." : ""),

												$(document.createElement('a'))
														.addClass('gridItem-link')
														.attr({
																	'href': data[i].productPageURL,
																	'target': '_blank'
																})
														.append(
																$(document.createElement('span'))
																		.addClass('gridItem-link-img')
															)
											)
								);
					$gridLi.hover(
						function(event) {
							event.preventDefault();
							event.stopPropagation();

							$(this).find('.gridItemOverlay').show();
						},
						function(event) {
							event.preventDefault();
							event.stopPropagation();

							$(this).find('.gridItemOverlay').hide();
						}
					);

					
					self.items.push($li);
					self.gridItems.push($gridLi);
				}

				self.currentIndexOfCategory = self.currentIndexOfCategory + 1;
				self.initCarousel(false);
				self.initGridList();
				self.resultContainer.removeClass('hidden');

			},
			error: function(response) {
				console.log(response);
			},
			dataType: "json"
		});
	}
});


var setImage = function(img, c){
	document.getElementById("canvasThumbResult").getContext("2d").drawImage(img, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
};

var getImage = function(){
	return document.getElementById("canvasThumbResult").toDataURL("image/jpeg");
};

var ShowToolTip = function(e, strText) {
	if (strText != "") {
		$("#divToolTip").show();
		var x = e.pageX;
		var y = e.pageY;
		var div = document.getElementById("divToolTip");
		div.innerHTML = strText;
		div.style.left = (x - $('#divToolTip').width() - 6) + "px";
		div.style.top = (y - $('#divToolTip').height() - 6) + "px";
	}
};

var HideToolTip = function() {
		$("#divToolTip").hide();
	};
addStyleInfo([
				"css/myStyle.css",
				"css/dynamicdiv.css",
				"css/imgareaselect-animated.css",
				"css/imgareaselect-default.css",
				"css/imgareaselect-deprecated.css"]
			);
addScript([
				"js/jquery.min.js",
				"js/jquery.klass.js",
				"js/zoomer.js",
				"js/searchbox.js"]);

onReady(start)
function start(){
	$( document ).ready(function() {
		searchbox = new Searchbox({
									images:document.images,
									debug:true,
									minX:200,
									minY:100,

									/**
									 *
									 */
									key: globalOptions.key,
									categories: globalOptions.categories,
									genderOptionFlag: globalOptions.genderOptionFlag,
									url: globalOptions.url});
		});
}
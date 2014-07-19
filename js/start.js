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
									//Torqd
									// "key":"OG46GI345HIJEFBE56970CE8GR3KRLEBHDY4587FR92DBEVN",
									// "categories" : [
									// 	{
									// 		"gender" : "men",
									// 		"value" : [
									// 			{"value" : "Men Outer-Wear", "id" : 10010}
									// 		]
									// 	},
									// 	{
									// 		"gender" : "women",
									// 		"value" : [
									// 			{"value" : "Women Shoes", "id" : 10011}
												
									// 		]
									// 	}
									// ],
									// genderOptionFlag: false,
									// url:"http://apifs.cortexica.com/api/searchsimilar"} );
		});
}
(function(window) {
	'use strict';

	var Option = function() {
		this.categories = JSON.parse(localStorage.getItem("categories")) || globalOptions.categories;
		this.apiKey = localStorage.getItem("apiKey") || globalOptions.key;
		this.genderDropdownFlag = localStorage.getItem("genderOption") || globalOptions.genderOptionFlag;

	}

	Option.prototype = {
		init: function() {
			localStorage.setItem("key", globalOptions.key);
			localStorage.setItem("categories", JSON.stringify(globalOptions.categories));
			localStorage.setItem("genderOption", globalOptions.genderOptionFlag);
			this.initEvents();
			this.renderPage();
		},


		restoreParam: function() {
			this.categories = globalOptions.categories;
			this.apiKey = globalOptions.key;
			this.genderDropdownFlag = globalOptions.genderOptionFlag;

			localStorage.setItem("categories", JSON.stringify(this.categories));
			localStorage.setItem("apiKey", this.apiKey);
			localStorage.setItem("genderOption", this.genderDropdownFlag);

			this.renderPage();
		},

		renderPage: function() {
			var $container = $('table#values'),
				index = 0;
			$('tr.removeable').remove();
			//
			$('#apiKey').val(this.apiKey);
			if (this.genderDropdownFlag == "true")
				$("#genderDropdownFlag").attr("checked", "checked");
			else
				$("#genderDropdownFlag").attr("checked", null);

			for ( var i = 0; i < this.categories.length; i++ ) {
				var curGender = this.categories[i],
					$tr = $('<tr/>', {'class': 'removeable', });
				for ( var j = 0; j < curGender.value.length; j++ ){
					var curItem = curGender.value[j];

					$tr.append(
							$('<td/>', {'class': 'categoryValue'}).text("Category Value: "),
							$('<td/>', {'class': 'value'}).append($('<input/>', {'type': 'text', 'class': 'categoryValue', 'placeholder': 'Category Value', 'value': curItem.value})),
							$('<td/>', {'class': 'categoryID'}).text("Category ID: "),
							$('<td/>', {'class': 'value'}).append($('<input/>', {'type': 'text', 'class': 'categoryValue', 'placeholder': 'Category ID', 'value': curItem.id})),
							$('<td/>', {'class': 'genderDescription'}).text("Select Gender: "),
							$('<td/>', {'class': 'gender'}).append(
									$('<input/>', {'type': 'radio', 'name': 'gender' + index, 'value': 'women', 'id': 'women' + index}).attr('checked', (curGender.gender == "women") ? "checked" : null),
									$('<label/>', {'for': 'women' + index}).text('Women'),
									$('<input/>', {'type': 'radio', 'name': 'gender' + index, 'value': 'men', 'id': 'men' + index}).attr('checked', (curGender.gender == "men") ? "checked" : null),
									$('<label/>', {'for': 'men' + index}).text('Men')
								),
							$('<td/>', {'class': 'action'}).append($('<h6/>', {'class': 'actionRemove'}).text('Remove Category'))
						);
					index++;
					$container.append($tr);
				}
			}
		},

		restore: function(event) {
			event.preventDefault();
			window.option.restoreParam();
		},

		save: function(event) {
			event.preventDefault();
			alert("save");
		},

		initEvents: function() {
			$("input#btnRestore").click(this.restore);
			$("input#btnSave").click(this.save);
		}
	}

	$(function() {
		window.option = new Option();
		window.option.init();
	})
})(window);
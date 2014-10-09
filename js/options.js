(function(window) {
	'use strict';

	var Option = function() {
		this.categories = JSON.parse(localStorage.getItem("categories")) || globalOptions.categories;
		this.apiKey = localStorage.getItem("apiKey") || globalOptions.key;
		this.genderDropdownFlag = localStorage.getItem("genderOption") || globalOptions.genderOptionFlag;
	}

	Option.prototype = {
		init: function() {
			// localStorage.setItem("apiKey", globalOptions.key);
			// localStorage.setItem("categories", JSON.stringify(globalOptions.categories));
			// localStorage.setItem("genderOption", globalOptions.genderOptionFlag);

			this.categories = JSON.parse(localStorage.getItem("categories")) || globalOptions.categories;
			this.apiKey = localStorage.getItem("apiKey") || globalOptions.key;
			this.genderDropdownFlag = localStorage.getItem("genderOption") || globalOptions.genderOptionFlag;
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

		saveParam: function() {
			localStorage.setItem("apiKey", this.apiKey);
			localStorage.setItem("categories", JSON.stringify(this.categories));
			localStorage.setItem("genderOption", this.genderDropdownFlag);
		},

		renderPage: function() {
			var $container = $('table#values'),
				index = 0;
			$('tr.removeable').remove();
			//
			$('#apiKey').val(this.apiKey);
			if (this.genderDropdownFlag == "true" || this.genderDropdownFlag == true)
				$("#genderDropdownFlag").attr("checked", "checked");
			else
				$("#genderDropdownFlag").attr("checked", null);

			for ( var i = 0; i < this.categories.length; i++ ) {
				var curGender = this.categories[i];
				for ( var j = 0; j < curGender.value.length; j++ ){
					
					var curItem = curGender.value[j],
						$tr = $('<tr/>', {'class': 'removeable', }),
						$action = $('<h6/>', {'class': 'actionRemove'}).text('Remove Category');

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
							$('<td/>', {'class': 'action'}).append($action)
						);

					$action.click(function(event){
						event.preventDefault();
						$tr.remove();
					});
					$container.append($tr);
					index++;
				}
			}
		},


		addCategory: function() {
			var curCount = $('tr.removeable').length,
				$container = $('table#values'),
				$tr = $('<tr/>', {'class': 'removeable', }),
				$action = $('<h6/>', {'class': 'actionRemove'}).text('Remove Category');

			$tr.append(
				$('<td/>', {'class': 'categoryValue'}).text("Category Value: "),
				$('<td/>', {'class': 'value'}).append($('<input/>', {'type': 'text', 'class': 'categoryValue', 'placeholder': 'Category Value'})),
				$('<td/>', {'class': 'categoryID'}).text("Category ID: "),
				$('<td/>', {'class': 'value'}).append($('<input/>', {'type': 'text', 'class': 'categoryValue', 'placeholder': 'Category ID'})),
				$('<td/>', {'class': 'genderDescription'}).text("Select Gender: "),
				$('<td/>', {'class': 'gender'}).append(
						$('<input/>', {'type': 'radio', 'name': 'gender' + curCount, 'value': 'women', 'id': 'women' + curCount}).attr('checked', "checked"),
						$('<label/>', {'for': 'women' + curCount}).text('Women'),
						$('<input/>', {'type': 'radio', 'name': 'gender' + curCount, 'value': 'men', 'id': 'men' + curCount}),
						$('<label/>', {'for': 'men' + curCount}).text('Men')
					),
				$('<td/>', {'class': 'action'}).append($action)
			).appendTo($container);

			$action.click(function(event){
				event.preventDefault();
				$tr.remove();
			});
		},

		restore: function(event) {
			event.preventDefault();
			window.option.restoreParam();
		},

		save: function(event) {
			event.preventDefault();
			var $apiKey = $('input#apiKey'),
				$genderDropdownFlag = $('input#genderDropdownFlag'),
				$values = $('tr.removeable'),
				tempCategories = [
					{
						"gender" : "women",
						"value" : []
					},
					{
						"gender" : "men",
						"value" : []
					}
				];

			if ($apiKey.val() == null || $apiKey.val() == "" )
				alert("You should enter api key", function() {
					return;
				})
			else
				window.option.apiKey = $apiKey.val();

			if ($genderDropdownFlag.is(':checked'))
				window.option.genderDropdownFlag = true;
			else
				window.option.genderDropdownFlag = false;

			for (var i = 0; i < $values.length; i++) {
				var curRecord = $values[i].children,
					curGender = curRecord[5],
					tempValue = {"value": "", "id": ""},
					curGenderCategory = null;

				if ($(curGender.children[0]).is(':checked'))
					curGenderCategory = tempCategories[0];
				else
					curGenderCategory = tempCategories[1];

				if ($(curRecord[1].children[0]).val() == "" || $(curRecord[1].children[0]).val() == null)
					alert("Category Value should not be empty.", function() {
						return;
					});
				else
					tempValue.value = $(curRecord[1].children[0]).val();

				if ($(curRecord[3].children[0]).val() == "" || $(curRecord[3].children[0]).val() == null)
					alert("Category Id should not be empty.", function() {
						return;
					});
				else
					tempValue.id = $(curRecord[3].children[0]).val();

				curGenderCategory.value.push(tempValue);
			}
			window.option.categories = tempCategories;
			

			localStorage.setItem("apiKey", window.option.apiKey);
			localStorage.setItem("categories", JSON.stringify(window.option.categories));
			localStorage.setItem("genderOption", window.option.genderDropdownFlag);
		},

		initEvents: function() {
			$("input#btnRestore").click(this.restore);
			$("input#btnSave").click(this.save);
			$("h6#addMoreCategory").click(this.addCategory);
		}
	}

	$(function() {
		window.option = new Option();
		window.option.init();
	})
})(window);
(function(namespace) {
	var categoryListElement = document.querySelector("#category-list");
	var selectView = document.querySelector("#select-view");
	var infoPanel = document.querySelector("#info-panel-title");
	var infoPanelDesc = document.querySelector("#info-panel-desc");

	var categoryList, currentCategory = 0,
	searchResultCategory;

	function categoryNavigationEvent(evt) {
		if (!namespace.hasClass(selectView, "hide")) {
			switch (evt.keyCode) {
			case VK_UP:
				// UP
        categoryList.getCategory(currentCategory).getChannel().emptyChannelContainer();
				currentCategory = (currentCategory > 0) ? (currentCategory - 1) : (categoryList.getCategoriesLength() - 1);
				onCategoryFocus(categoryList.getCategory(currentCategory));
				evt.preventDefault();
				break;
			case VK_DOWN:
				// DOWN
        categoryList.getCategory(currentCategory).getChannel().emptyChannelContainer();
				currentCategory = (currentCategory < categoryList.getCategoriesLength() - 1) ? (currentCategory + 1) : 0;
				onCategoryFocus(categoryList.getCategory(currentCategory));
				evt.preventDefault();
				break;
			}
		}
	}

	function onCategoryFocus(category) {
		var element = category.getContainer();
		// Scroll and focus proper category
		namespace.removeClass(categoryListElement.querySelector(".focused"), "focused");
		namespace.addClass(element, "focused");
		categoryListElement.style.top = -70 - element.offsetTop + "px";

		// Fade categories based on distance
		var categories = categoryListElement.querySelectorAll(".category-element");
		var op = 0.1;
		for (var i = currentCategory - 5; i <= currentCategory; i++) {
			if (i >= 0 && categories[i]) {
				categories[i].style.opacity = op;
			}
			if (i == currentCategory) {
				categories[i].style.opacity = 1;
			}
			op += 0.15;
		}

		// Clear info panel
		infoPanel.innerText = infoPanelDesc.innerText = "";

		var currentChannel = category.getChannel();
		currentChannel.initChannel();

		// Setup positions and opacity to have nice transition between values...
		var pos = - 250;
		for (var j = 0; j < categoryList.getCategoriesLength(); j++) {
			var chan = categoryList.getCategory(j).getChannel();
			if (chan != chan.getCurrentChannel()) {
				chan.getContainer().style.top = pos + "px";
				chan.getContainer().style.opacity = 0;
			} else {
				pos *= - 1;
			}
		}

		namespace.addClass(currentChannel.getContainer(), "animate");
		setTimeout(function() {
			namespace.removeClass(currentChannel.getContainer(), "animate");
		},
		300);
		currentChannel.getContainer().style.top = "0px";
		currentChannel.getContainer().style.opacity = 1;
	}

	namespace.addEvent(document, "keydown", categoryNavigationEvent);

	namespace.CategoryList = function() {
		this._list = [];
		categoryList = this;
	};

	namespace.CategoryList.prototype = {
		/**
     * Just add category to a categoryList, optionally inject inside list
     */
		addCategory: function(category, index) {
			if (typeof index == "undefined") {
				this._list.push(category);
			} else {
				this._list.splice(index, 0, category);
			}
			category.getChannel().setCategoryList(this);
		},

		removeChannel: function(channel) {
			for (var i = 0; i < this._list.length; i++) {
				if (this._list[i].getChannel() == channel) {
					this._list.splice(i, 1);
				}
			}
		},
		addAllCategories: function(categories) {
			categories.forEach(function(category) {
				this.addCategory(category);
			});
		},

		getCategoriesLength: function() {
			return this._list.length;
		},
		getCategory: function(index) {
			return this._list[index];
		},

		render: function() {
			categoryListElement.innerHTML = "";

			for (var i = 0; i < this.getCategoriesLength(); i++) {
				var category = this.getCategory(i);
				category.render();
				categoryListElement.appendChild(category.getContainer());
			}
		},

		focusCategory: function(index) {
			if (typeof index == "number") {
				currentCategory = index;
				onCategoryFocus(this.getCategory(index));
			} else {
				this.focusCategory(this._list.indexOf(index));
			}
		}
	};

	/**
   * Search trough all VideoChannels for given text
   */
	namespace.CategoryList.searchFor = function(searchModel, onSuccessCallback) {
		var searchResultCategory;
		var searchResultChannel;
		var text = searchModel.getText();

		var rgtext = new RegExp(text, "i"); // Ignore case
		var channels = Array.prototype.slice.call(categoryList._list); // Clone
		if (!searchModel.getSearchResults()) {
			for (var i = 0; i < channels.length; i++) {
				var entry = channels[i].getChannel();
				if (entry instanceof namespace.VideoChannel && ! (entry instanceof namespace.SearchResultChannel)) {
					for (var j = 0; j < entry.getChannelLength(); j++) {
						var video = entry.getEntry(j);
						if (rgtext.test(video.getTitle()) || rgtext.test(video.getDesc())) {
							if (!searchResultCategory) {
								searchResultCategory = new namespace.Category(text, new namespace.SearchResultChannel());
								searchModel.setSearchResults(searchResultCategory);
								categoryList.addCategory(searchResultCategory, 3);
								searchResultChannel = searchResultCategory.getChannel();
							}
							searchResultChannel.addEntry(video);
						}
					}
				}
			}

			if (searchResultCategory) {
				categoryList.render();
				categoryList.focusCategory(3);
				if (onSuccessCallback) {
					onSuccessCallback();
				}
			} else {
				namespace.showNotification(namespace.Language.NoResultsFor + text, "notification-no-results");
			}
		} else {
			categoryList.focusCategory(searchModel.getSearchResults());
		}

	};
})(window.VTNS);


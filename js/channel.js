(function(namespace) {

	var channelContainerTemplate = namespace.prepareTemplate("channelContainerTemplate");
	var MAX_SHOW_ON_CHANNEL = namespace.Settings.maxShowOnChannel;
	var MAX_CHANNEL_SIZE = 50;
	var channelPanelElement = document.querySelector('#channel-panel');
	var selectView = document.querySelector("#select-view");
	var currentChannel;

	function scrollToElement(element) {
		currentChannel.getContainer().style.left = - element.offsetLeft + "px";
	}

	function channelNavigation(evt) {
		if (!currentChannel) {
			// Channels are not initialized, wait for data
			return;
		}

		var selectedIndex = currentChannel.getCurrentSelected();
		if (namespace.hasClass(selectView, "hide")) {
			return;
		}
		var all = currentChannel.getContainer().querySelectorAll(".channel-entry");

		switch (evt.keyCode) {
		case VK_LEFT:
      evt.stopPropagation();
      evt.preventDefault();
			if (selectedIndex > 0) {
				namespace.Channel.focusNewElement(all[selectedIndex - 1], all[selectedIndex]);
				currentChannel.setCurrentSelected(selectedIndex - 1);
				selectedIndex -= 1;
				if (currentChannel.onFocus) {
					currentChannel.onFocus(selectedIndex);
				}
			}
			break;
		case VK_RIGHT:
      evt.stopPropagation();
      evt.preventDefault();
			if (selectedIndex < all.length - 1) {
				namespace.Channel.focusNewElement(all[selectedIndex + 1], all[selectedIndex]);
				currentChannel.setCurrentSelected(selectedIndex + 1);
				selectedIndex += 1;
				if (currentChannel.onFocus) {
					currentChannel.onFocus(selectedIndex);
				}

				if (currentChannel && currentChannel.getChannelLength() >= selectedIndex + MAX_SHOW_ON_CHANNEL && all.length < selectedIndex + MAX_SHOW_ON_CHANNEL) {
					currentChannel.renderEntry(currentChannel.getEntry(selectedIndex + MAX_SHOW_ON_CHANNEL - 1), selectedIndex + MAX_SHOW_ON_CHANNEL - 1);
				}

			}
			break;
		case VK_ENTER:
			if (all[selectedIndex]) {
				if (currentChannel.onEnter) {
					currentChannel.onEnter(selectedIndex);
				}
			}
			evt.stopPropagation();
			evt.preventDefault();
			break;
		}
	}

	namespace.addEvent(document, 'keydown', channelNavigation);

	namespace.Channel = function() {};
	namespace.Channel.prototype = {
		_selectedIndex: 0,

		getContainer: function() {
			if (!this._channelContainer) {
				this._channelContainer = channelContainerTemplate.cloneNode(true).querySelector(".channel-container");
				this._channelContainer.style.top = "50px";
				channelPanelElement.appendChild(this._channelContainer);
			}
			return this._channelContainer;
		},

		setChannelName: function(name) {
			this._channelName = name;
		},
		checkMaxChannelSize: function() {
			while (this._channelData && MAX_CHANNEL_SIZE < this._channelData.length) {
				if (!this._splitChannel) {
					// TODO: remove dependencies to subclasses
					if (this instanceof namespace.VideoChannel) {
						this._splitChannel = new namespace.VideoChannel();
						this._splitChannel.setStartIndex(this.getStartIndex() + MAX_CHANNEL_SIZE);
					}
				}
				this._splitChannel.addEntry(this._channelData.splice(MAX_CHANNEL_SIZE, 1)[0]);

			}

			if (this._categoryList && this._splitChannel && ! this._addedSplitChannel) {
				var index = 0;
				for (var i = 0; i < this._categoryList.getCategoriesLength(); i++) {
					if (this._categoryList.getCategory(i).getChannel() == this) {
						index = i;
					}
				}
				this._addedSplitChannel = true;
				this._categoryList.addCategory(new namespace.Category(this._channelName, this._splitChannel), index + 1);
				this._categoryList.render();
			}
		},
		getStartIndex: function() {
			return this._startIndex || 0;
		},
		setStartIndex: function(value) {
			this._startIndex = value;
		},

		getChannelName: function() {
			return this._channelName;
		},
		// The easies way of spliting channels and adding them to a categoryList is by coupling them together,
		// even if not most nice solution, should work for most cases
		setCategoryList: function(categoryList) {
			this._categoryList = categoryList;
			this.checkMaxChannelSize();
		},
		focusElementByIndex: function(index) {
			var entries = this.getContainer().querySelectorAll(".channel-entry");
			index = entries[index] ? index: 0; // if given index not exist anymore in model, focus first element
			namespace.Channel.focusNewElement(entries[index]);
			this.onFocus(index);
		},
		initChannel: function() {
			this.onInitChannel();
			this.render();
			this.focusElementByIndex(this.getCurrentSelected());
		},
		setCurrentSelected: function(value) {
			this._selectedIndex = value;
		},

		getCurrentSelected: function() {
			return this._selectedIndex;
		},

		getCurrentChannel: function() {
			return currentChannel;
		},

		render: function() {
			if (currentChannel) {
				namespace.removeClass(currentChannel.getContainer(), "show");
			}
			currentChannel = this;
			namespace.addClass(currentChannel.getContainer(), "show");

			var container = this.getContainer();
			if (container.childNodes.length > 0 && container.childNodes.length < MAX_SHOW_ON_CHANNEL) {
				this.emptyChannelContainer();
			}
			if (container.childNodes.length === 0) {
				for (var i = 0; i < this.getChannelLength() && i < this._selectedIndex + MAX_SHOW_ON_CHANNEL; i++) {
					this.renderEntry(this.getEntry(i), i);
				}
			}
      scrollToElement(this.getContainer().lastChild);

		},
		emptyChannelContainer: function() {
			this.getContainer().innerHTML = "";
		},

		addEntry: function(model, index) {
			if (!this._channelData) {
				this._channelData = [];
			}
			if (typeof index == "undefined") {
				this._channelData.push(model);
			} else {
				this._channelData.splice(index, 0, model);
			}
			this.checkMaxChannelSize();
		},

		removeEntry: function(model) {
			if (!this._channelData) {
				this._channelData = [];
			}

			if (this._categoryList) {
				var chan = this;
				while (chan._splitChannel) {
					this._channelData = this._channelData.concat(chan._splitChannel._channelData);
					var temp = chan._splitChannel;
					chan._splitChannel = null;
					chan._addedSplitChannel = false;
					this._categoryList.removeChannel(temp);
					chan = temp;
				}
			}

			var index = this._channelData.indexOf(model);
			if (index > - 1) {
				this._channelData.splice(index, 1);
			}
			this.checkMaxChannelSize();
			if (this._categoryList) {
				this._categoryList.render();
			}
		},

		clearChannel: function() {
			this._channelData = [];
		},

		getChannelLength: function() {
			return this._channelData && this._channelData.length || 0;
		},

		getEntry: function(index) {
			return this._channelData && this._channelData[index];
		},

		/**
     * Empty abstract function to override in child
     */
		renderEntry: function(model) {},
		/**
     * Empty abstract function to override in child
     */
		onFocus: function(index) {},
		/**
     * Empty abstract function to override in child
     */
		onEnter: function(index) {},
		/**
     * Empty abstract function to override in child
     */
		onInitChannel: function() {}

	};

	namespace.Channel.focusNewElement = function(newEl, oldEl) {
		if (!newEl) {
			return;
		}
		namespace.addClass(newEl, "focused");
		if (oldEl) {
			namespace.removeClass(oldEl, "focused");
		}
		scrollToElement(newEl);
	};

})(window.VTNS);


(function(namespace) {

	var searchTemplate = namespace.prepareTemplate("searchEntryTemplate");
	var infoPanel = document.querySelector("#info-panel-title");

	namespace.SearchChannel = function() {
		this.addEntry(new namespace.SearchModel(namespace.Language.EnterKeyword, true));
		this.fetchHistory();
	};

	namespace.SearchChannel.prototype = Object.extend(new namespace.Channel(), {
		renderEntry: function(searchModel) {
			var element = searchTemplate.cloneNode(true).querySelector(".search-element");
			element.querySelector(".search-text").innerText = searchModel.getText();
			if (searchModel.getInteractive()) {
        namespace.addClass(element.querySelector(".search-text"), "interactive");
			}

			this.getContainer().appendChild(element);
		},

		onEnter: function(index) {
			var entry = this.getEntry(index);
			if (entry.getInteractive()) {
                if ( namespace.runningInBrowserOrEmulator() ){
                        this.triggerKeyboard();
                } else {
                    this.triggerVirtualKeyboard();
                }
			} else {
				this.triggerSearch(entry);
			}
		},

		onFocus: function(index) {
			var entry = this.getEntry(index);
			if (entry.getInteractive()) {
        infoPanel.innerText = namespace.Language.SearchForVideos;
			} else {
        infoPanel.innerText = namespace.Language.SearchForVideosAbout + " " + entry.getText();
			}
		},

    getExistingModel: function(model){
      var found = model;
      this._channelData.forEach(function(el){
        if (el.getText() == model.getText()){
          found = el;
        }
      });
      return found;
    },
    /*
     * function deals with non-virtual keyboard
     */
    triggerKeyboard: function(){
        var input = document.querySelector("#search-input");
        input.value = "";
        namespace.addClass(input, "show");
        namespace.SearchChannel.isSearching = true;
        input.focus(); 
        var self = this;
        var keydownEvent = function(ev){
            if (ev.keyCode == VK_ENTER){
                //onchange
                ev.preventDefault();
                namespace.removeEvent(document, "keydown",keydownEvent);
                if (input.value) {
					var model = self.getExistingModel(new namespace.SearchModel(input.value));
                        self.triggerSearch(model,function(){
                        self.addEntry(model, 1);
                        self.addHistoryEntry(model);
                        self.emptyChannelContainer();
                    });
                }
                input.value = "";
                input.blur();
				namespace.SearchChannel.isSearching = false;
                document.body.focus();
                namespace.removeClass(input, "show");
            } else if ([VK_UP, VK_DOWN, VK_LEFT, VK_RIGHT, VK_BACK, VK_BACK_SPACE].indexOf(ev.keyCode)>-1) {
                input.value = "";
                input.blur();
				namespace.SearchChannel.isSearching = false;
                document.body.focus();
                namespace.removeClass(input, "show");
            }
        }
        namespace.addEvent(document, "keydown",keydownEvent);
    },
		triggerVirtualKeyboard: function() {

      var input = document.querySelector("#search-input");
      function cancelOtherEvents(evt){
        evt.cancel = true;
        if (input.selectionStart === 0 && [VK_UP, VK_DOWN, VK_LEFT, VK_RIGHT, VK_BACK_SPACE].indexOf(evt.keyCode)>-1) {
          onChange(evt);
        }
        evt.preventDefault();
      }

      function onChange(evt) {
        if (input.value) {
					var model = self.getExistingModel(new namespace.SearchModel(input.value));
					self.triggerSearch(model,function(){
              self.addEntry(model, 1);
              self.addHistoryEntry(model);
              self.emptyChannelContainer();
          });
				}
        input.value = "";
        input.blur();
				namespace.SearchChannel.isSearching = false;
				if (evt) { evt.stopPropagation(); }
        namespace.removeClass(input, "show");
        namespace.removeEvent(input, "change", onChange);
        namespace.removeEvent(document, "keydown",cancelOtherEvents);
        document.body.focus();
			}

      var self = this;
			namespace.addClass(input, "show");
			namespace.SearchChannel.isSearching = true;
      namespace.addEvent(document, "keydown",cancelOtherEvents);
			namespace.addEvent(input, "change", onChange);
      input.focus();
		},

		triggerSearch: function(searchModel, onSuccessCallback) {
			namespace.CategoryList.searchFor(searchModel, onSuccessCallback);
		},

		addHistoryEntry: function(searchModel) {
      var toSet = [];
      for (var len = this.getChannelLength(), i=0; i<len && toSet.length < namespace.LAST_SEARCHES; i++){
        if (!this.getEntry(i).getInteractive()){
          toSet.push(encodeURIComponent(this.getEntry(i).getText()));
        }
      }
      namespace.setCookie("vt_history", toSet.join(","));
		},
    fetchHistory: function(){
      var history = namespace.getCookie("vt_history");
      if (history) {
        this.fetchHistoryCompleted(history.split(","));
      }
    },
		fetchHistoryCompleted: function(data) {
      var self = this;
      data.forEach(function(entry){
        self.addEntry(new namespace.SearchModel(encodeURIComponent(entry)));
      });
      if (this.getCurrentChannel() instanceof namespace.SearchChannel) {
        self.render();
        this.focusElementByIndex(this.getCurrentSelected());
      }
		}
	});

})(window.VTNS);


(function(namespace) {

	var settingsTemplate = namespace.prepareTemplate("settingEntryTemplate");
	var infoPanel = document.querySelector("#info-panel-title");

  var _hideAboutOverlay =  function(evt) {
    if ([VK_BACK_SPACE, VK_BACK].indexOf(evt.keyCode) > -1) {
      // KO-603 fix for BDP return
      history.pushState(null, "", "#prevent-back");
    }
    namespace.removeClass(document.querySelector("#about-page-view"), "show");
    namespace.removeClass(document.querySelector("#overlay"), "show");
    evt.cancel = true;
    evt.preventDefault();
    namespace.removeEvent(document, "keydown", _hideAboutOverlay);
  };

	namespace.SettingsChannel = function() {
		this.fetchData();
	};
	namespace.SettingsChannel.prototype = Object.extend(new namespace.Channel(), {

		renderEntry: function(model) {
			var element = this.createElement();
			if (model instanceof namespace.SettingsModel) {
				element.querySelector(".setting-name").innerText = model.getName() + ":";
				this.updateValue(element, model.getValue());
				model.setElement(element);
			} else {
				this.updateValue(element, model.getText());
			}

			this.getContainer().appendChild(element);
		},
		updateValue: function(element, value) {
      if (typeof value == "boolean") {
        element.querySelector(".setting-value").innerText = value ? namespace.Language.On : namespace.Language.Off;
      } else {
        element.querySelector(".setting-value").innerText = value;
      }
		},
		createElement: function() {
			return settingsTemplate.cloneNode(true).querySelector(".setting-element");
		},
		onEnter: function(index) {
			var model = this.getEntry(index);
			if (model instanceof namespace.SettingsModel) {
				model.setValue(!model.getValue());
				this.updateValue(model.getElement(), model.getValue());
				this.storeData();
			} else {
				this.showAboutOverlay();
			}
		},

		showAboutOverlay: function() {
			namespace.addClass(document.querySelector("#about-page-view"), "show");
			namespace.addClass(document.querySelector("#overlay"), "show");
      namespace.addEvent(document, "keydown", _hideAboutOverlay);
		},

		onFocus: function(index) {
			if (this._channelData && this._channelData[index]) {
				infoPanel.innerHTML = this.getEntry(index).getDesc();
			}
		},

		fetchData: function() {
      this.fetchDataCompleted(namespace.getCookie("vt_settings"));
		},
		fetchDataCompleted: function(data) {
			if (data) {
        data = data.split(",");
				namespace.Settings.shuffle = +data[0] == 1; // convert integer to boolean
				namespace.Settings.autoplay = +data[1] == 1;
			}
			this.addEntry(new namespace.SettingsModel(namespace.Language.Autoplay, "autoplay", namespace.Language.AutoplayDesc));
			this.addEntry(new namespace.SettingsModel(namespace.Language.Shuffle, "shuffle", namespace.Language.ShuffleDesc));
			this.addEntry(new namespace.AboutModel());

			if (this.getCurrentChannel() instanceof namespace.SettingsChannel) {
				this.render();
				this.focusElementByIndex(this.getCurrentSelected());
			}
		},

		storeData: function() {
      namespace.setCookie("vt_settings", (namespace.Settings.shuffle|0) + "," + (namespace.Settings.autoplay|0));
		}

	});

})(window.VTNS);


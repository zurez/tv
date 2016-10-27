(function(namespace) {

	var searchTemplate = namespace.prepareTemplate("searchEntryTemplate");
	var infoPanel = document.querySelector("#info-panel-title");

	namespace.ExitChannel = function() {
    this.addEntry({});
	};

	namespace.ExitChannel.prototype = Object.extend(new namespace.Channel(), {
		renderEntry: function() {
			var element = searchTemplate.cloneNode(true).querySelector(".search-element");
			element.querySelector(".search-text").innerText = namespace.Language.ExitButton;

      this.getContainer().innerHTML = "";
			this.getContainer().appendChild(element);
		},

		onEnter: function() {
       window.close();
		},

		onFocus: function(index) {
        infoPanel.innerText = namespace.Language.ExitText;
		}
	});

})(window.VTNS);


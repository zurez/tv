(function(namespace) {

	namespace.SearchModel = function(text, interactive) {
		this.setText(text);
		this.setInteractive(interactive);
	};

	namespace.SearchModel.prototype = {
		setText: function(value) {
			this._text = value;
		},
		getText: function() {
			return this._text;
		},
		setInteractive: function(value) {
			this._interactive = !! value;
		},
		getInteractive: function() {
			return this._interactive;
		},
		setSearchResults: function(value) {
			this._searchResults = value;
		},
		getSearchResults: function() {
			return this._searchResults;
		}

	};
})(window.VTNS);


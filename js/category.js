(function(namespace) {
	var categoryTemplate = namespace.prepareTemplate("categoryTemplate");

	// Private setter
	function setName(value) {
		this._name = value;
	}
	// Private setter
	function setChannel(value) {
		this._channel = value;
	}

	// Constructor
	namespace.Category = function(name, channel) {
    name = name || namespace.Language.NoCategory;
		setName.call(this, name);
		setChannel.call(this, channel);
    channel.setChannelName(name);
	};

	// Public methods
	namespace.Category.prototype = {
		getName: function() {
			return this._name;
		},

		getChannel: function() {
			return this._channel;
		},

		getContainer: function() {
			if (!this._element) {
				this._element = categoryTemplate.cloneNode(true).querySelector(".category-element");
			}
			return this._element;
		},

		render: function() {
			var element = this.getContainer();
			element.innerText = this.getName();
		}

	};
})(window.VTNS);


(function(namespace) {

	namespace.SettingsModel = function(name, settingKey, desc) {
		this.setName(name);
		this.setKey(settingKey);
    this.setDesc(desc);
    this.setValue(namespace.Settings[settingKey]);
	};

	namespace.SettingsModel.prototype = {
		setName: function(name) {
			this._name = name;
		},
		getName: function() {
			return this._name;
		},
		setKey: function(key) {
			this._key = key;
		},
		getKey: function() {
			return this._key;
		},
		setDesc: function(desc) {
			this._desc= desc;
		},
		getDesc: function() {
			return this._desc;
		},

		setValue: function(value) {
			this._value = value;
			namespace.Settings[this.getKey()] = value;
		},
		getValue: function() {
			return this._value;
		},


		setElement: function(element) {
			this._element = element;
		},
		getElement: function() {
			return this._element;
		}

	};

})(window.VTNS);


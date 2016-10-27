(function(namespace) {
	namespace.AboutModel = function() {};
	namespace.AboutModel.prototype = {
		getText: function() {
			return namespace.Language.AboutText;
		},
		getDesc: function() {
			return namespace.Language.AboutDesc;
		}
	};
})(window.VTNS);


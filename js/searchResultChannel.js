(function(namespace) {

	namespace.SearchResultChannel = function() {
		namespace.VideoChannel.call(this, namespace.Language.SearchResults);
	};
	namespace.SearchResultChannel.prototype = new namespace.VideoChannel();

})(window.VTNS);


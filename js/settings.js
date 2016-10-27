(function(namespace) {
  namespace.Settings = {
    autoplay: false,
    shuffle: false,
    notificationsFade: 3000,
    maxShowOnChannel: 5,
    uid: namespace.getHashParam("uid") || "DEBUG"
  };
})(window.VTNS);


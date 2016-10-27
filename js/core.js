(function(namespace) {

	window.VK_LEFT = window.VK_LEFT || 37;
	window.VK_RIGHT = window.VK_RIGHT || 39;
	window.VK_UP = window.VK_UP || 38;
	window.VK_DOWN = window.VK_DOWN || 40;
	window.VK_ENTER = window.VK_ENTER || 13;
	window.VK_BACK = window.VK_BACK || 46;
	window.VK_BACK_SPACE = window.VK_BACK_SPACE || 46;
	window.VK_EXIT = window.VK_EXIT || 45;

    window.VK_PLAY = window.VK_PLAY || 191;             // / 
    window.VK_PAUSE = window.VK_PAUSE || 190;           // .
    window.VK_STOP = window.VK_STOP || 83;              // s
    window.VK_TRACK_NEXT = window.VK_TRACK_NEXT || 78;  // n
    window.VK_TRACK_PREV = window.VK_TRACK_PREV || 80;  // p
    window.VK_FAST_FWD = window.VK_FAST_FWD || 70;      // f
    window.VK_REWIND = window.VK_REWIND || 82;          // r

	var eventsArray = [];

	/**
 * Extend object with additional object
 * @param destination Object that will be extended
 * @param source Object that will be added to destination
 */

	Object.extend = function(destination, source) {
		for (var property in source) {
			if (source.hasOwnProperty(property)) {
				destination[property] = source[property];
			}
		}
		return destination;
	};

	/** 
 * Function that prepares template to later use.
 * @param template Id of a template inside index.html file to parse
 */
	Object.extend(namespace, {
		prepareTemplate: function(template) {
			var script = document.getElementById(template);
			var documentFragment = document.createDocumentFragment();
			var tempElement = (document.createElement("div"));
			tempElement.innerHTML = script.innerHTML;
			for (var i = tempElement.childNodes.length - 1; i >= 0; i--) {
				documentFragment.appendChild(tempElement.childNodes[i]); // DocumentFragment can't use innerHTML so we copy all nodes
			}
			return documentFragment;
		},

		addClass: function(element, className) {
			if (!namespace.hasClass(element, className)) {
				element.className += " " + className;
			}
		},

		removeClass: function(element, className) {
			if (!element) {
				return;
			}

			element.className = element.className.replace(new RegExp(className, "g"), "").replace(/^ +| +$/g, "").replace(/ +/g, " ");
		},

		hasClass: function(element, className) {
			if (!element.className) {}
			return element && element.className && element.className.match(className);
		},

		fetchData: function(method, url, data, callback, self) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && callback) {
					callback.call(self, xhr.responseText);
				}
			};
			xhr.send(data);
		},

    getCookie: function(key)
    {
      key=key+(namespace.VT_CONFIG.username || "");
      if (document.cookie.indexOf(key)>-1) {
        return document.cookie.match(key+"=([^;]*)")[1];
      } 
    },
    setCookie: function(key,value)
    {
        
      key=key+(namespace.VT_CONFIG.username || "");
      var date = new Date();
      date.setYear(2300);
      document.cookie = key + "=" + value + "; expires=" + date.toGMTString();
    },

		getHashParam: function(param) {
			var value;
			window.location.search.slice(1).split("&").forEach(function(entry) {
				var split = entry.split("=");
				if (split[0] == param) {
					value = split[1];
				}
			});
			return value;
		},

		humanReadableTime: function(seconds) {
			seconds = seconds || 0;
			return (seconds < 600 ? "0" : "") + Math.floor(seconds / 60) + ":" + ("0" + Math.round(seconds % 60)).substr( - 2, 2);
		},

		addEvent: function(element, eventName, functionToCall) {
			if (!eventsArray[element]) {
				eventsArray[element] = {};
			}
			if (!eventsArray[element][eventName]) {
				eventsArray[element][eventName] = [];
				element.addEventListener(eventName, function(e) {
          for (var i = eventsArray[element][eventName].length - 1; i >= 0; i--){
            if (!e.cancel) {
              var entry = eventsArray[element][eventName][i];
              entry.call(null, e);
            }
          }
				},
				true);
			}

			eventsArray[element][eventName].push(functionToCall);
		},
		removeEvent: function(element, eventName, functionToCall) {
			if (eventsArray[element] && eventsArray[element][eventName]) {
				var arr = eventsArray[element][eventName];
				var index = arr.indexOf(functionToCall);
				if (index > - 1) {
					arr.splice(index, 1);
				}
			}
		},
        runningInBrowserOrEmulator: function(){
            var ua = navigator.userAgent;
            if (   ua.indexOf('Model') == -1
                || ua.indexOf('Model/Opera-TvEmulator') != -1
                || ua.indexOf('Model/Opera-Webkit') != -1){
                    return true;
            } else {
                return false;
            }
        }
	});

	/**
   * Notifications
   */
	var notificationTemplate = namespace.prepareTemplate("notificationTemplate");

	namespace.showNotification = function(text, specialClass) {
		var newEl = notificationTemplate.cloneNode(true).querySelector(".notification-entry");
		newEl.innerText = text;
		var container = document.querySelector("#notifications");
		container.appendChild(newEl);

		if (specialClass) {
			namespace.addClass(newEl, specialClass);
		}

		setTimeout(function() {
			container.removeChild(newEl);
		},
		namespace.Settings.notificationsFade);
	};

})(window.VTNS);


(function(namespace) {

  // Fix for broken history stack on CTV
  window.history.pushState({}, document.title, '#fix'); 

	var categoryTemplate = namespace.prepareTemplate("categoryTemplate");
	var categoryListElement = document.querySelector("#category-list");
	var categoryListScrollerElement = document.querySelector("#category-list-scroller");
	var fullView = document.querySelector("#full-screen-view");
	var selectView = document.querySelector("#select-view");
	var videoElement = document.querySelector("#video");
	var info = document.querySelector("#full-screen-info");

  document.querySelector("#info-panel").classList.remove("hide");
  document.querySelector("#info-panel-title").innerText = namespace.Language.Loading;

  namespace.VERSION = "2.3";
  namespace.CORE_BACKEND = "/videotemplate_core";
  namespace.XHRPROXY = "/xhrproxy";
  namespace.LAST_SEARCHES = 10;

	/**
   * Function to initialize application
   */
	function initApplication() {

		categoryList = new namespace.CategoryList();
    document.querySelector("#about-version").innerHTML = namespace.VERSION;
    document.querySelector("#about-title").innerHTML = namespace.VT_CONFIG.title;
    document.querySelector("#about-email").innerHTML = namespace.VT_CONFIG.support_email;

    // By defaul we load Settings, Search and Favorites channel. You can comment them out if you dont like that in your application
		categoryList.addCategory(new namespace.Category(namespace.Language.ExitButton, new namespace.ExitChannel()));
		categoryList.addCategory(new namespace.Category(namespace.Language.Settings, new namespace.SettingsChannel()));
		categoryList.addCategory(new namespace.Category(namespace.Language.Search, new namespace.SearchChannel()));
    if (namespace.VT_CONFIG.favorite) {
      categoryList.addCategory(new namespace.Category(namespace.Language.Favorites, new namespace.FavoriteChannel()));
    }

    // This method make sure that video controls will fade out after 5 sec of inactivity. 
		startFadeInterval();

		getData(function(data) {

			categoryList.render();

      // Find and select first VideoChannel on a categoryList
      var firstIndex = -1, i=0, length = categoryList.getCategoriesLength();
      while (firstIndex<0 && i< length) {
        if (categoryList.getCategory(i).getChannel() instanceof namespace.VideoChannel) {
          firstIndex = i;
        }
        i++;
      }
			categoryList.focusCategory(firstIndex > 0 ? firstIndex : categoryList.getCategoriesLength() - 1);

		}, categoryList);
	}

  /**
   * CHANGEME: Change this method to fetch own data
   */
	function getData(callback, categoryList) {
    var entries = window.location.search.substr(1);
    var url = entries.match(/url=(.*)$/);

    if (url) {
      namespace.fetchData("GET", namespace.XHRPROXY + "/?_proxy_url="+encodeURIComponent(url[1]), null, function(data){
        prepareDataFromUrl(categoryList, JSON.parse(data).message);
        callback();
      });

    } else {
      namespace.fetchData("GET", namespace.VT_CONFIG.data_url, null, function(data){
        namespace.VT_CONFIG.prepareData(categoryList, data);
        callback();
      });
    }
	}

  function getParams(){
    var entries = window.location.search.substr(1).match(/.*(?=&url)/);
    if (entries) {
      entries = entries[0].split("&");
      var structure = {};
      for (var i=0;i<entries.length;i++)
      {
        var entry = entries[i].split("=");
        structure[entry[0]] = entry[1];

      }
      return structure;
    }
  }

  function prepareDataFromUrl(categoryList, data){
    var params = getParams();
    var keys = {
      wrapper: params.wrapper || "asset",
      category: params.category || "category",
      title: params.title || "title",
      description: params.desc || "description",
      thumb: params.thumb || "imageUrl",
      duration: params.duration || "duration"  
    };

    function getContentOrAttr(entry, key){
      if (entry && key){
        key = key.split(",");
        if (key.length == 2) {
          return entry.querySelector(key).getAttribute(key[1]);
        } else {
          return entry.querySelector(key).textContent;
        }
      } 
    }

    function findMp4(node){
      if (!node) { return; }
      var sel;
      if (node.textContent.indexOf(".mp4") > -1){
        sel = node.textContent;
      } else {
        if (node.attributes){
          for (var a = 0; a<node.attributes.length; a++) {
            if (node.attributes[a].value.indexOf(".mp4") > -1){
              sel = node.attributes[a].value;
            }
          }
        }

        if (!sel && node.childNodes){
          for (var i = 0; i < node.childNodes.length; i++){
            sel = sel || findMp4(node.childNodes[i]);
          }
        }
      }

      return sel;
    }

    // Parse received TEXT data as a XML data
		var XMLParser = new DOMParser();
		var xml = XMLParser.parseFromString(data, "text/xml");
	
    // Select all entries from data object  
		var entries = xml.querySelectorAll(keys.wrapper);
		var categories = {};

    // For each element create model, eventually create category if its not existing
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i];
			var category = entry.querySelector(keys.category);
      category = category && category.textContent || "No Category";

			if (!categories[category]) {
				categories[category] = new namespace.Category(category, new namespace.VideoChannel(category));
				categoryList.addCategory(categories[category]);
			}

			var model = new namespace.VideoModel();
			model.setTitle(getContentOrAttr(entry, keys.title));
			model.setDesc(getContentOrAttr(entry, keys.description));
			model.setThumb(getContentOrAttr(entry, keys.thumb));
			model.setVideo(findMp4(entry));
			model.setDuration(getContentOrAttr(entry, keys.duration));

      

			categories[category].getChannel().addEntry(model);
		}


  }

  // --------------------------------------------------------------------------
  //
  // Some internal methods of main application
  //
  // -------------------------------------------------------------------------- 

	window.addEventListener("load", initApplication, true);

	function startFadeInterval() {
		var lastKeyPress = new Date().getTime(),
		lastScreen;
		namespace.addEvent(document, 'keydown', function(evt) {
      if (evt.keyCode == VK_EXIT || ((evt.keyCode == VK_BACK_SPACE || evt.keyCode == VK_BACK) && !namespace.hasClass(selectView,"hide"))) {
        window.close();
      }
      if ([VK_BACK_SPACE, VK_BACK, VK_EXIT].indexOf(evt.keyCode) >-1) {
        // KO-603 fix for BDP return
        history.pushState(null, "", "#prevent-back");
        evt.preventDefault();
      }
			lastKeyPress = new Date().getTime();
			if (lastScreen) {
        if (namespace.hasClass(lastScreen, "hide")) {
          namespace.removeClass(lastScreen, "hide");
          evt.cancel = true;
          evt.preventDefault();
        }
				lastScreen = null;
			}
		},
		false);

		setInterval(function() {
			var currentTime = new Date().getTime();
			if (lastKeyPress + 5000 < currentTime) {
				if (!lastScreen && videoElement.src && ! videoElement.paused && ! namespace.SearchChannel.isSearching && ! namespace.hasClass(info, "show")) {
					lastScreen = fullView;
					namespace.addClass(fullView, "hide");
					namespace.addClass(selectView, "hide");
				}

			}
		},
		1000);
	}
})(window.VTNS);


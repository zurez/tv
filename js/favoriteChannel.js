(function(namespace) {
	var infoPanel = document.querySelector("#info-panel-title");

	var self;
	namespace.FavoriteChannel = function() {
		self = this;
		namespace.FavoriteChannel.Current = this;
		namespace.VideoChannel.call(this, namespace.Language.Favorites);
		this.fetchFavoriteData();
	};

	namespace.FavoriteChannel.prototype = Object.extend(new namespace.VideoChannel(), {
		/**
     * Fetch data from server first time we open fav channel
     */
		onInitChannel: function() {

			// This is dynamic list, empty it every time you enter channel
			this.emptyChannelContainer();
			if (this.getCurrentSelected() >= this.getChannelLength()) {
				this.setCurrentSelected(this.getChannelLength() - 1);
			}

			if (!this._dataReady) {
				infoPanel.innerText = namespace.Language.FetchingFavorites;
			} else {
				this.tryFocusFirstElement();
			}
		},
		tryFocusFirstElement: function() {
			if (this.getChannelLength() > 0) {
				this.focusElementByIndex(this.getCurrentSelected());
			} else {
				infoPanel.innerText = namespace.Language.NoFavoritesYet;
			}
		},
		fetchFavoriteData: function() {
			this._fetchingData = true;
			namespace.fetchData("GET", namespace.CORE_BACKEND + "/api/video/?uid=" + namespace.Settings.uid, null, this.fetchFavoriteDataCompleted, this);
		},
		fetchFavoriteDataCompleted: function(responseData) {
			this._dataReady = true;
			this._fetchingData = false;
			var favData = JSON.parse(responseData);

			favData.forEach(function(entry) {
				self.addEntry(new namespace.VideoModel(entry.title, entry.desc, entry.thumb, entry.url, entry.duration));
			});

			if (this.getCurrentChannel() instanceof namespace.FavoriteChannel) {
				this.render();
				this.tryFocusFirstElement();
			}
		},

		isInFavorites: function(videoModel) {
			for (var i = 0; i < this.getChannelLength(); i++) {
				if (this.getEntry(i).getVideo() === videoModel.getVideo()) {
					return this.getEntry(i);
				}
			}
      if (this._splitChannel) {
        return self.isInFavorites.call(this._splitChannel, videoModel);
      }
			return null;
		},

		storeVideo: function(videoModel, callback) {
			namespace.fetchData("POST", namespace.CORE_BACKEND + "/api/video/", JSON.stringify({
				uid: namespace.Settings.uid,
				title: videoModel.getTitle(),
				thumb: videoModel.getThumb(),
				url: videoModel.getVideo(),
				desc: videoModel.getDesc(),
				duration: videoModel.getDuration()
			}),

			function(entry) {
				entry = JSON.parse(entry);
				if (self) {
					if (entry) {
						self.addEntry(videoModel);
						callback(true);
					} else {
						self.removeEntry(self.isInFavorites(videoModel));
						callback(false);
					}
				}
			});
		}
	});

})(window.VTNS);


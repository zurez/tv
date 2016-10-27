(function(namespace) {
	var channelPanelElement = document.querySelector('#channel-panel');
	var videoTemplate = namespace.prepareTemplate("videoEntryTemplate");
	var infoPanel = document.querySelector("#info-panel-title");
	var infoPanelDesc = document.querySelector("#info-panel-desc");

	namespace.VideoChannel = function(name) {
		var self = this;
		this.setChannelName(name);
	};

	namespace.VideoChannel.prototype = Object.extend(new namespace.Channel(), {

		renderEntry: function(videoModel, index) {
			var container = this.getContainer();
			var element = this.createElement();
			container.appendChild(element);

      var title =	element.querySelector(".video-element-title");
      var titleText = title.innerText = videoModel.getTitle();

      while (title.offsetHeight < title.scrollHeight && titleText.length>0) {
        titleText = titleText.substr(0, titleText.length - 7) + "...";
        title.innerText  = titleText;
      }

			element.querySelector(".video-element-thumb").src = videoModel.getThumb();
			element.querySelector(".video-element-index").innerText = this.getStartIndex() + index + 1;
			element.querySelector(".video-element-duration").innerText = namespace.humanReadableTime(videoModel.getDuration());

		},

		createElement: function() {
			return videoTemplate.cloneNode(true).querySelector(".video-element");
		},

		onEnter: function(index) {
			var view = new namespace.FullScreenView(this);
			view.render(index);
		},
		onFocus: function(index) {
			if (this._channelData && this._channelData[index]) {
				infoPanel.innerText = this._channelData[index].getTitle();
        var value = Math.max(Math.round(this._channelData[index].getDuration()/60), 1);
				infoPanelDesc.innerText =  value + " " + ((value === 1) ? namespace.Language.Minute : namespace.Language.Minutes);	
			}
		}
	});

})(window.VTNS);


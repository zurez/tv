(function(namespace) {
	var fullView = document.querySelector("#full-screen-view");
	var selectView = document.querySelector("#select-view");
	var video = document.querySelector("#video");
	var progressIndicator = document.querySelector("#full-screen-progress-indicator");
	var progressTime = document.querySelector("#full-screen-progress-time");
	var progressFullTime = document.querySelector("#full-screen-progress-full-time");
	var progressPlaybackRate = document.querySelector("#full-screen-progress-current-speed");
	
  var backButton = document.querySelector("#full-screen-button-back");
	var pauseButton = document.querySelector("#full-screen-button-pause");
	var favButton = document.querySelector("#full-screen-button-favorite");

	var title = document.querySelector("#full-screen-title");
	var info = document.querySelector("#full-screen-info");
  var infoDesc = info.querySelector("#full-screen-info-description");
	var categoryDesc = document.querySelector("#full-screen-category");
	var categoryName = document.querySelector("#full-screen-category-name");
	var categoryIndex = document.querySelector("#full-screen-category-index");
	var currentChannel, currentIndex, currentModel, playlistIndexes = [];

	function hideFullScreenView() {
		namespace.removeClass(selectView, "hide");
		namespace.addClass(fullView, "hide");
	}

	function playPauseEvent() {
		if (video.paused) {
      namespace.removeClass(pauseButton, "play");
			video.play();
		} else {
      namespace.addClass(pauseButton, "play");
			video.pause();
		}
	}

	function muteUnmuteEvent() {
		video.volume = video.volume > 0.5 ? 0: 1;
		video.muted = ! video.muted;
	}

	function updateProgressEvent() {
		progressIndicator.style.left = progressPlaybackRate.style.left = Math.min((video.currentTime / video.duration) * 100, 100) + "%";

		progressTime.innerText = namespace.humanReadableTime(video.currentTime);
		progressFullTime.innerText = namespace.humanReadableTime(video.duration);

    if (video.ended) {
      namespace.addClass(pauseButton, "play");
      if (namespace.Settings.autoplay) {
        nextVideoEvent();
      } else {
        if (namespace.hasClass(selectView, "hide")) {
          namespace.removeClass(fullView, "hide");
        }
      }
    }
	}

  function goForward(){
    video.currentTime = Math.min( video.duration, video.currentTime + (video.duration/20));
  }
  function goBackward(){
    video.currentTime = Math.max( 0, video.currentTime - (video.duration/20));
  }
  function setNormalTime(){
    video.playbackRate = 1; 
    updateCurrentPlaybackRate();
  }

  function updateCurrentPlaybackRate(){
    progressPlaybackRate.innerText = (video.playbackRate != 1) ? video.playbackRate + ">>" : "";
  }

	function showFullScreenView() {
		namespace.addClass(selectView, "hide");
		namespace.removeClass(fullView, "hide");
	}

	function fullScreenNavigation(evt) {
		if (namespace.hasClass(info, "show")) {
			switch (evt.keyCode) {
			case VK_UP:
        infoDesc.scrollTop -= 50;
				break;
			case VK_DOWN:
        infoDesc.scrollTop += 50;
				break;
			default:
				namespace.removeClass(info, "show");
				break;
			}
		  evt.stopPropagation();
      evt.preventDefault();
			evt.cancel = true;

		} else {
			if (!namespace.hasClass(selectView, "hide")) {
				return;
			}
			if (!namespace.hasClass(fullView, "hide")) {
				switch (evt.keyCode) {
				case VK_UP:
				case VK_DOWN:
          if (namespace.hasClass(progressIndicator, "focused")) {
            focusHandle(pauseButton);
            setNormalTime();
          } else {
            focusHandle(progressIndicator);
          }
          evt.preventDefault();
					break;
				case VK_LEFT:
          if (!namespace.hasClass(progressIndicator, "focused")){
            var toFocus = fullView.querySelector(".focused").previousSibling;
            while (toFocus && toFocus.nodeType != 1) {
              toFocus = toFocus.previousSibling;
            }
            focusHandle(toFocus || fullView.querySelector("#full-screen-button-next"));
          } else {
            goBackward();
          }
          evt.preventDefault();
					break;
				case VK_RIGHT:
          if (!namespace.hasClass(progressIndicator, "focused")){
            focusHandle(fullView.querySelector(".focused+div") || backButton);
          } else {
            goForward();
          }
          evt.preventDefault();
					break;
        case VK_ENTER:
          enterHandle();
					evt.preventDefault();
					evt.cancel = true;
          break;
				case VK_BACK:
				case VK_BACK_SPACE:
          // KO-603 fix for BDP return
          history.pushState(null, "", "#prevent-back");
					evt.preventDefault();
					evt.cancel = true;
          backEvent();

					break;
				}
			}
		}
	}

	function focusHandle(element) {
    if (!element) {
      return;
    }
		namespace.removeClass(fullView.querySelector(".focused"), "focused");
		namespace.addClass(element, "focused");
	}

	function enterHandle() {
    var el = fullView.querySelector(".focused");
    if (el.onEnter){
      el.onEnter();
    }
	}

	function prevVideoEvent() {
		if (currentIndex > 0) {
			renderVideo(currentIndex - 1);
		} else {
      renderVideo(playlistIndexes.length - 1);
    }
	}

	function nextVideoEvent() {
		if (currentIndex < playlistIndexes.length - 1) {
			renderVideo(currentIndex + 1);
		} else {
      renderVideo(0);
    }
	}

  function backEvent(){
    video.pause();
    hideFullScreenView();
  }


	function showInfoEvent() {
		namespace.addClass(info, "show");
	}

	function addRemoveFavoriteEvent() {
		namespace.FavoriteChannel.Current.storeVideo(currentModel, handleAddRemoveResponse);
	}

	function showHideChannelNavigation(toShow) {
		var hide = fullView.querySelectorAll("#full-screen-button-prev, #full-screen-button-current, #full-screen-button-next");
		for (var i in hide) {
			if (hide.hasOwnProperty(i) && hide[i].style) {
				hide[i].style.display = toShow ? "block": "none";
			}
		}

	}

	function handleAddRemoveResponse(added) {
		if (added) {
      namespace.removeClass(favButton, "add");
			namespace.showNotification(namespace.Language.FavoriteAdded);
		} else {
      namespace.addClass(favButton, "add");
			namespace.showNotification(namespace.Language.FavoriteRemoved);
		}
		if (currentChannel instanceof namespace.FavoriteChannel) {
			showHideChannelNavigation(false);
			currentChannel.initChannel();
			calculateIndexes(0);
		}
	}

  /**
   * Calculates order of videos in category for currently viewed full screen view
   */
	function calculateIndexes(realIndex) {
		for (var i = 0; i < currentChannel.getChannelLength(); i++) {
			playlistIndexes[i] = i;
		}
		if (namespace.Settings.shuffle) {
			playlistIndexes.sort(function() {
				return Math.round(Math.random()) === 0;
			});
			// Make sure that real index is first on list
			playlistIndexes.unshift(playlistIndexes.splice(playlistIndexes.indexOf(realIndex), 1)[0]);
		}

		currentIndex = playlistIndexes.indexOf(realIndex);
		return currentIndex;
	}

	function attachEvents() {
		namespace.addEvent(document, "keydown", fullScreenNavigation, true);
		document.querySelector("#full-screen-button-back").onEnter = backEvent;
		document.querySelector("#full-screen-button-pause").onEnter = playPauseEvent;
		// document.querySelector("#full-screen-button-mute").onEnter = muteUnmuteEvent;
		document.querySelector("#full-screen-button-favorite").onEnter = addRemoveFavoriteEvent;
		document.querySelector("#full-screen-button-prev").onEnter = prevVideoEvent;
		document.querySelector("#full-screen-button-next").onEnter = nextVideoEvent;
		document.querySelector("#full-screen-button-current").onEnter = hideFullScreenView;
		document.querySelector("#full-screen-button-show-info").onEnter = showInfoEvent;

		setInterval(updateProgressEvent, 100);

	}

	function renderVideo(index) {
		currentIndex = index;

		var videoEntry = currentChannel.getEntry(playlistIndexes[index]);
		if (videoEntry) {

			video.src = videoEntry.getVideo();
      video.setAttribute("type", videoEntry.getVideoType() || "");
      video.style.width = window.innerWidth + "px";
      video.style.height = window.innerHeight + "px";

			video.play();
      namespace.removeClass(pauseButton, "play");
			updateProgressEvent();
			title.innerText = videoEntry.getTitle();
			currentModel = videoEntry;

			info.querySelector("#full-screen-info-title").innerText = videoEntry.getTitle();
			info.querySelector("#full-screen-info-details").innerText = "";
			info.querySelector("#full-screen-info-description").innerText = videoEntry.getDesc();

			showHideChannelNavigation(true);

			categoryDesc.innerText = namespace.Language.Videos;
      categoryName.innerText = currentChannel.getChannelName();
			categoryIndex.innerText = playlistIndexes[currentIndex] + 1 + " / " + currentChannel.getChannelLength();

      if (namespace.VT_CONFIG.favorite) {
        if (!namespace.FavoriteChannel.Current.isInFavorites(videoEntry)) {
          namespace.addClass(favButton, "add");
        } else {
          namespace.removeClass(favButton, "add");
        }
      } else {
        if (favButton.parentNode) {
          favButton.parentNode.removeChild(favButton);
        }
      }

		}
	}

	attachEvents();

	namespace.FullScreenView = function(channel) {
		this._channel = channel;
	};

	namespace.FullScreenView.prototype = {
		render: function(realIndex) {
			currentChannel = this._channel;
			showFullScreenView();
			renderVideo(calculateIndexes(realIndex));

			focusHandle(pauseButton);
		}
	};

})(window.VTNS);


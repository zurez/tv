(function(namespace) {

	namespace.VideoModel = function(title, desc, thumb, video, duration, type) {
		this.setTitle(title);
		this.setDesc(desc);
		this.setThumb(thumb);
		this.setVideo(video, type);
    this.setDuration(duration);
	};

	namespace.VideoModel.prototype = {
		setTitle: function(title) {
			this._title = title;
		},
		getTitle: function() {
			return this._title;
		},

		setDesc: function(desc) {
			this._desc = desc;
		},
		getDesc: function() {
			return this._desc;
		},

		setThumb: function(thumb) {
			this._thumb = thumb;
		},
		getThumb: function() {
			return this._thumb;
		},

		setVideo: function(video, type) {
			this._video = video;
      this._videoType = type;
		},
		getVideo: function() {
			return this._video;
		},
		getVideoType: function() {
			return this._videoType;
    },
		setDuration: function(duration) {
			if (!isNaN(+duration)) {
        this._duration = duration;
      }
      else if (typeof(duration) === "string") {
          var hours = parseInt(duration.substr(0, 2),10),
          minutes = parseInt(duration.substr(3, 2),10),
          seconds = parseInt(duration.substr(6, 2),10);
          this._duration = hours * 3600 + minutes * 60 + seconds;
        }
		},
		getDuration: function() {
			return this._duration;
		}

	};

})(window.VTNS);


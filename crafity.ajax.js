(function (crafity, $) {
	"use strict";

	var ajaxCallCount = 0;

	crafity.ajax = function (url, success, error) {
		// Normalize parameters
		if (typeof url === 'object' && !success && !error) {
			success = url.success;
			error = url.error;
			url = url.url;
		}

		function startLoading() {
			ajaxCallCount++;
			$("html").addClass("loading");
		}

		function stopLoading() {
			ajaxCallCount--;
			if (ajaxCallCount === 0) {
				$("html").removeClass("loading");
			}
		}

		startLoading();
		$.ajax({
			url: url,
			success: function (data) {
				stopLoading();
				success(data);
			},
			error: function (err) {
				stopLoading();
				error(err);
			}
		});
	};

}(window.crafity = window.crafity || {}, jQuery));

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
			ajaxCallCount += 1;
			$("html").addClass("loading");
		}

		function stopLoading() {
			ajaxCallCount -= 1;
			if (ajaxCallCount === 0) {
				$("html").removeClass("loading");
			}
		}

		startLoading();
		$.ajax({
			url: url,
			type: "GET",
			contentType : "text/html",
			success: function (data) {
				stopLoading();
				success.apply(this, arguments);
			},
			error: function (err) {
				stopLoading();
				error.apply(this, arguments);
			}
		});
	};

}(window.crafity = window.crafity || {}, jQuery));

(function (crafity, $) {
	"use strict";

	var ajaxCallCount = 0;

	crafity.ajax = function (url, success, error) {
		// Normalize parameters
		var type = "GET", data;
		if (typeof url === 'object' && !success && !error) {
			success = url.success;
			error = url.error;
			type = url.type || type;
			data = url.data || data;
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
			type: type,
			data: data,
			contentType : !data ? "text/html" : undefined,
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

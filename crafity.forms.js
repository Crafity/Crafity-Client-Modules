/* globals window */

(function (crafity, $, window) {

	"use strict";

	crafity.ready(function () {

		return;
		
		// subscribe on the submit event of all forms in this DOM
		$(window.document.body).delegate("form", "submit", function () {
			var form$ = $(this)
				, formData = form$.serialize()
				, bookmark = form$.hasClass("bookmark")
				, submitButton$ = $("input[type=submit]", form$)
				, target, target$
				, href = form$.attr("action");

			$("input, textarea", form$).attr("disabled", "disabled");
			submitButton$.val(submitButton$.attr("data-busy-value") || submitButton$.val()).addClass("busy");

			if (form$.attr("data-async") === "content") {
				target = form$.attr("data-async-target");
				target$ = form$.nearest(target);
			}
			
			if (!target$ || !target$.length) {
				throw new Error("Unable to find target element for form result"); 
			}
			
			$("html").addClass("loading");

			$.ajax({
				type: 'POST',
				url: href + (href.indexOf("?") > -1 ? "&" : "?") + ("layout=false"),
				data: formData,
				success: function (data, textStatus, xhr) {
					if (form$.hasClass("async")) {
						try {
							var url = xhr.getResponseHeader("x-crafity-location").split("?")[0]
								, data$ = $("<div/>").append(data)
								, showContent;
							console.log("data$", data$);
							console.log("SUCCESS arguments", arguments);
							console.log("--> url", url);
							target$.attr("data-href", url);
							if (bookmark) {
								crafity.navigation.hashInfo.update("");
								crafity.navigation.hashInfo.change({ href: url });
							}

							target$.removeClass('loading').addClass('loaded');
							target$.find(".columns").addClass("open");
							data$.find(".columns").addClass("open");

							showContent = function showContent(data$, url) {
								data$ = target$.empty().append(data$.children()[0]);
								target$.attr("data-href", url);
								$("html").removeClass("not-ready").addClass("ready");
								setTimeout(function () {
									data$.find(".columns").removeClass("open");
								}, 1);
							};

							if ($("html").hasClass("ready")) {
								setTimeout(function () {
									showContent(data$, url);
								}, 500);
							} else {
								showContent(data$, url);
							}
						} catch (err) {
							console.log("ERROR arguments", err);
							crafity.flash.show({ message: err.message, type: "error" });
						}
						return;
					}

					form$
						.closest(".body")
						.empty()
						.append(data);

					form$.closest("section").removeClass("visible").addClass("visible");

					$("html").removeClass("loading");
					console.log("postResult", data);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log("jqXHR, textStatus, errorThrown", jqXHR, jqXHR.error(), textStatus, errorThrown);
					crafity.flash.show({ message: jqXHR.responseText, type: jqXHR.status !== 400 ? "error" : "warning" });
				}
			});
			return false;
		});

	});

}(window.crafity = window.crafity || {}, window.jQuery, window));

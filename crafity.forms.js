$(document).ready(function () {

	$(document.body).delegate("form", "submit", function () {
		var form$ = $(this)
			, formData = form$.serialize()
			, bookmark = form$.hasClass("bookmark");
		$("input, textarea", form$).attr("disabled", "disabled");
		$("input[type=submit]", form$).val("Sending...");

		$("html").addClass("loading");
		$.ajax({
			type: 'POST',
			url: form$.attr("action") + "?layout=false",
			data: formData,
			success: function (data, textStatus, xhr) {
				if (form$.hasClass("async")) {
					try {
						var url = xhr.getResponseHeader("x-crafity-location").split("?")[0]
							, content$ = $("#content")
							, data$ = $("<div/>").append(data);

						console.log("SUCCESS arguments", arguments);
						console.log("--> url", url);
						content$.attr("data-href", url);
						if (bookmark) {
							crafity.navigation.hashInfo.update("");
							crafity.navigation.hashInfo.change({ href: url });
						}

						content$.removeClass('loading').addClass('loaded');
						content$.find(".columns").addClass("open");
						data$.find(".columns").addClass("open");

						var showContent = function showContent(data$, url) {
							data$ = content$.empty().append(data$.children()[0]);
							content$.attr("data-href", url);
							$("html").removeClass("not-ready").addClass("ready");
							setTimeout(function () {
								data$.find(".columns").removeClass("open");
							}, 1);
						}

						if ($("html").hasClass("ready")) {
							setTimeout(function () {
								showContent(data$, url);
							}, 500);
						} else {
							showContent(data$, url);
						}
					} catch (err) {
						console.log("ERROR arguments", err);
						konnektid.flash.show({ message: err.message, type: "error" });
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
				konnektid.flash.show({ message: jqXHR.responseText, type: jqXHR.status !== 400 ? "error" : "warning" });
			}
		});
		return false;
	});

});

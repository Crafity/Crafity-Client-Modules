$(document).ready(function () {

	$(document.body).delegate("form", "submit", function () {
		var form$ = $(this);
		var formData = form$.serialize();
		$("input, textarea", form$).attr("disabled", "disabled");
		$("input[type=submit]", form$).val("Sending...");

		$("html").addClass("loading");
		$.ajax({
			type: 'POST',
			url: form$.attr("action") + "?layout=false",
			data: formData,
			success: function(postResult) {
				form$
					.closest(".body")
					.empty()
					.append(postResult);

				form$.closest("section").removeClass("visible").addClass("visible");

				$("html").removeClass("loading");
				console.log("postResult", postResult);
			}
		});
		return false;
	});

});

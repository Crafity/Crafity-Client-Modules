(function (crafity, $) {
	var responsive = crafity.responsive = crafity.responsive || {}
		, html$ = $("html")
		, stylesheets = $("link[href][media]")
		, desktop = stylesheets.filter("[href*=desktop]")
		, tabletLandscape = stylesheets.filter("[href*='tablet.landscape']")
		, tabletPortrait = stylesheets.filter("[href*='tablet.portrait']")
		, mobileLandscape = stylesheets.filter("[href*='mobile.landscape']");

	if (window.isEmulator) {
		html$.addClass("emulator");
		return;
	} else {
		html$.addClass("no-emulator");
	}
	window.stylesheets = stylesheets;

	var devices$ = $("<div class='crafity devices'><ul class='device list'></ul></div>")
		, deviceList$ = devices$.find('.device.list');

	deviceList$.append($("<li class='mobile portrait'>Mobile (P)</li>").click(function () {
		if (window.isEmulator) { return; }
		crafity.responsive.emulate('mobile', 'portrait');
	}));
	deviceList$.append($("<li class='mobile landscape'>Mobile (L)</li>").click(function () {
		if (window.isEmulator) { return; }
		crafity.responsive.emulate('mobile', 'landscape');
	}));
	deviceList$.append($("<li class='tablet portrait'>Tablet (P)</li>").click(function () {
		if (window.isEmulator) { return; }
		crafity.responsive.emulate('tablet', 'portrait');
	}));
	deviceList$.append($("<li class='tablet landscape'>Tablet (L)</li>").click(function () {
		if (window.isEmulator) { return; }
		crafity.responsive.emulate('tablet', 'landscape');
	}));
	deviceList$.append($("<li class='desktop'>Desktop</li>").click(function () {
		if (window.isEmulator) { return; }
		crafity.responsive.emulate('desktop');
	}));
	deviceList$.append($("<li class='auto'>Auto</li>").click(function () {
		if (window.isEmulator) { return; }
		crafity.responsive.emulate('auto');
	}));

	html$.
		removeClass("mobile tablet portrait landscape desktop auto")
		.addClass('auto');
	$(window.document.body).append(devices$);

	var emulationOverlay$;

	responsive.emulate = function (device, orientation) {
		html$.
			removeClass("mobile tablet portrait landscape desktop auto");

		var width, height;

		if (device === "mobile" && orientation === "landscape") {
			width = 480;
			height = 268;
			html$.addClass("mobile landscape");
//			crafity.navigation.hashInfo.change({ "emulate": "mobile.landscape" });

		} else if (device === "mobile") {
			width = 320;
			height = 416;
			html$.addClass("mobile portrait");
//			crafity.navigation.hashInfo.change({ "emulate": "mobile.portrait" });

		} else if (device === "tablet" && orientation === "portrait") {
			width = 768;
			height = 928;
			html$.addClass("tablet portrait");
//			crafity.navigation.hashInfo.change({ "emulate": "tablet.portrait" });

		} else if (device === "tablet") {
			width = 1024;
			height = 672;
			html$.addClass("tablet landscape");
//			crafity.navigation.hashInfo.change({ "emulate": "tablet.landscape" });

		} else if (device === "desktop" || device === "auto") {
			if (emulationOverlay$) {
//				crafity.navigation.hashInfo.change({ "emulate": undefined });
				html$.addClass("auto");
				emulationOverlay$.remove();
				emulationOverlay$ = undefined;
				$(document.body).css('overflow', 'initial');
			}
			return;
		}

		if (emulationOverlay$) {
			emulationOverlay$.find("iframe").css({ width: width, height: height });
		} else {
			emulationOverlay$ =
				$("<div style='left: 0; top: 0; right: 0; bottom: 0; position: fixed;z-index: 1000;background: rgba(30, 30, 30, .8)'>" +
					"<iframe src='" + window.location.href + "' style='display: block; height: " + height + "px; width: " + width + "px; margin: 50px auto;-webkit-box-shadow: 0 0 40px 10px rgba(30, 30, 30, .5);-moz-box-shadow: 0 0 40px 10px rgba(30, 30, 30, .5)' /></div>");
			emulationOverlay$.click(function () {
				responsive.emulate("auto");
			});
			$(document.body).css('overflow', 'hidden');
			$(document.body).append(emulationOverlay$);
			emulationOverlay$.find("iframe").get(0).contentWindow.isEmulator = true;

//			console.log(emulationOverlay$.find("iframe").get(0).contentDocument);
//			console.log($("html", emulationOverlay$.find("iframe").get(0).contentDocument));
//			$("html", emulationOverlay$.find("iframe").get(0).contentDocument).addClass("emulator");
		}

		return;
		html$
			.removeClass("mobile tablet portrait landscape desktop auto")
			.addClass("emulating");

		if (device === "mobile" && orientation === "landscape") {
			mobileLandscape.attr('href', mobileLandscape.attr('data-href') || mobileLandscape.attr('href'));

			tabletPortrait.attr('data-href', tabletPortrait.attr('href') || tabletPortrait.attr('data-href'));
			tabletPortrait.attr('href', null);

			tabletLandscape.attr('data-href', tabletLandscape.attr('href') || tabletLandscape.attr('data-href'));
			tabletLandscape.attr('href', null);

			desktop.attr('data-href', desktop.attr('href') || desktop.attr('data-href'));
			desktop.attr('href', null);

			html$.addClass("mobile landscape");
			crafity.navigation.hashInfo.change({ "emulate": "mobile.landscape" });
			//window.location.hash = "emulate=mobile.landscape";

		} else if (device === "mobile") {
			mobileLandscape.attr('data-href', mobileLandscape.attr('href') || mobileLandscape.attr('data-href'));
			mobileLandscape.attr('href', null);

			tabletPortrait.attr('data-href', tabletPortrait.attr('href') || tabletPortrait.attr('data-href'));
			tabletPortrait.attr('href', null);

			tabletLandscape.attr('data-href', tabletLandscape.attr('href') || tabletLandscape.attr('data-href'));
			tabletLandscape.attr('href', null);

			desktop.attr('data-href', desktop.attr('href') || desktop.attr('data-href'));
			desktop.attr('href', null);

			html$.addClass("mobile portrait");
			window.location.hash = "emulate=mobile.portrait";

		} else if (device === "tablet" && orientation === "portrait") {
			mobileLandscape.attr('href', mobileLandscape.attr('data-href') || mobileLandscape.attr('href'));
			tabletPortrait.attr('href', tabletPortrait.attr('data-href') || tabletPortrait.attr('href'));

			tabletLandscape.attr('data-href', tabletLandscape.attr('href') || tabletLandscape.attr('data-href'));
			tabletLandscape.attr('href', null);

			desktop.attr('data-href', desktop.attr('href') || desktop.attr('data-href'));
			desktop.attr('href', null);

			html$.addClass("tablet portrait");
			window.location.hash = "emulate=tablet.portrait";

		} else if (device === "tablet") {
			mobileLandscape.attr('href', mobileLandscape.attr('data-href') || mobileLandscape.attr('href'));
			tabletPortrait.attr('href', tabletPortrait.attr('data-href') || tabletPortrait.attr('href'));
			tabletLandscape.attr('href', tabletLandscape.attr('data-href') || tabletLandscape.attr('href'));
			desktop.attr('data-href', desktop.attr('href') || desktop.attr('data-href'));
			desktop.attr('href', null);

			html$.addClass("tablet landscape");
			window.location.hash = "emulate=tablet.landscape";

		} else if (device === "desktop" || device === "auto") {
			mobileLandscape.attr('href', mobileLandscape.attr('data-href') || mobileLandscape.attr('href'));
			tabletPortrait.attr('href', tabletPortrait.attr('data-href') || tabletPortrait.attr('href'));
			tabletLandscape.attr('href', tabletLandscape.attr('data-href') || tabletLandscape.attr('href'));
			desktop.attr('href', desktop.attr('data-href') || desktop.attr('href'));

			html$
				.addClass("" + device)
				.removeClass("emulating");

			window.location.hash = "";
		}
	};
	//alert(window.innerWidth + " " + window.innerHeight);

	if (window.location.hash.indexOf("#emulate=") > -1) {
		var parts = window.location.hash.replace("#emulate=", "").split(".");
		responsive.emulate.apply(this, parts);
	}

}(window.crafity = window.crafity || {}, window.jQuery));

/*globals window */

(function (crafity, $, window) {
	"use strict";

	var body$ = $("body");

	crafity.ui = {};

	$.fn.nearest = function (query) {
		var startElement$ = $(this)
			, result$ = startElement$.find(query);

		if (!result$.length) { result$ = startElement$.closest(query); }
		if (!result$.length) { result$ = $(query, startElement$); }
		return result$;
	};
	$.fn.findAndSelf = function (selector) {
		return this.find(selector).add(this.filter(selector));
	};

	crafity.ready(function () {

		(function initFlash(flash) {
			var closingId, openingId;

			body$.delegate("#flash", "click", function () {
				flash.close();
				return false;
			});

			flash.close = function (callback) {
				var flash$ = $("#flash")
					, messages$ = $(".messages", flash$);
				if (!flash$.hasClass("open")) {
					if (callback) { callback(); }
					return;
				}
				var height = messages$.height();

				flash$.css("margin-top", -height + "px");
				clearTimeout(closingId);
				closingId = setTimeout(function () {
					flash$.removeClass("open")
						.addClass("closed");
					messages$.empty();
					if (callback) { callback(); }
				}, 1000);
			};

			flash.show = function (messages) {
				var flash$ = $("#flash")
					, messages$ = $(".messages", flash$);

				if (flash$.hasClass("open")) {
					return flash.close(function () {
						flash.show(messages);
					});
				}
				messages = messages ? [].concat(messages) : [];
				if (messages.length) {
					messages$.empty();
					messages.forEach(function (message) {
						if (typeof message === 'string') {
							messages$.append($("<ul/>").addClass("message info").text(message));
						} else {
							messages$.append($("<ul/>").addClass("message " + message.type).text(message.message));
						}
					});
				}
				if (!messages$.children(null).length) {
					return;
				}

				var height = messages$.height();
//				console.log("messages$.children()", messages$.children());
				flash$
					.css("margin-top", -height + "px")
					.height(height);

				if (navigator.userAgent.match(/(iPad|iPhone){1}.*([^_][0-4]_[0-9]){1}/i) !== null) {
					window.scrollTo(0, 1);
				}

				clearTimeout(openingId);
				openingId = setTimeout(function () {
					flash$
						.css("margin-top", "0px")
						.addClass("open")
						.removeClass("closed");

					clearTimeout(closingId);
					closingId = setTimeout(function () {
						flash.close();
					}, 5000);
				}, 1);
			};

			flash.show();

		}(crafity.ui.flash = crafity.ui.flash || {}));

		(function forwardClickOnOneElementToAnother() {
			body$.delegate('[data-click-target]', 'click', function (e) {
				var this$ = $(this)
					, targetName = this$.attr('data-click-target')
					, target = this$.nearest(targetName);

				if (target.length && !target.find(e.target).length && e.target !== target.get(0)) {
//					console.log("this$, targetName, target", this$, targetName, target, e.target);
					return target.click();
					window.location.href = target.attr("href");
					return false;
				} else {
					return true;
				}
			});
		}());

		if (document.ontouchstart !== undefined) {
			var disableScrollUp = false, lastMouseDown;
			var window$ = $(window);

			document.ontouchstart = function (evt) {
				lastMouseDown = new Date().getTime();
			};

			document.ontouchend = function (evt) {
				if (new Date().getTime() - lastMouseDown > 500
					&& window$.scrollTop() < 2) {
					disableScrollUp = true;
					setTimeout(function () {
						disableScrollUp = false;
						window$.scrollTop(2);
						window$.scrollTop(1);
					}, 2000);
				}
			};

			window$.scroll(function (x) {
				if (disableScrollUp) { return; }
				if (window$.scrollTop() <= 0) {
					window$.scrollTop(2);
					window$.scrollTop(1);
				}
			});

			window.scrollTo(0, 1);
		}
	});

}(window.crafity = window.crafity || {}, window.jQuery, window));

/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window, jQuery */

(function (crafity, $, window) {

	"use strict";

	if (!crafity.objects) {
		throw new Error("Missing dependency 'crafity.objects'");
	}
	if (!crafity.Event) {
		throw new Error("Missing dependency 'crafity.Event'");
	}

	var navigation = (crafity.navigation = {})
		, body$ = $(window.document.body)
		, html$ = $("html");

	function openPage(href, bookmark, formData, callback) {
		// see if the Url actually changed
		if (!formData && html$.hasClass("ready") && html$.attr("data-href") === href.split("?")[0]) {
			return;
		}

		html$.removeClass('loaded').addClass('loading');

		if (href.indexOf("layout=") === -1) {
			href += (href.indexOf("?") > -1 ? "&" : "?") + ("layout=false");
		}

		if (typeof formData === 'function') {
			callback = formData;
			formData = undefined;
		}

		//console.log("Ajax call", href);

		crafity.ajax({
			url: href,
			type: formData ? "POST" : "GET",
			data: formData,
			success: crafity.catchError(function (data, textStatus, xhr) {
				try {
					var url = xhr.getResponseHeader("x-crafity-location").split("?")[0]
						, content$ = $("#content")
						, authentication$ = $("#authentication")
						, flash$ = $("#flash")
						, data$ = $("<div/>").append(data)
						, showContent;

					html$.attr("data-href", url);
					if (bookmark) {
						//crafity.navigation.hashInfo.update("");
						crafity.navigation.hashInfo.change({ href: url });
					}

					html$.removeClass('loading').addClass('loaded');
					content$.findAndSelf(".columns").addClass("open");
					data$.findAndSelf(".columns").addClass("open");

					showContent = function showContent(data$, url) {
						content$.empty().append(data$.findAndSelf("#content").children());
						authentication$.empty().append(data$.findAndSelf("#authentication").children());
						crafity.ui.flash.close(function () {
							var loadedFlash$ = data$.findAndSelf("#flash");
							flash$.empty().append(loadedFlash$.children());
							flash$.attr("class", loadedFlash$.attr("class"));
						});

						content$.attr("data-href", url);
						$("html").removeClass("not-ready").addClass("ready");
						window.setTimeout(function () {
							content$.findAndSelf(".columns").removeClass("open");
							if (callback) {
								callback();
							}
						}, 1);

						window.setTimeout(function () {
							content$.findAndSelf(".autoexpand")
								.removeClass("autoexpand collapsed")
								.addClass("expanded");
							if (callback) {
								callback();
							}
						}, 0);
						window.setTimeout(function () {
							content$.findAndSelf(".autocollapse")
								.removeClass("autocollapse expanded")
								.addClass("collapsed");
						}, 0);
					};

					if (html$.hasClass("ready")) {
						window.setTimeout((function (data$) {
							return function () {
								showContent(data$, url);
							};
						}(data$)), 500);
					} else {
						showContent(data$, url);
					}
				} catch (err) {
					console.error("ERROR arguments", err, err.stack);
					crafity.ui.flash.show({ message: err.message, type: "error" });
				}
			}),
			error: function (jqXHR, textStatus, errorThrown) {
				console.error("jqXHR, textStatus, errorThrown", jqXHR, jqXHR.error(), textStatus, errorThrown);
				crafity.ui.flash.show({ message: jqXHR.responseText, type: "error" });
			}
		});
	}

	function openContent(element, href, formData, callback) {
		var this$ = $(element)
			, target = this$.attr("data-async-target")
			, target$ = this$.nearest(target) || $(target);

		if (this$.hasClass('loading')) {
			return false;
		} else {
			this$.addClass("loading");
		}

		if (typeof formData === 'function') {
			callback = formData;
			formData = undefined;
		}

		//console.log("Ajax call", href);

		//this$.removeClass('loaded').addClass('loading');
		//this$.find(".loaded").toggleClass("loaded loading");

		crafity.ajax({
			url: href + (href.indexOf("?") > -1 ? "&" : "?") + ("layout=false"),
			type: formData ? "POST" : "GET",
			data: formData,
			success: crafity.catchError(function (data) {

				var container$ = $(data).nearest(target)
					, collapsables = target$.findAndSelf(".collapsable.expanded")
					, showContent;

				this$.removeClass("loading").addClass("loaded");

				showContent = function () {
					target$.replaceWith(container$);

					window.setTimeout(function () {
						container$.findAndSelf(".autoexpand")
							.removeClass("autoexpand collapsed")
							.addClass("expanded");
						if (callback) {
							callback();
						}
					}, 0);
					window.setTimeout(function () {
						container$.findAndSelf(".autocollapse")
							.removeClass("autocollapse expanded")
							.addClass("collapsed");
					}, 0);
				};

				if (collapsables.length) {
					//console.log("Waiting for collapse!", collapsables, target$);
					collapsables.each(function (index, collapsable) {
						collapsable.addEventListener('webkitTransitionEnd',
							function (event) {
								showContent();
							}, false);
					});
					collapsables.removeClass("expanded").addClass("collapsed");
				} else {
					showContent();
				}

			})
		});

		return false;
	}

	// initializayion method
	(function addUrlHashFunctionality() {
		var objects = crafity.objects
			, Event = crafity.Event
			, window$ = $(window);

		// HashInfo constructor
		function HashInfo() {
			var self = this;

			this.onChange = new Event();
			this.previousValues = {};
			this.values = {};
			this.hashString = undefined;

			this.update = function (hashString) {
				var member, keyValuePairs;
				self.previousValues = {};
				for (member in self.values) {
					if (self.values.hasOwnProperty(member)) {
						self.previousValues[member] = self.values[member];
						delete self.values[member];
					}
				}
				if (typeof hashString === "string" && hashString.length > 0) {
					keyValuePairs = hashString.split("&");
					$(keyValuePairs).each(function (index, keyValuePair) {
						var keyValue = keyValuePair.split("=");
						if (keyValue.length === 2) {
							self.values[keyValue[0]] = keyValue[1];
						} else if (keyValue.length === 1 && keyValuePair.substr(0, 1) === "!") {
							self.values.href = keyValuePair.substr(1);
						} else {
							throw new Error("Invalid hash '" + keyValuePair + "'");
						}
					});
				}
			};

			this.toString = function () {
				var result = self.values.href ? "!" + self.values.href : "", member;
				for (member in self.values) {
					if (self.values.hasOwnProperty(member) && member !== 'href') {
						result += (result.length > 0 ? "&" : "") + member + "=" + self.values[member];
					}
				}
				return result;
			};

			this.change = function (options) {
				var hashTag;

				objects.forEach(options, function (value, member) {
					if (typeof value !== "undefined") {
						self.values[member] = value;
					} else {
						delete self.values[member];
					}
				});
				hashTag = self.toString();

				window$.get(0).location.hash = hashTag ? "#" + hashTag : "";
				//window$.trigger("hashchange");
			};

			if (("onhashchange" in window) && !($.browser.msie)) {
				window$.bind("hashchange", function () {
					var previousValues = self.previousValues;
					self.hashString = window$.get(0).location.hash.substring(1);
					self.update(self.hashString);
					self.onChange.raise(self.toString(), self.values, previousValues);
				});
			}
			else {
				window.setInterval((function () {
					var prevHash;
					return function () {
						if (window.location.hash !== prevHash) {
							prevHash = window.location.hash;
							var previousValues = self.previousValues;
							self.hashString = window$.get(0).location.hash.substring(1) || "!/";
							self.update(self.hashString);
							self.onChange.raise(self.toString(), self.values, previousValues);
						}
					};
				}()), 1000);
			}
		}

		// add HashInfo object as a property of the crafity navigation
		navigation.hashInfo = new HashInfo();

	}());

	(function addAsyncUrlLoadingListener() {

		crafity.ready(function () {
			if (!navigation.enabled) {
				return;
			}
			(function checkIfUrlNeedsToBeChangedToAUrlWithHash(window) {
				if (!window.history || !window.history.pushState) {
					return;
				}
				var pathname = window.location.pathname
					, hash = window.location.hash.replace("#_=_", "");

				if (hash.length < 1 && pathname && pathname !== "/") {

					return window.history.pushState(null, window.document.title, '/#!' + pathname);
					//return window.open('/#!' + pathname, '_self');
				}
			}(window));

			// subscribe on: 1) hash change event and 2) all clicks on anchor elements
			crafity.navigation.hashInfo.onChange.subscribe(function (value) {
				if (value === "_=_") {
					value = "!/";
				}
				if (value.substr(0, 2) !== "!/") {
					return;
				}
				openPage(value.substr(1).replace("#_=_", "") || "/", true);
			});

			body$.delegate('a', 'click', crafity.catchError(function () {
				var this$ = $(this)
					, href = this$.attr("href")
					, url = href.split("?")[0];

				if (!this$.attr("data-async")) {
					// First make sure the A link is clicked (sometimes other click come through)
					return true;
				}

				if (this$.attr("data-async") === "page") {
					if (this$.hasClass("return")) {
						url += "?return=" + crafity.navigation.init().getCurrentPageUrl().split("?")[0];
					}

					openPage(url, this$.hasClass("bookmark"));

				} else if (this$.attr("data-async") === "content") {
					openContent(this, href);

				} else {
					throw new Error("Unknown Async command", this$[0].outerHTML);
				}

				return false;
			}));

			if (!window.location.hash) {
				html$.removeClass("not-ready").addClass("ready");
			} else {
				$(window).trigger("hashchange");
			}

		});

	}());

	(function addAsyncSubmitListener() {

		// subscribe on form submit events
		$(window.document).delegate("form", "submit", function (e) {
			var form$ = $(e.target)
				, formData = form$.serialize()
				, fields$ = form$.find("input, textarea")
				, submitButton$ = form$.find("input[type=submit]")
				, href = form$.attr("action")
				, url = href.split("?")[0];

			fields$.attr("disabled", "disabled");
			submitButton$.attr("data-default-value", submitButton$.val());
			submitButton$.val(submitButton$.attr("data-busy-value") || submitButton$.val()).addClass("busy");

			if (!form$.attr("data-async")) {
				return true;
			}

			if (form$.attr("data-async") === "page") {
				if (form$.hasClass("return")) {
					url += "?return=" + crafity.navigation.init().getCurrentPageUrl().split("?")[0];
				}

				openPage(url, form$.hasClass("bookmark"), formData);

			} else if (form$.attr("data-async") === "content") {

				// the following lines are some hack to obtain the paddingTop of the 
				// section with the form just BEFORE it is submitted to the server
				var parentSection$ = form$.closest("section[data-href]")
					, paddingTop = -1; // quick and dirty
				
				if (parentSection$.length) {
					var section = crafity.sections.getByUrl(parentSection$.attr('data-href'));

//					console.log("\n\rsection.getPaddingTop()", section.getPaddingTop());
					
					paddingTop = section.getPaddingTop() + form$.offset().top;
				}
				
				// submit form
				openContent(form$, href, formData, function () {

					fields$.attr("disabled", null);
					submitButton$.val(submitButton$.attr("data-default-value") || submitButton$.val()).removeClass("busy");

					// GASL

					if (paddingTop > -1) {
						
						$(".scrollable:first").animate(
							{
								"scrollTop": paddingTop,
								opacity: 1
							},
							400,
							"swing",
							function () {
							});
					}
				});

			} else {
				throw new Error("Unknown Async command", form$[0].outerHTML);

			}

			return false;
		});
	}());

	navigation.enabled = true;

	navigation.init = function () {
		var nav = {};

		nav.getCurrentPageUrl = function () {
			if (window.location.hash.indexOf("#!/") === 0) {
				return window.location.hash.substr(2, window.location.hash.length - 2);
			}
			return window.document.body.getAttribute("data-href") || window.document.location.pathname;
		};

		nav.getTargets = function () {
			var targets = {};
			$("[id].async.target").each(function (index, element) {
				targets[element.getAttribute("id")] = element;
			});
			return targets;
		};

		return nav;

	};

}(window.crafity = window.crafity || {}, jQuery, window));

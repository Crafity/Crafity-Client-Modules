/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window, jQuery */

(function (crafity, $) {

	"use strict";

	if (!crafity.objects) {
		throw new Error("Missing dependency 'crafity.objects'");
	}
	if (!crafity.Event) {
		throw new Error("Missing dependency 'crafity.Event'");
	}

	var objects = crafity.objects
		, Event = crafity.Event
		, navigation = (crafity.navigation = {})
		, window$ = $(window);

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

		var storedHash;
		if (("onhashchange" in window) && !($.browser.msie)) {
			window$.bind("hashchange", function () {
				var previousValues = self.previousValues;
				self.hashString = window$.get(0).location.hash.substring(1);
				self.update(self.hashString);
				self.onChange.raise(self.toString(), self.values, previousValues);
			});
		}
		else {
			var prevHash;
			window.setInterval(function () {
				if (window.location.hash !== prevHash) {
					prevHash = window.location.hash;
					var previousValues = self.previousValues;
					self.hashString = window$.get(0).location.hash.substring(1) || "!/";
					self.update(self.hashString);
					self.onChange.raise(self.toString(), self.values, previousValues);
				}
			}, 100);
		}
	}

	navigation.hashInfo = new HashInfo();

}(window.crafity = window.crafity || {}, jQuery));

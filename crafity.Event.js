/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window, setTimeout*/
/*!
 * crafity.Event
 * Copyright(c) 2011 Crafity
 * Copyright(c) 2011 Bart Riemens
 * Copyright(c) 2011 Galina Slavova
 * MIT Licensed
 */

(function (crafity) {
	"use strict";

	if (!crafity.arrays) {
		throw new Error("Missing dependency 'crafity.arrays'");
	}

	var arrays = crafity.arrays;

	crafity.Event = function Event(type) {
		var self = this;

		this.handlers = [];
		this.types = arrays.toArray(arguments);
		this.sync = arrays.contains(self.types, "sync");

		if (self.sync) {
			self.types.splice(self.types.indexOf('sync'), 1);
		}

		if (arrays.contains.not(self.types, "unobservable")) {
			this.onListenerSubscribed = new Event("unobservable");
			this.onListenerUnsubscribed = new Event("unobservable");
		} else {
			self.types.splice(self.types.indexOf('unobservable'), 1);
		}

		this.raiseFunctions = {
			cancel: function (args) {
				var h = self.handlers.slice()
					, next, raise;

				next = function next() {
					if (h && h.length > 0) {
						var handler = h[0];
						h.splice(0, 1);
						raise(handler);
					}
				};

				raise = function raise(handler) {
					function innerRaise() {
						if (handler.apply(self, args) !== false) {
							next();
						}
					}

					if (self.sync) {
						innerRaise();
					} else {
						setTimeout(function () {
							innerRaise();
						}, 1);
					}
				};

				next();
			}
		};

		if (!self.types || self.types.length === 0 || self.types.indexOf('cancel') > -1) {
			self.raiseFunction = self.raiseFunctions.cancel;
		} else {
			throw new TypeError("Unknown Event Type");
		}

		/**
		 *
		 */

		this.listenerCount = self.handlers.length;

		/**
		 *
		 * @param args
		 */

		this.raise = function (args) {
			self.raiseFunction(arrays.toArray(arguments));
		};

		/**
		 *
		 * @param handler
		 */

		this.subscribe = function (handler) {
			if (handler && handler instanceof Function) {
				self.handlers.push(handler);
			} else {
				throw new Error("Invalid or undefined handler");
			}
			self.listenerCount = self.handlers.length;
			if (self.onListenerSubscribed) {
				self.onListenerSubscribed.raise(self, handler);
			}
		};

		/**
		 *
		 * @param handler
		 */

		this.unsubscribe = function (handler) {
			var handlerIndex;
			self.handlers.forEach(function (existingHandler, index) {
				if (existingHandler === handler) {
					handlerIndex = index;
				}
			});
			if (handlerIndex < 0) {
				throw new Error("Invalid or undefined handler");
			}
			self.handlers.splice(handlerIndex, 1);
			self.listenerCount = self.handlers.length;
			if (self.onListenerUnsubscribed) {
				self.onListenerUnsubscribed.raise(self, handler);
			}
		};

	};

}(window.crafity = window.crafity || {}));

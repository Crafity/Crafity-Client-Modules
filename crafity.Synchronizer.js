/*jslint node:true, bitwise: true, unparam: true, maxerr: 50, white: true */
/*!
 * crafity.Synchronizer - Synchronize multiple events
 * Copyright(c) 2011 Crafity
 * Copyright(c) 2011 Bart Riemens
 * Copyright(c) 2011 Galina Slavova
 * MIT Licensed
 */

(function (crafity, undefined) {

	(function (core) {

		/**
		 * Module dependencies.
		 */
		if (!core.EventEmitter) {
			throw new Error("Dependency 'EventEmitter' not found")
		}

		/**
		 * Initialize module
		 */

		core.Synchronizer = function Synchronizer(finish) {
			"use strict";

			var self = this
				, finished = false
				, lastError = null
				, onfinishCalled = false
				, handlers = []
				, data = {}
				, registerCalled = false;

			this.register = function () {
				registerCalled = true;
				if (onfinishCalled) {
					throw new Error("Can not register new callbacks after onfinish is called");
				}
				finished = false;

				var callback, index, keys = [];
				for (index = 0; index < arguments.length; index += 1) {
					if (typeof arguments[index] === 'string') {
						keys.push(arguments[index]);
					} else if (index === arguments.length - 1
						&& typeof arguments[index] === 'function') {
						callback = arguments[index];
					}
				}

				if (!callback) {
					callback = function () {
					};
				}

				handlers.push(callback);

				return function ondone() {
					var args = Array.prototype.slice.call(arguments)
						, handlerIndex = handlers.indexOf(callback)
						, index
						, subData = data, err;

					if (handlerIndex === -1) {
						return;
					}
					handlers.splice(handlerIndex, 1);
					
					for (index = 0; index < keys.length; index += 1) {
						if (index === keys.length - 1) {
							subData[keys[index]] = args[0];
						} else if (!subData[keys[index]]) {
							subData[keys[index]] = {};
						}
						subData = subData[keys[index]];
					}

					if (err) {
						finished = true;
						lastError = err;
						if (self.listeners("finished").length) {
							onfinishCalled = true;
							self.emit("finished", err);
						}
					} else if (!finished) {
						try {
							callback.apply(callback, arguments);
						} catch (callbackErr) {
							finished = true;
							lastError = callbackErr;
							if (self.listeners("finished").length) {
								onfinishCalled = true;
								self.emit("finished", callbackErr);
							}
						}
						if (handlers.length === 0 && !finished) {
							finished = true;
							if (self.listeners("finished").length) {
								onfinishCalled = true;
								self.emit("finished", lastError, data);
							}
						}
					}
					// Do nothing
				};
			};

			this.onfinish = function (finish) {
				self.on("finished", finish);

				if (lastError) {
					finish(lastError, null);
				} else if (finished && !handlers.length) {
					finish(null, data);
				}
				if (!registerCalled) {
					finish(null, data);
				}
			};

			if (finish) {
				self.onfinish(finish);
			}
		};

		core.Synchronizer.prototype = new core.EventEmitter();

	}(crafity.core = crafity.core || {}));

}(window.crafity = window.crafity || {}, window.undefined));
		

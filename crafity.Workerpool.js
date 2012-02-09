/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window, setTimeout, clearTimeout */
/*!
 * crafity.Workerpool
 * Copyright(c) 2011 Crafity
 * Copyright(c) 2011 Bart Riemens
 * Copyright(c) 2011 Galina Slavova
 * MIT Licensed
 */

(function (crafity) {
	"use strict";

	if (!crafity.Event) {
		throw new Error("Missing dependency 'crafity.Event'");
	}

	var Event = crafity.Event;

	/**
	 *
	 * @param name
	 * @param async
	 * @param autostart
	 * @param timeout
	 */

	crafity.Workerpool = function Workerpool(name, async, autostart, timeout) {
		
		// Local Variables
		var self = this
			, pool = []
			, finished = true
			, timeoutId = null
			, running = [];

		async = async || false;

		function WorkerContext() {
			var self = this
				, timeoutId
				, innerOnCompleted = new Event("sync")
				, publicOnCompleteCallback
				, PublicWorkerContext;

			publicOnCompleteCallback = function(ex, result) {
				if (ex) { throw ex; } else { return result; }
			};

			this.isStillSync = true;
			this.isAsync = false;
			this.asyncTimeout = 1000;
			this.onComplete = new Event("sync");
			this.isCompleted = false;

			PublicWorkerContext = function WorkerContext() {
				this.async = function (timeout) {
					if (self.isAsync) {
						throw new Error('Can not call async twice on a worker context');
					}
					if (self.isCompleted === true) {
						throw new Error('Can not call async after the work is done');
					}
					self.isAsync = true;
					self.asyncTimeout = timeout || self.asyncTimeout;
				};
				this.complete = function (ex, args) {
					if (!self.isAsync) {
						throw new Error('Can not call complete on a non async context');
					}
					if (self.isStillSync === true) {
						throw new Error('Can not call complete while still in sync');
					}
					if (self.isCompleted === true) {
						return;
					}
					args = Array.prototype.slice.call(arguments);
					args.splice(0, 1);
					innerOnCompleted.raise(ex, args);
				};
				this.onComplete = function (callback) {
					if (!self.isAsync) {
						throw new Error('Can not register for oncomplete on a non async worker context');
					}
					if (self.isCompleted === true) {
						return;
					}
					publicOnCompleteCallback = callback;
				};
			};
			this.run = function (work, callback) {
				self.onComplete.subscribe(callback);

				var publicWorkerContext
					, output;

				function onCompleteHandler(ex, result) {
					if (self.isCompleted) {
						throw new Error('Can not call the completed handler after completion');
					}
					self.isCompleted = true;
					innerOnCompleted.unsubscribe(onCompleteHandler);
					clearTimeout(timeoutId);
					try {
						result = publicOnCompleteCallback(ex, result);
						self.onComplete.raise(null, result);
					} catch (err) {
						self.onComplete.raise(err, null);
					}
					self.onComplete.unsubscribe(callback);
				}

				innerOnCompleted.subscribe(onCompleteHandler);

				try {
					publicWorkerContext = new PublicWorkerContext();
					output = work.call(publicWorkerContext, publicWorkerContext);
					self.isStillSync = false;
					if (!self.isAsync) {
						onCompleteHandler(null, output);
					} else {
						timeoutId = setTimeout(function () {
							timeoutId = null;
							innerOnCompleted.raise(new Error("Work item exceeded the specified time out"), null);
						}, self.asyncTimeout);
					}
				} catch (ex) {
					onCompleteHandler(ex, null);
				}
			};
		}

		// Events
		this.onWorkStopped = new Event("sync");
		this.onWorkStarted = new Event("sync");
		this.onWorkCompleted = new Event("sync");
		this.onWorkItemStarted = new Event("sync");
		this.onWorkItemCompleted = new Event("sync");

		// Properties
		this.working = false;

		// Functions
		this.add = function (work) {
			if (work === undefined) {
				throw new Error('Argument "work" is undefined');
			}
			finished = false;
			pool.push(work);
		};

		this.work = function (timeout) {
			self.working = true;
			self.onWorkStarted.raise();
			if (timeout > 0) {
				timeoutId = setTimeout(function () {
					self.stop();
					self.onWorkCompleted.raise(new Error("Work item exceeded the specified time out"));
				}, timeout);
			}
			function processWorkItem() {
				if (!self.working) { return; }
				if (pool.length > 0) {
					var workItem = pool[0]
						, workerContext;
					running.push(workItem.report ? workItem.report.name : workItem);
					pool.splice(0, 1);
					workerContext = new WorkerContext();
					self.onWorkItemStarted.raise(null, workItem);
					setTimeout(function() {
						if (!self.working) {
							return;
						}
						workerContext.run(workItem, function (err) {
							running.pop();
							self.onWorkItemCompleted.raise(err, workItem);
							if (!async) {
								setTimeout(processWorkItem, 10);
							}
						});
						if (async) {
							setTimeout(processWorkItem, 10);
						}
					}, 1);
				} else {
					if (!finished && running.length === 0) {
						finished = true;
						if (!self.working) { return; }
						self.onWorkCompleted.raise();
					}
					if (!self.working) { return; }
					setTimeout(processWorkItem, 100);
				}
			}

			setTimeout(processWorkItem, 1);
		};

		this.stop = function () {
			clearTimeout(timeoutId);
			self.working = false;
			running = [];
			self.onWorkStopped.raise();
		};

		if (autostart) {
			self.work(timeout);
		}
	};
	
}(window.crafity = window.crafity || {}));

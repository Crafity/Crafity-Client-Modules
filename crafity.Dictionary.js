/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals crafity, window*/
/*!
 * crafity.Dictionary
 * Copyright(c) 2011 Crafity
 * Copyright(c) 2011 Bart Riemens
 * Copyright(c) 2011 Galina Slavova
 * MIT Licensed
 */

(function (crafity) {
	"use strict";

	if (!crafity.common) {
		throw new Error("Missing dependency 'crafity.common'");
	}
	if (!crafity.Event) {
		throw new Error("Missing dependency 'crafity.Event'");
	}
	if (!crafity.arrays) {
		throw new Error("Missing dependency 'crafity.arrays'");
	}
	if (!crafity.objects) {
		throw new Error("Missing dependency 'crafity.objects'");
	}

	var common = crafity.common
		, Event = crafity.Event
		, arrays = crafity.arrays
		, objects = crafity.objects;

	/**
	 * A Dictionary Type
	 * @param {Object} obj (Optional) An initial object literal with values
	 */
	crafity.Dictionary = function Dictionary(obj) {
		/**
		 * Validate Arguments
		 */
		common.arg({ name: 'obj', value: obj, type: Object, required: false });

		/**
		 * Variable Declarations
		 */
		var self = this
			, innerDictionary = {};

		/**
		 * On Item Added Event
		 */
		this.onItemAdded = new Event();
		/**
		 * On Item Removed Event
		 */
		this.onItemRemoved = new Event();
		/**
		 * On Item Changed Event
		 */
		this.onItemChanged = new Event();

		/**
		 * Number of obj in the dictionary
		 * @returns {Number} Number of obj in the dictionary
		 */
		this.count = 0;

		/**
		 * Are there any obj in the dictionary
		 * @returns {Boolean} True if there are obj else False
		 */
		this.hasAny = false;

		/**
		 * Get a value by key
		 * @param {String} key The key of the value to get
		 * @returns {Object} The value or undefined
		 */
		this.get = function (key) {
			common.arg({ name: 'key', value: key, type: String, required: true });
			return innerDictionary[key];
		};

		/**
		 * Convert dictionary into an object literal
		 * @returns {Object} Object literal of the dictionary
		 */
		this.toObject = function () {
			return objects.clone(innerDictionary);
		};

		/**
		 * Loop over the dictionary
		 * @param {Function} fn Pass in a function with the arguments value, key and
		 * @returns {Dictionary} The dictionary itself
		 */
		this.forEach = function (fn) {
			objects.forEach(innerDictionary, function (value, key, innerDict) {
				fn(value, key);
			});
			return self;
		};

		/**
		 * Remove all the obj in the dictionary
		 * @returns {Dictionary} The dictionary itself
		 */
		this.clear = function () {
			self.forEach(function (item, key) {
				self.remove(key, item);
			});
			return self;
		};

		/**
		 * Get all the keys
		 * @returns {Array} An array with all the keys
		 */
		this.getKeys = function () {
			return Object.keys(innerDictionary);
		};

		/**
		 * Check if the dictionary contains a specific key
		 * @param {String} key The key to check for
		 * @returns {Boolean} True if the keys exists else False
		 */
		this.containsKey = function (key) {
			common.arg({ name: 'key', value: key, type: String, required: true });
			return arrays.contains(self.getKeys(), key);
		};

		/**
		 * Remove an item from the dictionary by using the key
		 * @param {String} key The key to remove
		 * @returns {Dictionary} The dictionary itself
		 */
		this.remove = function (key) {
			common.arg({ name: 'key', value: key, type: String, required: true });

			var item;

			if (self.containsKey(key)) {
				item = self.get(key);

				delete innerDictionary[key];

				self.count -= 1;
				self.hasAny = self.count > 0;

				self.onItemRemoved.raise(item, key);
			}
			return self;
		};

		/**
		 * Set a value of an existing key
		 * @param {String} key The key of the value to set
		 * @param {Object} value The value to set
		 * @returns {Dictionary} The dictionary itself
		 */
		this.set = function (key, value) {
			common.arg({ name: 'key', value: key, type: String, required: true });
			common.arg({ name: 'value', value: value, required: true });

			if (!self.containsKey(key)) {
				throw new common.Exception("Key '" + key + "' does not exist");
			}
			innerDictionary[key] = value;
			self.onItemChanged.raise(value, key);
			return self;
		};

		/**
		 * Add a new key and value to the dictionary
		 * @param {String} key The key to add
		 * @param {Object} value The value to add
		 * @returns {Dictionary} The dictionary itself
		 */
		this.add = function (key, value) {
			common.arg({ name: 'key', value: key, type: String, required: true });
			common.arg({ name: 'value', value: value });
			if (self.containsKey(key)) {
				throw new common.Exception("Key '" + key + "' already exists");
			}
			innerDictionary[key] = value;
			self.count += 1;
			self.hasAny = true;
			self.onItemAdded.raise(value, key);
			return self;
		};

		/**
		 * Add an object literal's keys and values
		 * @param {Object} obj The value to add
		 * @returns {Dictionary} The dictionary itself
		 */
		this.addMany = function (obj) {
			common.arg({ name: 'obj', value: obj, type: Object, required: true });
			self.clear();
			objects.forEach(obj, function (item, key) {
				self.add(key, item);
			});
			return self;
		};

		if (obj) {
			self.addMany(obj);
		}
	};

}(window.crafity = window.crafity || {}));

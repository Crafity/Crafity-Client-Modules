/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window */
/*!
 * crafity.objects
 * Copyright(c) 2011 Crafity
 * Copyright(c) 2011 Bart Riemens
 * Copyright(c) 2011 Galina Slavova
 * MIT Licensed
 */

(function (crafity) {
	"use strict";
	var objects = (crafity.objects = {})
		, valueTypes = ['string', 'number', 'array', 'date'];

	/**
	 *
	 * @param obj
	 * @param fn
	 */

	objects.forEach = function forEach(obj, fn, thisp) {
		thisp = thisp || this;
		var member;

		if (typeof fn !== "function") {
			throw new TypeError();
		}
		for (member in obj) {
			if (obj.hasOwnProperty(member)) {
				fn.call(thisp, obj[member], member, obj);
			}
		}
	};

	/**
	 *
	 * @param obj
	 * @param fn
	 * @param thisp
	 */

	objects.map = function map(obj, fn, thisp) {
		thisp = thisp || this;
		var member, result = [];

		if (typeof fn !== "function") {
			throw new TypeError();
		}
		for (member in obj) {
			if (obj.hasOwnProperty(member)) {
				result.push(fn.call(thisp, obj[member], member, obj));
			}
		}
		return result;
	};

	/**
	 *
	 * @param obj
	 * @param extension
	 */

	objects.extend = function extend(obj, extension) {
		objects.forEach(extension, function (value, name) {
			obj[name] = extension[name];
		});
		return obj;
	};

	/**
	 *
	 * @param obj
	 */

	objects.clone = function clone(obj) {
		return objects.extend({}, obj);
	};

	/**
	 *
	 * @param obj1
	 * @param obj2
	 */
	objects.areEqual = function (obj1, obj2) {

		// False if not the same type
		if (typeof obj1 !== typeof obj2) { return false; }

		// if they are equal, they are equal
		if (obj1 === obj2) { return true; }

		// The following types had to be ===
		if (~valueTypes.indexOf(typeof obj1)) {
			return false;
		}

		// If one object === null, return false.
		//  problem with null is that it is an object
		if (obj1 === null || obj2 === null) {
			return false;
		}

		// If a function, compare as string
		if (obj1 instanceof Function) {
			return objects.areEqual(obj1.toString(), obj2.toString());
		}

		// Compare the left with the right and the right with the left
		//  The first check is if the right object has all the left properties
		//  Then the right object should not have more properties
		//  The content of the members must be the same
		var cache = [];

		objects.forEach(obj1, function (value, member) {
			cache.push(member);
		});

		objects.forEach(obj2, function (value, member) {
			var index = cache.indexOf(member);

			// If the member was not found in the cache, stop checking
			if (!~index) { return false; }

			// Compare the content of the member
			if (!objects.areEqual(value, obj1[member])) {
				return false;
			}

			cache.splice(index, 1);
		});

		// The objects are equal when there is nothing left
		return !cache.length;
	};

}(window.crafity = window.crafity || {}));

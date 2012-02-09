/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window*/
/*!
 * crafity.arrays
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

	var common = crafity.common
		, arrays = (crafity.arrays = {});

	/**
	 * Convert an object into an array
	 * @param obj The object to convert
	 * @returns The object as an array
	 */

	arrays.toArray = function (obj) {
		common.arg({ name: 'obj', value: obj, required: true });
//return Array.prototype.slice.call(obj, 0);
		return Array.apply(null, obj);
	};

	/**
	 * Add an object to an array
	 * @param array The array to add to
	 * @param obj The object to add
	 * @returns The array
	 */

	arrays.add = function (array, obj) {
		common.arg({ name: 'array', value: array, required: true, type: Array });
		array.push(obj);
		return array;
	};

	/**
	 * Check if an object is in an array
	 * @param array
	 * @param obj
	 * @returns a boolean value
	 */

	arrays.contains = function (array, obj) {
		common.arg({ name: 'array', value: array, required: true, type: Array });
		return !!~array.indexOf(obj);
	};

	/**
	 * Check if an array does not contain an object
	 * @param array The array
	 * @param obj The object
	 * @return a boolean value
	 */
	arrays.contains.not = function (array, obj) {
		return !arrays.contains.apply(this, arrays.toArray(arguments));
	};

}(window.crafity = window.crafity || {}));

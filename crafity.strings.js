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

	var strings = (crafity.strings = {});

	strings.trim = function(value) {
		return (value || this).replace(/^\s+|\s+$/g, "");
	};

	/**
	 * Trim spaces on the left
	 * @param value
	 */

	strings.ltrim = function(value) {
		return value.replace(/^\s+/, "");
	};

	/**
	 * trim space from the right
	 * @param value
	 */

	strings.rtrim = function(value) {
		return value.replace(/\s+$/, "");
	};

	/**
	 * Apply character padding on the left
	 * @param value
	 * @param character
	 * @param length
	 */

	strings.lpad = function(value, character, length) {
		while (value.length < length) {
			value = character + value;
		}
		return value;
	};

	/**
	 * Apply character padding on the right
	 * @param value
	 * @param character
	 * @param length
	 */

	strings.rpad = function(value, character, length) {
		while (value.length < length) {
			value = value + character;
		}
		return value;
	};

}(window.crafity = window.crafity || {}));

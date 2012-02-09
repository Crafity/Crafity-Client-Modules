/*jslint bitwise: true, unparam: true, maxerr: 50, white: true */
/*globals window */
/*!
 * crafity.List
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

	var common = crafity.common
		, Event = crafity.Event
		, arrays = crafity.arrays;

	crafity.List = function List(items) {
		common.arg({ name: 'items', value: items, type:Array, required: false });

		var self = this
			, innerList = [];

		this.onItemAdded = new Event('sync');
		this.onItemChanged = new Event('sync');
		this.onItemRemoved = new Event('sync');

		this.any = false;

		this.get = function (index) {
			common.arg({ name: 'index', value: index, type: Number, required: true });
			return innerList.slice();
		};

		this.toArray = function () {
			return innerList.slice();
		};

		this.clear = function () {
			innerList.forEach(function (item) {
				self.remove(item);
			});
			return self;
		};

		this.remove = function (item) {
			common.arg({ name: 'item', value: item, required: true });
			var index = innerList.indexOf(item);
			if (~index) {
				arrays.remove(innerList, item);
				self.onItemRemoved.raise(item, index);
			}
			return self;
		};

		this.set = function (index, item) {
			common.arg({ name: 'index', value: index, type: Number, required: true });
			common.arg({ name: 'item', value: item, required: true });
			innerList[index] = item;
			self.onItemChanged.raise(item, index);
			return self;
		};

		this.add = function (item) {
			common.arg({ name: 'item', value: item, required: true });
			var index = innerList.push(item);
			self.onItemAdded.raise(item, index);
			return self;
		};

		this.addMany = function (items) {
			common.arg({ name: 'items', value: items, type:Array, required: true });
			self.clear();
			items.forEach(function (item) {
				self.add(item);
			});
			return self;
		};

		if (items) {
			self.addMany(items);
		}
	};

}(window.crafity = window.crafity || {}));

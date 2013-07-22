/*global $, window, document*/

(function (crafity, $) {
	"use strict";

	crafity.sections = (function () {
		/**
		 * An internal dictionary of sections
		 */
		var sections = {}
			, self = {}
			, scrollable$
			, paddingTop;
		
		/**
		 * A type representing a Section
		 * @param {String} url The url of the section
		 * @param {Object} data The section's data
		 */
		function Section(url, data) {

			/* Variables */
			var self = this;

			/**
			 * Is section visible?
			 */
			this.visible = false;

			/**
			 * The section element
			 */
			this.section$ = null;

			/**
			 * The url of this section
			 * returns {String} The url of the section
			 */

			this.url = url;

			/**
			 * The data of the section
			 */

			this.setInnerHtml = function (data) {
				if (!data) { return; }

				var closeButton = $("<a class='close command' href='#'>Close</a>")
					.click(function () {
						self.close();
						return false;
					})
					, sectionBody$ = $("<div class='body' />").append(data);

				self.section$ = $("<section data-href='" + url + "' />")
					.append(sectionBody$)
					.append(closeButton);

				return self;
			};

			/**
			 * Append this section to a parent element
			 * @param parent A parent element to add this section to
			 */

			this.appendTo = function (parent) {
				if (!parent) { throw new Error("Missing argument 'parent'"); }
				if (!self.section$) { throw new Error("There is no data to display"); }
				if (!paddingTop) { paddingTop = parseInt($(parent).css("padding-top").replace("px", "")); }
				self.section$.appendTo(parent);
				return self;
			};

			this.getPaddingTop = function () {
				return (self.section$.get(0).offsetTop - paddingTop);
			};
			
			/**
			 * Show this section
			 */

			this.show = function () {
				if (!self.section$) { throw new Error("There is no data to display"); }

				self.section$.removeClass("animate").addClass("visible");
				setTimeout(function () {
					self.section$.addClass("animate");
				}, (Math.random() * 500));
				if (!scrollable$) { scrollable$ = $(".scrollable:first"); }
				
				scrollable$.animate(
					{ 
						"scrollTop": self.getPaddingTop(), 
						opacity: 1 
					}, 
					400, 
					"swing", 
					function () {
				});
				
				self.visible = true;
				return self;
			};

			/**
			 * Hide this section
			 */

			this.hide = function (callback) {
				if (!self.section$) { throw new Error("There is no data to display"); }
				if (!self.visible) { return; }
				self.section$.css({
					height: self.section$.height(),
					opacity: 1
				}).animate({ height: "0px", opacity: 0 }, 400, "swing", function () {
						self.section$.removeClass("visible");
						if (callback) {
							callback();
						}
					});

				self.visible = false;
				return self;
			};

			/**
			 * Close this section
			 */

			this.close = function () {
				if (!self.section$) { throw new Error("There is no data to display"); }
				if (self.onClosing.raise()) { return; }
				self.hide(function onHidden() {
					self.section$.remove();
				});
				return self;
			};

			/**
			 * On closing event is called before a section is closed
			 */

			this.onClosing = new crafity.Event("cancel");

			// Initialize the new section with data
			this.setInnerHtml(data);

			return this;
		}

		/**
		 * Get all the sections
		 */

		self.getAll = function () {
			return crafity.objects.map(sections, function (value) {
				return value;
			});
		};

		/**
		 * Get a specific section by URL
		 * @param {String} url The url of the section to get
		 */

		self.getByUrl = function (url) {
			return sections[url];
		};

		/**
		 * Create a new section
		 * @param {String} url (Optional) The url of this section
		 * @param {Function} callback (Optional) The callback is required when a url is specified
		 */

		self.create = function create(url, callback) {
			if (!url && !callback) {
				// When there are no args, Then return a new section synchronous
				return new Section(null, null);

			} else if (typeof url === 'Function' && !callback) {

				// return a new section async without loading from a url
				callback = url;
				url = null;
				callback(new Section(url, null));

			} else {

				// Download the content, create a section and call the callback
				crafity.ajax({
					url: url + "?layout=false",
					success: function (data) {
						callback(null, new Section(url, data));
					},
					error: function (err) {
						callback(err, null);
					}
				});
			}
		};

		/**
		 * Add a section to the application
		 * @param {Section} section The section to add
		 */

		self.add = function (section) {
			sections[section.url] = section;
		};

		/**
		 * Remove a section from the list of sections
		 * @param {Section} section The section to remove
		 */

		self.remove = function (section) {
			if (!section) { return; }
			delete sections[section.url];
		};

		return self;

	}());

	crafity.navigation.enabled = false;
	
}(window.crafity = window.crafity || {}, jQuery));

// * * * * * * * * * * * * * * * * * *
// 		Test code...
// * * * * * * * * * * * * * * * * * *

$(document).ready(function () {
	// Variables
	var hashInfo = crafity.navigation.hashInfo
		, menuSection$ = $("#menu")
		, menuSection;

	if (menuSection$) {
		menuSection = crafity.sections.create();
		menuSection.url = "/";
		menuSection.setInnerHtml(menuSection$.html());
		crafity.sections.add(menuSection);
	}

	// Register on all the clicks on anchor elements
	$("body").delegate("a", "click", function (e) {

		// First make sure the A link is clicked (sometimes other click come through)
		if (this.nodeName === 'A') {

			if ($(this).hasClass("download") ||
				$(this).hasClass("mail")) { return; }

			// Get the href of the link
			var href = this.getAttribute("href");

			var base = window.location.href;
			if (~base.lastIndexOf("#")) {
				base = base.substring(0, base.lastIndexOf("#"));
			}
			if (~base.lastIndexOf("/")) {
				base = base.substring(0, base.lastIndexOf("/") + 1);
			}
			href = href.replace(base, "");

			// If the href is empty or
			//  is an external link then quit

			if (href && (~href.indexOf("http://") || ~href.indexOf("https://"))) {
				return;
			}

			// Change the href in the URL's hash
			hashInfo.change({ href: href || "/" });

			return false;
		}
	});
	
	// subscribe on navigation hash changed
	hashInfo.onChange.subscribe(function() {
		// Get the section belonging to the url
		var section = crafity.sections.getByUrl(hashInfo.values.href);

		if (section) {
			// If the section is found, then show it
			section.show();

		} else if (hashInfo.values.href && hashInfo.values.href !== "/") {

			// If the section was not found and a section is requisted
			//  then create a new section...
			crafity.sections.create(hashInfo.values.href, function(err, section) {
				if (err) { throw err; }

				// Add the section to the list of sections
				crafity.sections.add(section);

				// Subscribe to the close event of the section
				section.onClosing.subscribe(function () {

					var newSection = section.section$.prev();
					if (!newSection || !newSection.attr("data-href")) { newSection = section.section$.next(); }
					if (newSection && newSection.attr("data-href")) {
						hashInfo.change({ href: newSection.attr("data-href") });
					}

					crafity.sections.remove(section);
					return true;
				});

				// and add the new section to the screen
				section.appendTo($("#container")).show();
			});

		}
	});

	$(window).trigger("hashchange");

});

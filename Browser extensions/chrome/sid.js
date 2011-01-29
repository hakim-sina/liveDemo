/**
SidJS - JavaScript And CSS Lazy Loader 0.1

Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of SidJS nor the names of its contributors may be
      used to endorse or promote products derived from this software without
      specific prior written permission.

*/
(function() {
	var win = window,
		doc = document,
		proto = 'prototype',
		head = doc.getElementsByTagName('head')[0],
		body = doc.getElementsByTagName('body')[0],
		sniff = /*@cc_on!@*/1 + /(?:Gecko|AppleWebKit)\/(\S*)/.test(navigator.userAgent); // 0 - IE, 1 - O, 2 - GK/WK

	var createNode = function(tag, attrs) {
		var attr, node = doc.createElement(tag);
		for (attr in attrs) {
			if (attrs.hasOwnProperty(attr)) {
				node.setAttribute(attr, attrs[attr]);
			}
		}
		return node;
	};

	var load = function(type, urls, callback, scope) {
		if (this == win) {
			return new load(type, urls, callback, scope);
		}

		urls = (typeof urls == 'string' ? [urls] : urls);
		scope = (scope ? (scope == 'body' ? body : head) : (type == 'js' ? body : head));

		this.callback = callback || function() {};
		this.queue = [];

		var node, i = len = 0, that = this;

		for (i = 0, len = urls.length; i < len; i++) {
			this.queue[i] = 1;
			if (type == 'css') {
				node = createNode('link', { type: 'text/css', rel: 'stylesheet', href: urls[i] });
			}
			else {
				node = createNode('script', { type: 'text/javascript', src: urls[i] });
			}
			scope.appendChild(node);

			if (sniff) {
				if (type == 'css' && sniff == 2) {
					var intervalID = setInterval(function() {
						try {
							node.sheet.cssRules;
							clearInterval(intervalID);
							that.__callback();
						}
						catch (ex) {}
					}, 100);
				}
				else {
					node.onload = function() {
						that.__callback();
					}
				}
			}
			else {
				node.onreadystatechange = function() {
					if (/^loaded|complete$/.test(this.readyState)) {
						this.onreadystatechange = null;
						that.__callback();
					}
				};
			}
		}

		return this;
	};
	load[proto].__callback = function() {
		if (this.queue.pop() && (this.queue == 0)) { this.callback(); }
	};

	window.Sid = {
		css: function(urls, callback, scope) {
			return load('css', urls, callback, scope);
		},
		js: function(urls, callback, scope) {
			return load('js', urls, callback, scope);
		},
		load: function(type, urls, callback, scope) {
			return load(type, urls, callback, scope);
		}
	};
})();

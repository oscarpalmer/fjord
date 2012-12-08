(function(){
	
	var Fjord,
			cache,
			old,
			l = window.location.protocol + '//' + window.location.host + '/',
			y = !!window.history && !!window.history.pushState && !!window.history.replaceState;
	
	cache = [];
	
	Fjord = {
		cache: function(url, window, document) {
			if (this.cached(url)) {
				var item;
				item = this.find(url);
				item.x = window.pageXOffset;
				item.y = window.pageYOffset;
			} else {
				cache.push({
					body: document.body.innerHTML,
					title: document.title,
					url: url,
					x: window.pageXOffset,
					y: window.pageYOffset
				});
			}
		},
		cached: function(url) {
			var index = 0, length = cache.length;
			for (; index < length; index++) {
				if (cache[index].url === url) {
					return true;
				}
			}
			return false;
		},
		find: function(url) {
			var index = 0, length = cache.length;
			for (; index < length; index++) {
				if (cache[index].url === url) {
					return cache[index];
				}
			}
		},
		render: function(item, type) {
			document.body.innerHTML = item.body;
			document.title = item.title;
			old = item.url;
			if (type === 'pop') {
				window.scrollTo(item.x, item.y);
			} else if (type === 'push') {
				window.history.pushState({ path: item.url }, '', item.url);
			}
			this.trigger('fjord:ready');
		},
		request: function() {
			try {
				return new XMLHttpRequest();
			} catch (e) {
				try {
					return new ActiveXObject('Msxml2.XMLHTTP');
				} catch (e) {
					try {
						return new ActiveXObject('Msxml2.XMLHTTP.6.0');
					} catch (e) {
						return new ActiveXObject('Msxml2.XMLHTTP.3.0');
					}
				}
			}
		},
		trigger: function(name) {
			var event;
			event = document.createEvent('Events');
			event.initEvent(name, true, true);
			document.dispatchEvent(event);
		},
		visit: function(url, type) {
			this.trigger('fjord:load');
			this.cache(type === 'pop' ? old : window.location.href, window, document);
			if (this.cached(url)) {
				this.render(Fjord.find(url), type);
			} else {
				var clean, html, title, xhr;
				xhr = this.request();
				xhr.onload = function () {
					clean = xhr.responseText.replace(/\s+/g, ' ').replace(/\t+/g, '');
					html  = clean.replace(/^(.*)<body>(.*)<\/body>(.*)$/, '$2');
					title = clean.replace(/^(.*)<title>(.*)<\/title>(.*)$/, '$2');
					Fjord.render({
						body: html,
						title: title,
						url: url,
						x: 0,
						y: 0
					}, type);
				};
				xhr.open('get', url, true);
				xhr.send(null);
			}
		}
	};
	
	//
	
	if (y) {
	
		window.onload = function() {
			history.replaceState({ path: window.location.href }, '');
		};
	
		window.onpopstate = function (event) {
			var s;
			s = event.state;
			if (s !== null && s.path !== null) {
				Fjord.visit(s.path, 'pop');
			}
		};
	
		window.onclick = function (event) {
			var t;
			t = event.target;
			if (t.tagName === 'A' && t.href.indexOf(l) === 0) {
				event.preventDefault();
				if (t.href !== window.location.href) {
					Fjord.visit(t.href, 'push');
				}
			}
		};
	
	}

}());
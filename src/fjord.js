;(function(){
  var
  win      = this,
  doc      = win.document,
  createEv = "createEvent",
  location = "location",
  push     = "push",
  response = "responseText",
  xOffset  = "PageXOffset",
  yOffset  = "PageYOffset",
  baseurl  = win[location].protocol + "//" + win[location].host + "/",
  oldie    = win[location].href,
  support  = !!win.history,
  cache    = [];

  /**
   * Get item from cache.
   */
  function getCache(url) {
    var
    index = 0,
    langd = cache.length;

    for (; index < langd; index++) {
      if (cache[index].url === url) {
        return cache[index];
      }
    }
  }

  /**
   * Check if item is cached.
   */
  function isCached(url) {
    var
    index = 0,
    langd = cache.length;

    for (; index < langd; index++) {
      if (cache[index].url === url) {
        return true;
      }
    }

    return false;
  }

  /**
   * Render new content.
   */
  function render(item, type) {
    doc.body.innerHTML = item.body;
    doc.title = item.title;
    oldie = item.url;

    if (type === push) {
      history.pushState({ fjord: item.url }, "", item.url);
    } else {
      win.scrollTo(item.x, item.y);
    }

    trigger("fjord:ready");
  }

  /**
   * Create a Request object. Sorry, oldIE?
   */
  function request() {
    return win.XMLHttpRequest ? new win.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  }

  /**
   * Set item in cache.
   */
  function setCache(url) {
    var
    item;

    if (isCached(url)) {
      item   = getCache(url);
      item.x = win[xOffset];
      item.y = win[yOffset];
    } else {
      item = {
        body: doc.body.innerHTML,
        title: doc.title,
        url: url,
        x: win[xOffset],
        y: win[yOffset]
      };

      cache.push(item);
    }
  }

  /**
   * Trigger event.
   */
  function trigger(name) {
    var
    customEvent;

    if (doc[createEv]) {
      customEvent = doc[createEv]("Event");
      customEvent.initEvent(name, true, true);
    } else {
      customEvent = new Event(name);
    }

    doc.dispatchEvent(customEvent);
  }

  /**
   * Visit (or revisit) an url.
   */
  function visit(url, type) {
    var
    link = type === push ? win[location].href : oldie,
    http;

    trigger("fjord:load");
    setCache(link);

    if (isCached(url)) {
      return render(getCache(url), type);
    }

    http = request();

    http.onload = function() {
      render({
        body:  http[response].replace(/^[\s\S]+?<body>([\s\S]+?)<\/body>[\s\S]+?$/, "$1"),
        title: http[response].replace(/^[\s\S]+?<title>([\s\S]+?)<\/title>[\s\S]+?$/, "$1"),
        url: url,
        x: 0,
        y: 0
      }, type);
    };

    http.open("GET", url, true);
    http.send(null);
  }

  /**
   * Ah, good browsers.
   */
  if (support) {
    /**
     * Set default state.
     */
    win.onload = function() {
      history.replaceState({ fjord: win[location].href }, "");
    };

    /**
     * Onclick event for anchors with same base url.
     */
    win.onclick = function(event) {
      var
      target = event.target;

      if (event.metaKey || event.ctrlKey) {
        return true;
      }

      if (target.tagName === "A" && target.href.indexOf(baseurl) === 0) {
        event.preventDefault();

        if (target.href !== win[location].href) {
          visit(target.href, push);
        }
      }
    };

    /**
     * Check for pops, e.g. backspace or browser buttons.
     */
    win.onpopstate = function(event) {
      var
      state = event.state;

      if (state && state.fjord) {
        visit(state.fjord, "pop");
      }
    };
  }
}());
(function(){
  var
  Fjord,
  win      = window,
  doc      = win.document,
  cache    = [],
  oldie    = win.location.href,
  location = win.location.protocol + "//" + win.location.host + "/",
  support  = !!win.history,
  createEv = "createEvent",
  onload   = "onload",
  push     = "push",
  response = "responseText",
  xOffset  = "PageXOffset",
  yOffset  = "PageYOffset";


  function each(array, fn) {
    var
    index  = 0,
    length = array.length;
    for (; index < length; index++) {
      fn(array[index], index);
    }
  }


  Fjord = {
    cache: function(url) {
      var
      item;
      if (Fjord.cached(url)) {
        item   = Fjord.find(url);
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
    },

    cached: function(url) {
      var
      bool;
      each(cache, function(item) {
        if (item.url === url) {
          bool = true;
        }
      });
      return bool || false;
    },

    find: function(url) {
      var
      ret;
      each(cache, function(item) {
        if (item.url === url) {
          ret = item;
        }
      });
      return ret;
    },

    render: function(item, type) {
      doc.body.innerHTML = item.body;
      doc.title = item.title;
      oldie = item.url;
      if (type === push) {
        history.pushState({ fjord: item.url }, "", item.url);
      } else {
        win.scrollTo(item.x, item.y);
      }
      Fjord.trigger("fjord:ready");
    },

    request: function() {
      return win.XMLHttpRequest ?
             new win.XMLHttpRequest() :
             new ActiveXObject("Microsoft.XMLHTTP");
    },

    trigger: function(name) {
      var
      customEvent;
      if (doc[createEv]) {
        customEvent = doc[createEv]("Event");
        customEvent.initEvent(name, true, true);
      } else {
        customEvent = new Event(name);
      }
      doc.dispatchEvent(customEvent);
    },

    visit: function(url, type) {
      var
      http,
      link = type === push ? win.location.href : oldie;
      Fjord.trigger("fjord:load");
      Fjord.cache(link);
      if (Fjord.cached(url)) {
        Fjord.render(Fjord.find(url), type);
      } else {
        http = Fjord.request();
        http[onload] = function() {
          Fjord.render({
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
    }
  };

  if (support) {
    win[onload] = function() {
      history.replaceState({ fjord: win.location.href }, "");
    };

    win.onclick = function(event) {
      var
      target = event.target;
      if (target.tagName === "A" && target.href.indexOf(location) === 0) {
        event.preventDefault();
        if (target.href !== win.location.href) {
          Fjord.visit(target.href, push);
        }
      }
    };

    win.onpopstate = function(event) {
      var
      state = event.state;
      if (state && state.fjord) {
        Fjord.visit(state.fjord, "pop");
      }
    };
  }
}());
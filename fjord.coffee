# Base location.
location = window.location.protocol + "//" + window.location.host + "/"
# Does your browser support the history API?
yhistory = !!window.history and !!window.history.pushState and !!window.history.replaceState

# Cache storage.
cache = []
# For popstate
oldie = window.location.href

# Fjord!
Fjord = 
  # Add to the cache storage
  cache: (url, window, document) ->
    if this.cached url
      item = this.find url
      item.x = window.pageXOffset
      item.y = window.pageYOffset
    else
      item =
        body: document.body.innerHTML
        title: document.title
        url: url
        x: 0
        y: 0
      cache.push item

  # Is the item with this url cached?
  cached: (url) ->
    return true for item in cache when item.url is url
    false

  # Find item with this url.
  find: (url) ->
    return item for item in cache when item.url is url

  # Render new page.
  render: (item, type) ->
    document.body.innerHTML = item.body
    document.title = item.title
    oldie = item.url
    window.scrollTo(item.x, item.y) if type is "pop"
    window.history.pushState({ path: item.url }, "", item.url) if type is "push"
    this.trigger "fjord:ready"

  # AJAX.
  request: () ->
    try
      return new XMLHttpRequest()
    catch error
      try
        return new ActiveXObject "Msxml2.XMLHTTP"
      catch error
        try
          return new ActiveXObject "Msxml2.XMLHTTP.6.0"
        catch error
          return new ActiveXObject "Msxml2.XMLHTTP.3.0"

  # Trigger events.
  trigger: (name) ->
    event = document.createEvent "Events"
    event.initEvent name, true, true
    document.dispatchEvent event

  # Load item from cache or via AJAX.
  visit: (url, type) ->
    link = if type is "pop" then oldie else window.location.href
    this.trigger "fjord:load"
    this.cache link, window, document
    if this.cached url
      item = this.find url
      this.render item, type
    else
      xhr = this.request()
      xhr.onload = () ->
        html  = xhr.responseText.replace /^([\s\S]+?)<body>([\s\S]+?)<\/body>([\s\S]+?)$/, "$2"
        title = xhr.responseText.replace /^([\s\S]+?)<title>([\s\S]+?)<\/title>([\s\S]+?)$/, "$2"
        item =
          body: html
          title: title
          url: url
          x: 0
          y: 0
        Fjord.render item, type
      xhr.open "get", url, true
      xhr.send null

# Your browser is awesome-y.
if yhistory
  # Set the default state.
  window.onload = ->
    history.replaceState { path: window.location.href }, ""

  # Back and forward buttons are fun, too.
  window.onpopstate = (event) ->
    state = event.state;
    Fjord.visit(state.path, "pop") if state?.path?

  # Clicking anchors.
  window.onclick = (event) ->
    target = event.target;
    if target.tagName is "A" and target.href.indexOf(location) is 0
      event.preventDefault()
      Fjord.visit(target.href, "push") if target.href isnt window.location.href

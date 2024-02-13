/* eslint-disable */
'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

/*jshint browser: true, node: true
 */
;(function (exports) {
  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]'
    }
  }

  function checkUserAgent(ua) {
    var browser = {}
    var match = /(dolfin)[ \/]([\w.]+)/.exec(ua) ||
      /(edge)[ \/]([\w.]+)/.exec(ua) ||
      /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(tizen)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      (ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua)) || ['', 'unknown']
    if (match[1] === 'webkit') {
      match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
        /(android)[ \/]([\w._\-]+);/.exec(ua) || [match[0], 'safari', match[2]]
    } else if (match[1] === 'mozilla') {
      if (/trident/.test(ua)) {
        match[1] = 'msie'
      } else {
        match[1] = 'firefox'
      }
    } else if (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)) {
      match[1] = 'polaris'
    }

    browser[match[1]] = true
    browser.name = match[1]
    browser.version = setVersion(match[2])

    return browser
  }

  function setVersion(versionString) {
    var version = {}

    var versions = versionString ? versionString.split(/\.|-|_/) : ['0', '0', '0']
    version.info = versions.join('.')
    version.major = versions[0] || '0'
    version.minor = versions[1] || '0'
    version.patch = versions[2] || '0'

    return version
  }

  function checkPlatform(ua) {
    if (isPc(ua)) {
      return 'pc'
    } else if (isTablet(ua)) {
      return 'tablet'
    } else if (isMobile(ua)) {
      return 'mobile'
    } else {
      return ''
    }
  }
  function isPc(ua) {
    if (
      ua.match(/linux|windows (nt|98)|macintosh|cros/) &&
      !ua.match(/android|mobile|polaris|lgtelecom|uzard|natebrowser|ktf;|skt;/)
    ) {
      return true
    }
    return false
  }
  function isTablet(ua) {
    if (ua.match(/ipad/) || (ua.match(/android/) && !ua.match(/mobi|mini|fennec/))) {
      return true
    }
    return false
  }
  function isMobile(ua) {
    if (
      !!ua.match(
        /ip(hone|od)|android.+mobile|windows (ce|phone)|blackberry|bb10|symbian|webos|firefox.+fennec|opera m(ob|in)i|tizen.+mobile|polaris|iemobile|lgtelecom|nokia|sonyericsson|dolfin|uzard|natebrowser|ktf;|skt;/,
      )
    ) {
      return true
    } else {
      return false
    }
  }

  function checkOs(ua) {
    var os = {},
      match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
        (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)
          ? ['', 'polaris', '0.0.0']
          : false) ||
        /(windows)(?: nt | phone(?: os){0,1} | )([\w._\-]+)/.exec(ua) ||
        /(android)[ \/]([\w._\-]+);/.exec(ua) ||
        (/android/.test(ua) ? ['', 'android', '0.0.0'] : false) ||
        (/(windows)/.test(ua) ? ['', 'windows', '0.0.0'] : false) ||
        /(mac) os x ([\w._\-]+)/.exec(ua) ||
        /(tizen)[ \/]([\w._\-]+);/.exec(ua) ||
        (/(linux)/.test(ua) ? ['', 'linux', '0.0.0'] : false) ||
        (/webos/.test(ua) ? ['', 'webos', '0.0.0'] : false) ||
        /(cros)(?:\s[\w]+\s)([\d._\-]+)/.exec(ua) ||
        /(bada)[ \/]([\w._\-]+)/.exec(ua) ||
        (/bada/.test(ua) ? ['', 'bada', '0.0.0'] : false) ||
        (/(rim|blackberry|bb10)/.test(ua) ? ['', 'blackberry', '0.0.0'] : false) || ['', 'unknown', '0.0.0']

    if (match[1] === 'iphone' || match[1] === 'ipad' || match[1] === 'ipod') {
      match[1] = 'ios'
    } else if (match[1] === 'windows' && match[2] === '98') {
      match[2] = '0.98.0'
    }
    if (match[1] === 'cros') {
      match[1] = 'chrome'
    }
    os[match[1]] = true
    os.name = match[1]
    os.version = setVersion(match[2])
    return os
  }

  var baseAppList = ['crios', 'fxios', 'daumapps']
  function checkApp(ua, customAppList) {
    var app = {},
      match = null,
      checkAppList = baseAppList

    if (Array.isArray(customAppList)) {
      checkAppList = baseAppList.concat(customAppList)
    } else if (typeof customAppList === 'string') {
      checkAppList = baseAppList.concat([customAppList])
    }

    for (var i = 0, len = checkAppList.length; i < len; i += 1) {
      var appname = checkAppList[i]
      var regex = new RegExp('(' + appname + ')[ \\/]([\\w._\\-]+)')
      match = regex.exec(ua)
      if (match) {
        break
      }
    }

    if (!match) {
      match = ['', '']
    }

    if (match[1]) {
      app.isApp = true
      app.name = match[1]
      app.version = setVersion(match[2])
    } else {
      app.isApp = false
    }

    return app
  }

  function getLowerUserAgent(ua) {
    var lowerUa = ''
    if (!ua) {
      if (typeof window !== 'undefined' && window.navigator && typeof window.navigator.userAgent === 'string') {
        lowerUa = window.navigator.userAgent.toLowerCase()
      } else {
        lowerUa = ''
      }
    } else {
      lowerUa = ua.toLowerCase()
    }

    return lowerUa
  }

  var userAgent = (exports.userAgent = function (ua, customAppList) {
    var lowerUa = getLowerUserAgent(ua)

    return {
      ua: lowerUa,
      browser: checkUserAgent(lowerUa),
      platform: checkPlatform(lowerUa),
      os: checkOs(lowerUa),
      app: checkApp(lowerUa, customAppList),
    }
  })

  if (typeof window === 'object' && window.navigator.userAgent) {
    window.ua_result = userAgent(window.navigator.userAgent) || null
  }
})(
  (function () {
    // Make userAgent a Node module, if possible.
    if (typeof exports === 'object') {
      exports.daumtools = exports
      exports.util = exports
      return exports
    } else if (typeof window === 'object') {
      window.daumtools = typeof window.daumtools === 'undefined' ? {} : window.daumtools
      window.util = typeof window.util === 'undefined' ? window.daumtools : window.util
      return window.daumtools
    } else if (typeof self === 'object') {
      // for use in web workers
      self.daumtools = typeof self.daumtools === 'undefined' ? {} : self.daumtools
      self.util = typeof self.util === 'undefined' ? self.daumtools : self.util
      return self
    }
  })(),
)

/* global exports, jshint devel: true */
;(function (exports) {
  exports.web2app = (function () {
    var TIMEOUT_IOS = 2.5 * 1000,
      TIMEOUT_ANDROID = 3 * 100,
      INTERVAL = 100,
      ua = exports.userAgent(),
      os = ua.os,
      intentNotSupportedBrowserList = ['firefox', 'opr/']

    function moveToStore(storeURL) {
      top.window.location.href = storeURL
    }

    function web2app(context) {
      var willInvokeApp = typeof context.willInvokeApp === 'function' ? context.willInvokeApp : function () {},
        onAppMissing = typeof context.onAppMissing === 'function' ? context.onAppMissing : moveToStore,
        onUnsupportedEnvironment =
          typeof context.onUnsupportedEnvironment === 'function' ? context.onUnsupportedEnvironment : function () {}

      willInvokeApp()

      if (os.android) {
        if (isIntentSupportedBrowser() && context.intentURI && !context.useUrlScheme) {
          web2appViaIntentURI(context.intentURI)
        } else if (context.storeURL) {
          web2appViaCustomUrlSchemeForAndroid(context.urlScheme, context.storeURL, onAppMissing)
        }
      } else if (os.ios && context.storeURL) {
        web2appViaCustomUrlSchemeForIOS(context.urlScheme, context.storeURL, onAppMissing, context.universalLink)
      } else {
        setTimeout(function () {
          onUnsupportedEnvironment()
        }, 100)
      }
    }

    // chrome 25 and later supports intent. https://developer.chrome.com/multidevice/android/intents
    function isIntentSupportedBrowser() {
      var supportsIntent = ua.browser.chrome && +ua.browser.version.major >= 25
      var blackListRegexp = new RegExp(intentNotSupportedBrowserList.join('|'), 'i')
      return supportsIntent && !blackListRegexp.test(ua.ua)
    }

    function web2appViaCustomUrlSchemeForAndroid(urlScheme, storeURL, fallback) {
      deferFallback(TIMEOUT_ANDROID, storeURL, fallback)
      launchAppViaHiddenIframe(urlScheme)
    }

    function deferFallback(timeout, storeURL, fallback) {
      var clickedAt = new Date().getTime()
      return setTimeout(function () {
        var now = new Date().getTime()
        if (isPageVisible() && now - clickedAt < timeout + INTERVAL) {
          fallback(storeURL)
        }
      }, timeout)
    }

    function web2appViaIntentURI(launchURI) {
      if (ua.browser.chrome) {
        move()
      } else {
        setTimeout(move, 100)
      }

      function move() {
        top.window.location.href = launchURI
      }
    }

    function web2appViaCustomUrlSchemeForIOS(urlScheme, storeURL, fallback, universalLink) {
      var tid = deferFallback(TIMEOUT_IOS, storeURL, fallback)
      if (parseInt(ua.os.version.major, 10) < 8) {
        bindPagehideEvent(tid)
      } else {
        bindVisibilityChangeEvent(tid)
      }

      // https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/AppSearch/UniversalLinks.html#//apple_ref/doc/uid/TP40016308-CH12
      if (isSupportUniversalLinks()) {
        if (universalLink === undefined) {
          universalLink = urlScheme
        } else {
          clearTimeout(tid)
        }
        launchAppViaChangingLocation(universalLink)
      } else {
        launchAppViaHiddenIframe(urlScheme)
      }
    }

    function bindPagehideEvent(tid) {
      window.addEventListener('pagehide', function clear() {
        if (isPageVisible()) {
          clearTimeout(tid)
          window.removeEventListener('pagehide', clear)
        }
      })
    }

    function bindVisibilityChangeEvent(tid) {
      document.addEventListener('visibilitychange', function clear() {
        if (isPageVisible()) {
          clearTimeout(tid)
          document.removeEventListener('visibilitychange', clear)
        }
      })
    }

    function isPageVisible() {
      var attrNames = ['hidden', 'webkitHidden']
      for (var i = 0, len = attrNames.length; i < len; i++) {
        if (typeof document[attrNames[i]] !== 'undefined') {
          return !document[attrNames[i]]
        }
      }
      return true
    }

    function launchAppViaChangingLocation(urlScheme) {
      top.window.location.href = urlScheme
    }

    function launchAppViaHiddenIframe(urlScheme) {
      setTimeout(function () {
        var iframe = createHiddenIframe('appLauncher')
        iframe.src = urlScheme
      }, 100)
    }

    function createHiddenIframe(id) {
      var iframe = document.createElement('iframe')
      iframe.id = id
      iframe.style.border = 'none'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.display = 'none'
      iframe.style.overflow = 'hidden'
      document.body.appendChild(iframe)
      return iframe
    }

    function isSupportUniversalLinks() {
      return parseInt(ua.os.version.major, 10) > 8 && ua.os.ios
    }

    /**
     * app.을 실행하거나 / store 페이지에 연결하여 준다.
     * @function
     * @param context {object} urlScheme, intentURI, storeURL, appName, onAppMissing, onUnsupportedEnvironment, willInvokeApp
     * @example daumtools.web2app({ urlScheme : 'daumapps://open', intentURI : '', storeURL: 'itms-app://...', appName: '다음앱' });
     */
    return web2app
  })()
})(
  (function () {
    if (typeof exports === 'object') {
      exports.daumtools = exports
      return exports
    } else if (typeof window === 'object') {
      window.daumtools = typeof window.daumtools === 'undefined' ? {} : window.daumtools
      return window.daumtools
    }
  })(),
)

var global =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof global !== 'undefined' && global)

var support = {
  searchParams: 'URLSearchParams' in global,
  iterable: 'Symbol' in global && 'iterator' in Symbol,
  blob:
    'FileReader' in global &&
    'Blob' in global &&
    (function () {
      try {
        new Blob()
        return true
      } catch (e) {
        return false
      }
    })(),
  formData: 'FormData' in global,
  arrayBuffer: 'ArrayBuffer' in global,
}

function isDataView(obj) {
  return obj && DataView.prototype.isPrototypeOf(obj)
}

if (support.arrayBuffer) {
  var viewClasses = [
    '[object Int8Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Int16Array]',
    '[object Uint16Array]',
    '[object Int32Array]',
    '[object Uint32Array]',
    '[object Float32Array]',
    '[object Float64Array]',
  ]

  var isArrayBufferView =
    ArrayBuffer.isView ||
    function (obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
}

function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name)
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
    throw new TypeError('Invalid character in header field name')
  }
  return name.toLowerCase()
}

function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value)
  }
  return value
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
  var iterator = {
    next: function () {
      var value = items.shift()
      return { done: value === undefined, value: value }
    },
  }

  if (support.iterable) {
    iterator[Symbol.iterator] = function () {
      return iterator
    }
  }

  return iterator
}

function Headers(headers) {
  this.map = {}

  if (headers instanceof Headers) {
    headers.forEach(function (value, name) {
      this.append(name, value)
    }, this)
  } else if (Array.isArray(headers)) {
    headers.forEach(function (header) {
      this.append(header[0], header[1])
    }, this)
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function (name) {
      this.append(name, headers[name])
    }, this)
  }
}

Headers.prototype.append = function (name, value) {
  name = normalizeName(name)
  value = normalizeValue(value)
  var oldValue = this.map[name]
  this.map[name] = oldValue ? oldValue + ', ' + value : value
}

Headers.prototype['delete'] = function (name) {
  delete this.map[normalizeName(name)]
}

Headers.prototype.get = function (name) {
  name = normalizeName(name)
  return this.has(name) ? this.map[name] : null
}

Headers.prototype.has = function (name) {
  return this.map.hasOwnProperty(normalizeName(name))
}

Headers.prototype.set = function (name, value) {
  this.map[normalizeName(name)] = normalizeValue(value)
}

Headers.prototype.forEach = function (callback, thisArg) {
  for (var name in this.map) {
    if (this.map.hasOwnProperty(name)) {
      callback.call(thisArg, this.map[name], name, this)
    }
  }
}

Headers.prototype.keys = function () {
  var items = []
  this.forEach(function (value, name) {
    items.push(name)
  })
  return iteratorFor(items)
}

Headers.prototype.values = function () {
  var items = []
  this.forEach(function (value) {
    items.push(value)
  })
  return iteratorFor(items)
}

Headers.prototype.entries = function () {
  var items = []
  this.forEach(function (value, name) {
    items.push([name, value])
  })
  return iteratorFor(items)
}

if (support.iterable) {
  Headers.prototype[Symbol.iterator] = Headers.prototype.entries
}

function consumed(body) {
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'))
  }
  body.bodyUsed = true
}

function fileReaderReady(reader) {
  return new Promise(function (resolve, reject) {
    reader.onload = function () {
      resolve(reader.result)
    }
    reader.onerror = function () {
      reject(reader.error)
    }
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsArrayBuffer(blob)
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsText(blob)
  return promise
}

function readArrayBufferAsText(buf) {
  var view = new Uint8Array(buf)
  var chars = new Array(view.length)

  for (var i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i])
  }
  return chars.join('')
}

function bufferClone(buf) {
  if (buf.slice) {
    return buf.slice(0)
  } else {
    var view = new Uint8Array(buf.byteLength)
    view.set(new Uint8Array(buf))
    return view.buffer
  }
}

function Body() {
  this.bodyUsed = false

  this._initBody = function (body) {
    /*
      fetch-mock wraps the Response object in an ES6 Proxy to
      provide useful test harness features such as flush. However, on
      ES5 browsers without fetch or Proxy support pollyfills must be used;
      the proxy-pollyfill is unable to proxy an attribute unless it exists
      on the object before the Proxy is created. This change ensures
      Response.bodyUsed exists on the instance, while maintaining the
      semantic of setting Request.bodyUsed in the constructor before
      _initBody is called.
    */
    this.bodyUsed = this.bodyUsed
    this._bodyInit = body
    if (!body) {
      this._bodyText = ''
    } else if (typeof body === 'string') {
      this._bodyText = body
    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
      this._bodyBlob = body
    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
      this._bodyFormData = body
    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
      this._bodyText = body.toString()
    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
      this._bodyArrayBuffer = bufferClone(body.buffer)
      // IE 10-11 can't handle a DataView body.
      this._bodyInit = new Blob([this._bodyArrayBuffer])
    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
      this._bodyArrayBuffer = bufferClone(body)
    } else {
      this._bodyText = body = Object.prototype.toString.call(body)
    }

    if (!this.headers.get('content-type')) {
      if (typeof body === 'string') {
        this.headers.set('content-type', 'text/plain;charset=UTF-8')
      } else if (this._bodyBlob && this._bodyBlob.type) {
        this.headers.set('content-type', this._bodyBlob.type)
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
      }
    }
  }

  if (support.blob) {
    this.blob = function () {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return Promise.resolve(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as blob')
      } else {
        return Promise.resolve(new Blob([this._bodyText]))
      }
    }

    this.arrayBuffer = function () {
      if (this._bodyArrayBuffer) {
        var isConsumed = consumed(this)
        if (isConsumed) {
          return isConsumed
        }
        if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
          return Promise.resolve(
            this._bodyArrayBuffer.buffer.slice(
              this._bodyArrayBuffer.byteOffset,
              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength,
            ),
          )
        } else {
          return Promise.resolve(this._bodyArrayBuffer)
        }
      } else {
        return this.blob().then(readBlobAsArrayBuffer)
      }
    }
  }

  this.text = function () {
    var rejected = consumed(this)
    if (rejected) {
      return rejected
    }

    if (this._bodyBlob) {
      return readBlobAsText(this._bodyBlob)
    } else if (this._bodyArrayBuffer) {
      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
    } else if (this._bodyFormData) {
      throw new Error('could not read FormData body as text')
    } else {
      return Promise.resolve(this._bodyText)
    }
  }

  if (support.formData) {
    this.formData = function () {
      return this.text().then(decode)
    }
  }

  this.json = function () {
    return this.text().then(JSON.parse)
  }

  return this
}

// HTTP methods whose capitalization should be normalized
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

function normalizeMethod(method) {
  var upcased = method.toUpperCase()
  return methods.indexOf(upcased) > -1 ? upcased : method
}

function Request(input, options) {
  if (!(this instanceof Request)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }

  options = options || {}
  var body = options.body

  if (input instanceof Request) {
    if (input.bodyUsed) {
      throw new TypeError('Already read')
    }
    this.url = input.url
    this.credentials = input.credentials
    if (!options.headers) {
      this.headers = new Headers(input.headers)
    }
    this.method = input.method
    this.mode = input.mode
    this.signal = input.signal
    if (!body && input._bodyInit != null) {
      body = input._bodyInit
      input.bodyUsed = true
    }
  } else {
    this.url = String(input)
  }

  this.credentials = options.credentials || this.credentials || 'same-origin'
  if (options.headers || !this.headers) {
    this.headers = new Headers(options.headers)
  }
  this.method = normalizeMethod(options.method || this.method || 'GET')
  this.mode = options.mode || this.mode || null
  this.signal = options.signal || this.signal
  this.referrer = null

  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
    throw new TypeError('Body not allowed for GET or HEAD requests')
  }
  this._initBody(body)

  if (this.method === 'GET' || this.method === 'HEAD') {
    if (options.cache === 'no-store' || options.cache === 'no-cache') {
      // Search for a '_' parameter in the query string
      var reParamSearch = /([?&])_=[^&]*/
      if (reParamSearch.test(this.url)) {
        // If it already exists then set the value with the current time
        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime())
      } else {
        // Otherwise add a new '_' parameter to the end with the current time
        var reQueryString = /\?/
        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime()
      }
    }
  }
}

Request.prototype.clone = function () {
  return new Request(this, { body: this._bodyInit })
}

function decode(body) {
  var form = new FormData()
  body
    .trim()
    .split('&')
    .forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
  return form
}

function parseHeaders(rawHeaders) {
  var headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
  preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
    var parts = line.split(':')
    var key = parts.shift().trim()
    if (key) {
      var value = parts.join(':').trim()
      headers.append(key, value)
    }
  })
  return headers
}

Body.call(Request.prototype)

function Response(bodyInit, options) {
  if (!(this instanceof Response)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }
  if (!options) {
    options = {}
  }

  this.type = 'default'
  this.status = options.status === undefined ? 200 : options.status
  this.ok = this.status >= 200 && this.status < 300
  this.statusText = 'statusText' in options ? options.statusText : ''
  this.headers = new Headers(options.headers)
  this.url = options.url || ''
  this._initBody(bodyInit)
}

Body.call(Response.prototype)

Response.prototype.clone = function () {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers(this.headers),
    url: this.url,
  })
}

Response.error = function () {
  var response = new Response(null, { status: 0, statusText: '' })
  response.type = 'error'
  return response
}

var redirectStatuses = [301, 302, 303, 307, 308]

Response.redirect = function (url, status) {
  if (redirectStatuses.indexOf(status) === -1) {
    throw new RangeError('Invalid status code')
  }

  return new Response(null, { status: status, headers: { location: url } })
}

var DOMException = global.DOMException
try {
  new DOMException()
} catch (err) {
  DOMException = function (message, name) {
    this.message = message
    this.name = name
    var error = Error(message)
    this.stack = error.stack
  }
  DOMException.prototype = Object.create(Error.prototype)
  DOMException.prototype.constructor = DOMException
}

function fetch$1(input, init) {
  return new Promise(function (resolve, reject) {
    var request = new Request(input, init)

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    var xhr = new XMLHttpRequest()

    function abortXhr() {
      xhr.abort()
    }

    xhr.onload = function () {
      var options = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
      }
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
      var body = 'response' in xhr ? xhr.response : xhr.responseText
      setTimeout(function () {
        resolve(new Response(body, options))
      }, 0)
    }

    xhr.onerror = function () {
      setTimeout(function () {
        reject(new TypeError('Network request failed'))
      }, 0)
    }

    xhr.ontimeout = function () {
      setTimeout(function () {
        reject(new TypeError('Network request failed'))
      }, 0)
    }

    xhr.onabort = function () {
      setTimeout(function () {
        reject(new DOMException('Aborted', 'AbortError'))
      }, 0)
    }

    function fixUrl(url) {
      try {
        return url === '' && global.location.href ? global.location.href : url
      } catch (e) {
        return url
      }
    }

    xhr.open(request.method, fixUrl(request.url), true)

    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }

    if ('responseType' in xhr) {
      if (support.blob) {
        xhr.responseType = 'blob'
      } else if (
        support.arrayBuffer &&
        request.headers.get('Content-Type') &&
        request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
      ) {
        xhr.responseType = 'arraybuffer'
      }
    }

    if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
      Object.getOwnPropertyNames(init.headers).forEach(function (name) {
        xhr.setRequestHeader(name, normalizeValue(init.headers[name]))
      })
    } else {
      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value)
      })
    }

    if (request.signal) {
      request.signal.addEventListener('abort', abortXhr)

      xhr.onreadystatechange = function () {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', abortXhr)
        }
      }
    }

    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
  })
}

fetch$1.polyfill = true

if (!global.fetch) {
  global.fetch = fetch$1
  global.Headers = Headers
  global.Request = Request
  global.Response = Response
}

const { web2app, userAgent } = exports

const {
  SERVER_URL,
  A2A_URL_SCHEME,
  KAKAO_INTENT_SCHEME,
  KLIP_APP_INTENT_SCHEME,
  IOS_KAKAO_APP_STORE_LINK,
  AOS_KAKAO_APP_STORE_LINK,
  IOS_KLIP_APP_STORE_LINK,
  AOS_KLIP_APP_STORE_LINK,
  KAKAOTALK_PACKAGE_NAME,
  KLIP_APP_PACKAGE_NAME,
  KAKAO_APP_NAME,
  KLIP_APP_NAME,
} = {
  SERVER_URL: 'https://a2a-api.klipwallet.com/v2/a2a',
  A2A_URL_SCHEME: 'klipwallet/open?url=https://klipwallet.com/?target=/a2a',
  KAKAO_INTENT_SCHEME: 'kakaotalk',
  KLIP_APP_INTENT_SCHEME: 'klip',
  IOS_KAKAO_APP_STORE_LINK: 'itms-apps://itunes.apple.com/app/id362057947',
  AOS_KAKAO_APP_STORE_LINK: 'market://details?id=com.kakao.talk',
  IOS_KLIP_APP_STORE_LINK: 'itms-apps://itunes.apple.com/app/id1627665524',
  AOS_KLIP_APP_STORE_LINK: 'market://details?id=com.klipwallet.app',
  KAKAOTALK_PACKAGE_NAME: 'com.kakao.talk',
  KLIP_APP_PACKAGE_NAME: 'com.klipwallet.app',
  KAKAO_APP_NAME: '카카오톡',
  KLIP_APP_NAME: '클립',
}

const prepare = {
  auth: ({ bappName, successLink, failLink }) => {
    return fetch(`${SERVER_URL}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bapp: {
          name: bappName,
          callback: {
            success: successLink,
            fail: failLink,
          },
        },
        type: 'auth',
      }),
    }).then((res) => res.json())
  },
  sendKLAY: ({ bappName, from, to, amount, successLink, failLink }) => {
    return fetch(`${SERVER_URL}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bapp: {
          name: bappName,
          callback: {
            success: successLink,
            fail: failLink,
          },
        },
        type: 'send_klay',
        transaction: {
          from: from,
          to: to,
          amount: amount,
        },
      }),
    }).then((res) => res.json())
  },
  sendToken: ({ bappName, from, to, amount, contract, successLink, failLink }) => {
    return fetch(`${SERVER_URL}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bapp: {
          name: bappName,
          callback: {
            success: successLink,
            fail: failLink,
          },
        },
        type: 'send_token',
        transaction: {
          from: from,
          to: to,
          amount: amount,
          contract: contract,
        },
      }),
    }).then((res) => res.json())
  },
  sendCard: ({ bappName, from, to, id, contract, successLink, failLink }) => {
    return fetch(`${SERVER_URL}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bapp: {
          name: bappName,
          callback: {
            success: successLink,
            fail: failLink,
          },
        },
        type: 'send_card',
        transaction: {
          from: from,
          to: to,
          card_id: id,
          contract: contract,
        },
      }),
    }).then((res) => res.json())
  },
  executeContract: ({ bappName, from, to, value, abi, params, successLink, failLink }) => {
    return fetch(`${SERVER_URL}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bapp: {
          name: bappName,
          callback: {
            success: successLink,
            fail: failLink,
          },
        },
        type: 'execute_contract',
        transaction: {
          from: from,
          to: to,
          value: value,
          abi: abi,
          params: params,
        },
      }),
    }).then((res) => res.json())
  },
  signMessage: ({ bappName, value, from, successLink, failLink }) => {
    return fetch(`${SERVER_URL}/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bapp: {
          name: bappName,
          callback: {
            success: successLink,
            fail: failLink,
          },
        },
        type: 'sign_message',
        message: {
          value: value,
          from: from,
        },
      }),
    }).then((res) => res.json())
  },
}

const request = (requestKey, onUnsupportedEnvironment, isKlipAppCall = false) => {
  const ua = userAgent()

  // Android에서는 alphatalk 스킴 사용에 제약이 있어 kakaotalk 스킴 사용
  // kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key={request_key}
  // intent://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key={request_key}#Intent;scheme=kakaotalk;package=com.kakao.talk;end
  let urlScheme = `${ua.os.android ? 'kakaotalk' : KAKAO_INTENT_SCHEME}://${A2A_URL_SCHEME}?request_key=${requestKey}`
  let appStoreURL = ua.os.android ? AOS_KAKAO_APP_STORE_LINK : IOS_KAKAO_APP_STORE_LINK
  let appName = KAKAO_APP_NAME
  let intentURI = `intent://${A2A_URL_SCHEME}?request_key=${requestKey}#Intent;scheme=${
    ua.os.android ? 'kakaotalk' : KAKAO_INTENT_SCHEME
  };package=${KAKAOTALK_PACKAGE_NAME};end;`

  // Klip App 실행 요청 시
  // klip://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key={request_key}
  // intent://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key={request_key}#Intent;scheme=klip;package=com.klipwallet.app;end;
  if (isKlipAppCall) {
    urlScheme = `${KLIP_APP_INTENT_SCHEME}://${A2A_URL_SCHEME}?request_key=${requestKey}`
    appStoreURL = ua.os.android ? AOS_KLIP_APP_STORE_LINK : IOS_KLIP_APP_STORE_LINK
    appName = KLIP_APP_NAME
    intentURI = `intent://${A2A_URL_SCHEME}?request_key=${requestKey}#Intent;scheme=${KLIP_APP_INTENT_SCHEME};package=${KLIP_APP_PACKAGE_NAME};end;`
  }

  const useUrlScheme = ua.browser.chrome && +ua.browser.version.major >= 25 ? false : true

  web2app({
    urlScheme,
    useUrlScheme,
    intentURI, // Chrome for Android, versions 25 이후부터 intent 형식만 사용할 수 있음
    storeURL: appStoreURL,
    appName,
    onUnsupportedEnvironment: () => {
      unsupportedEnvironmentAlert(onUnsupportedEnvironment)
    },
    onAppMissing: isKlipAppCall
      ? () =>
          web2app({
            urlScheme: `${
              ua.os.android ? 'kakaotalk' : KAKAO_INTENT_SCHEME
            }://${A2A_URL_SCHEME}?request_key=${requestKey}`,
            useUrlScheme,
            intentURI: `intent://${A2A_URL_SCHEME}?request_key=${requestKey}#Intent;scheme=${
              ua.os.android ? 'kakaotalk' : KAKAO_INTENT_SCHEME
            };package=${KAKAOTALK_PACKAGE_NAME};end;`,
            storeURL: appStoreURL,
            appName: KAKAO_APP_NAME,
            onUnsupportedEnvironment: () => {
              unsupportedEnvironmentAlert(onUnsupportedEnvironment)
            },
          })
      : null,
  })
}

const unsupportedEnvironmentAlert = (onUnsupportedEnvironment) => {
  if (onUnsupportedEnvironment) {
    onUnsupportedEnvironment()
  } else {
    alert('모바일 기기에서만 이용 가능한 기능입니다.')
  }
}

const getResult = (requestKey) => {
  return fetch(`${SERVER_URL}/result?request_key=${requestKey}`, {
    method: 'GET',
  }).then((res) => res.json())
}

const getCardList = ({ contract, eoa, cursor }) => {
  return fetch(`${SERVER_URL}/cards?sca=${contract}&eoa=${eoa}&cursor=${cursor}`, {
    method: 'GET',
  }).then((res) => res.json())
}

exports.getCardList = getCardList
exports.getResult = getResult
exports.prepare = prepare
exports.request = request

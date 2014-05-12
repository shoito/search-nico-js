niconico API Client Library for JavaScript - **unofficial**
======================

[search-nico-js](https://github.com/shoito/search-nico-js) aims to provide a complete, asynchronous client library for the niconico Search API.

For API details and how to use promises, see the [JavaScript Promises](http://www.html5rocks.com/en/tutorials/es6/promises/).

search-nico-js is an **unofficial** library.

## niconico
niconico - http://www.nicovideo.jp/

## Requirements

Support Promises

[Can I use Promises?](http://caniuse.com/promises)

### Browser

Use a polyfill script tag:

    <script src="https://www.promisejs.org/polyfills/promise-4.0.0.js"></script>

The global variable Promise becomes available after the above script tag.

## Installation

### Node.js

    npm install search-nico-js --save

### Browser

    bower install search-nico-js --save

or clone the repository or just copy the files `search-nico.js` or `search-nico.min.js` to your server.

and then include it in your pages with `<script src="search-nico.min.js"></script>`

## Examples
- [search-nico-js/example/client.js](./example/client.js)

## See also

- [niconico](http://www.nicovideo.jp)
- [HTML5 Japan Cup向け提供APIガイド](http://search.nicovideo.jp/docs/api/html5jc.html)
- [JavaScript Promises: There and Back Again](http://www.html5rocks.com/en/tutorials/es6/promises/)
- [Promise](https://www.promisejs.org/)

## License
MIT License - http://opensource.org/licenses/MIT

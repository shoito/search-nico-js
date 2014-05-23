// MIT License
//
// Setup
// npm install search-nico-js --save
var Promise = require('promise'),
    SearchNico = require('search-nico-js');
    // SearchNico = require('../search-nico.js');

var cs = SearchNico.contents({
    'issuer': 'search-nico-js',
    'reason': 'html5jc'
});

var csPromise = cs.service('video')
                .keyword('hoge')
                .target(['title','description','tags'])
                .filter([
                    cs.equalFilter('ppv_type', 'free'),
                    cs.rangeFilter('view_counter', '100', '1000', true, false)
                ])
                .sort('view_counter', 'asc')
                .select(['cmsid','title','description','view_counter','mylist_counter'])
                .from(0)
                .size(5)
                .fetch();

csPromise.then(function(result) {
    console.log(result);
}, function(err) {
    console.error(err);
});


var ts = SearchNico.tags({
    'issuer': 'search-nico-js',
    'reason': 'html5jc'
});

var tsPromise = ts.service('video')
                .keyword('fuga')
                .from(0)
                .size(3)
                .fetch();

tsPromise.then(function(result) {
    console.log(result);
}, function(err) {
    console.error(err);
});

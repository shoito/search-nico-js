'use strict';

/**
 * @fileoverview search-nico-js aims to provide a complete, asynchronous client library for the api.search.nicovideo.jp.
 *   For API details and how to use promises, see the JavaScript Promises articles.
 * @author shoito
 */

if (typeof window === 'undefined') {
    var Promise = Promise || require('promise');
    var XMLHttpRequest = XMLHttpRequest || require('xmlhttprequest').XMLHttpRequest;
}

(function() {
    function httpStatus(apiStatus) {
        var statusMap = {
            200: {'status': 200, 'text': 'OK'},
            300: {'status': 400, 'text': 'Bad Request'},
            101: {'status': 503, 'text': 'Service Unavailable'},
            1001: {'status': 504, 'text': 'Gateway Timeout'}
        };
        return statusMap[apiStatus] || {'status': 500, 'text': 'Internal Server Error'};
    }

    var ApiRequest = (function() {
        var ApiRequest = {};
        ApiRequest.BASE_URL = 'http://api.search.nicovideo.jp';

        ApiRequest.post = function(url, params, parseFunc) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        var response = parseFunc(xhr.responseText);
                        if (response.status === 200) {
                            resolve(response);
                        } else {
                            reject({'status': response.status, 'error': response.statusText, 'error_description': 'An error has occurred while requesting api'});
                        }
                    } else {
                        reject({'status': xhr.status, 'error': xhr.statusText, 'error_description': 'An error has occurred while requesting api'});
                    }
                };
                xhr.onerror = reject;

                xhr.open('POST', ApiRequest.BASE_URL + url);
                xhr.timeout = params.timeout;
                xhr.send(JSON.stringify(params));
            });
        };

        return ApiRequest;
    })();


    var ContentsSearchRequest = (function() {
        var query = {
              'query':'keyword',
              'service':['video'],
              'search':['title'],
              'join':['cmsid'],
              'filters':[],
              'from':0,
              'size':10,
              'sort_by':'view_counter'
            };

        /**
         * コンテンツ検索リクエストのコンストラクタ
         * @class ContentsSearchRequest
         * @classdesc コンテンツ検索リクエスト
         * @memberOf SearchNico
         */
        function ContentsSearchRequest(options) {
            options = options || {};
            if (typeof options.issuer === 'undefined' ||
                typeof options.reason === 'undefined') {
                throw new Error('issuer and reason parameters is required.');
            }

            query.timeout = options.timeout || 3000;
            query.issuer = options.issuer;
            query.reason = options.reason;
        }

        function parse(rawResponse) {
            var response = {};
            response.status = httpStatus(200).status;
            rawResponse.split('\n').forEach(function(rawChunk) {
                if (rawChunk === '') {
                    return;
                }

                var chunk = JSON.parse(rawChunk);
                if (chunk.type === 'stats' && chunk.values) {
                    response.hits = chunk.values[0].total;
                } else if (chunk.type === 'hits' && chunk.values) {
                    response.values = chunk.values.map(function(content) {
                        delete content._rowid;
                        return content;
                    });
                } else if (chunk.errid) {
                    var http = httpStatus(chunk.errid);
                    response.status = http.status;
                    response.statusText = http.text;
                }
            });

            if (typeof response.hits === 'undefined') {
                response.hits = 0;
                response.values = [];
            }
            return response;
        }

        /**
         * equalフィルタオブジェクトを生成する
         * @memberof SearchNico.ContentsSearchRequest
         * @method equalFilter
         * @instance
         * @param {String} field - フィルタ対象フィールド
         * @param {String/Number} value - フィルタ対象の値
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.equalFilter = function(field, value) {
            return {'type': 'equal', 'field': field, 'value': value};
        };

        /**
         * rangeフィルタオブジェクトを生成する
         * @memberof SearchNico.ContentsSearchRequest
         * @method rangeFilter
         * @instance
         * @param {String} field - フィルタ対象フィールド
         * @param {String/Number} from - 開始値
         * @param {String/Number} to - 終了値
         * @param {Boolean} includeUpper - 上限値を含むかどうか
         * @param {Boolean} includeLower - 下限値を含むかどうか
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.rangeFilter = function(field, from, to, includeUpper, includeLower) {
            var filter = {'type': 'range', 'field': field, 'include_upper': true, 'include_lower': true};
            if (typeof from !== 'undefined') {
                filter.from = from;
            }
            if (typeof to !== 'undefined') {
                filter.to = to;
            }
            if (typeof includeUpper !== 'undefined') {
                filter.include_upper = includeUpper;
            }
            if (typeof includeLower !== 'undefined') {
                filter.include_lower = includeLower;
            }
            return filter;
        };

        /**
         * 検索対象サービスを設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method service
         * @instance
         * @param {String} name - 検索対象サービス
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.service = function(name) {
            query.service = [name];
            return this;
        };

        /**
         * 検索キーワードを設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method keyword
         * @instance
         * @param {String} keyword - 検索キーワード
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.keyword = function(keyword) {
            query.query = keyword;
            return this;
        };

        /**
         * 検索対象となるフィールドを設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method target
         * @instance
         * @param {Array} names - 検索対象フィールドリスト
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.target = function(names) {
            query.search = names;
            return this;
        };

        /**
         * フィルタ条件を設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method filter
         * @instance
         * @param {Array} filters - フィルタ条件リスト
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.filter = function(filters) {
            query.filters = filters;
            return this;
        };

        /**
         * ソート条件を設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method sort
         * @instance
         * @param {String} name - ソート条件となるフィールド
         * @param {String} [order=desc] - asc/desc (昇順/降順)
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.sort = function(name, order) {
            query.sort_by = name;
            query.order = order || 'desc';
            return this;
        };

        /**
         * 検索結果に含めるフィールドを設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method select
         * @instance
         * @param {Array} names - 取得対象のフィールドリスト
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.select = function(names) {
            query.join = names;
            return this;
        };

        /**
         * 検索結果の取得開始位置を設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method from
         * @instance
         * @param {Number} from - 検索結果の取得開始位置
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.from = function(from) {
            query.from = from;
            return this;
        };

        /**
         * 検索結果の取得件数を設定する
         * @memberof SearchNico.ContentsSearchRequest
         * @method size
         * @instance
         * @param {Number} size - コンテンツ検索結果の取得件数
         * @return {ContentsSearchRequest} コンテンツ検索リクエストインスタンス
         */
        ContentsSearchRequest.prototype.size = function(size) {
            query.size = size;
            return this;
        };

        /**
         * 検索リクエストのプロミスオブジェクトを取得する
         * @memberof SearchNico.ContentsSearchRequest
         * @method fetch
         * @instance
         * @return {Promise} プロミスオブジェクト - resolve/reject関数がプロミスの成功または失敗に応じて呼ばれる
         */
        ContentsSearchRequest.prototype.fetch = function() {
            return ApiRequest.post('/api/', query, parse);
        };

        return ContentsSearchRequest;
    })();


    var TagsSearchRequest = (function() {
        var query = {
              'query':'keyword',
              'service':['video'],
              'from':0,
              'size':10
            };

        /**
         * 関連タグ検索リクエストのコンストラクタ
         * @class TagsSearchRequest
         * @classdesc 関連タグ検索リクエスト
         * @memberof SearchNico
         */
        function TagsSearchRequest(options) {
            options = options || {};
            if (typeof options.issuer === 'undefined' ||
                typeof options.reason === 'undefined') {
                throw new Error('issuer and reason parameters is required.');
            }

            query.timeout = options.timeout || 3000;
            query.issuer = options.issuer;
            query.reason = options.reason;
        }

        function parse(rawResponse) {
            var response = {};
            response.status = httpStatus(200).status;
            rawResponse.split('\n').forEach(function(rawChunk) {
                if (rawChunk === '') {
                    return;
                }

                var chunk = JSON.parse(rawChunk);
                if (chunk.type === 'tags' && chunk.values) {
                    response.values = chunk.values.map(function(value) {
                        return value.tag;
                    });
                } else if (chunk.errid) {
                    var http = httpStatus(chunk.errid);
                    response.status = http.status;
                    response.statusText = http.text;
                }
            });

            if (typeof response.values === 'undefined') {
                response.values = [];
            }
            return response;
        }

        /**
         * 検索対象サービスを設定する
         * @memberof SearchNico.TagsSearchRequest
         * @method service
         * @instance
         * @param {String} name - 関連タグの検索対象サービス
         * @return {TagsSearchRequest} 関連タグ検索リクエストインスタンス
         */
        TagsSearchRequest.prototype.service = function(name) {
            query.service = ['tag_' + name];
            return this;
        };

        /**
         * 検索キーワードを設定する
         * @memberof SearchNico.TagsSearchRequest
         * @method keyword
         * @instance
         * @param {String} keyword - 関連タグの検索キーワード
         * @return {TagsSearchRequest} 関連タグ検索リクエストインスタンス
         */
        TagsSearchRequest.prototype.keyword = function(keyword) {
            query.query = keyword;
            return this;
        };

        /**
         * 検索結果の取得開始位置を設定する
         * @memberof SearchNico.TagsSearchRequest
         * @method from
         * @instance
         * @param {Number} from - 検索結果の取得開始位置
         * @return {TagsSearchRequest} 関連タグ検索リクエストインスタンス
         */
        TagsSearchRequest.prototype.from = function(from) {
            query.from = from;
            return this;
        };

        /**
         * 検索結果の取得件数を設定する
         * @memberof SearchNico.TagsSearchRequest
         * @method size
         * @instance
         * @param {Number} size - 関連タグの検索結果の取得件数
         * @return {TagsSearchRequest} 関連タグ検索リクエストインスタンス
         */
        TagsSearchRequest.prototype.size = function(size) {
            query.size = size;
            return this;
        };

        /**
         * 検索リクエストのプロミスオブジェクトを取得する
         * @memberof SearchNico.TagsSearchRequest
         * @method fetch
         * @instance
         * @return {Promise} プロミスオブジェクト - resolve/reject関数がプロミスの成功または失敗に応じて呼ばれる
         */
        TagsSearchRequest.prototype.fetch = function() {
            return ApiRequest.post('/api/tag/', query, parse);
        };

        return TagsSearchRequest;
    })();


    /**
     * niconico検索APIクライアント
     * @namespace
     * @name SearchNico
     */
    var SearchNico = {};

    /**
     * コンテンツ検索リクエストのインスタンスを取得する
     * @memberof SearchNico
     * @method
     * @param {Object} [options] - APIパラメーター
     * @param {String} [options.issuer] - サービス/アプリケーション名
     * @param {String} [options.reason=html5jc] - コンテスト/イベント名
     * @param {Number} [options.tiemout=3000] - timeout(ms)
     * @see {@link http://search.nicovideo.jp/docs/api/html5jc.html}
     */
    SearchNico.contents = function(options) {
        return new ContentsSearchRequest(options);
    };

    /**
     * 関連タグ検索リクエストのインスタンスを取得する
     * @memberof SearchNico
     * @method
     * @param {Object} [options] - APIパラメーター
     * @param {String} [options.issuer] - サービス/アプリケーション名
     * @param {String} [options.reason=html5jc] - コンテスト/イベント名
     * @param {Number} [options.tiemout=3000] - timeout(ms)
     * @see {@link http://search.nicovideo.jp/docs/api/html5jc.html}
     */
    SearchNico.tags = function(options) {
        return new TagsSearchRequest(options);
    };


    if (typeof module !== 'undefined') {
        module.exports = SearchNico;
    } else {
        // <script src='https://www.promisejs.org/polyfills/promise-4.0.0.js'></script>
        this.SearchNico = SearchNico;
    }
}).call(this);

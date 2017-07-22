"use strict";
const Get = require('simple-get');
const Querystring = require('querystring');
const Lie = require('lie');
const debug = require('debug')('boxpihal:api-client');

const TIMEOUT_MAX_MS     = 60*1000; // maximum timeout
const MAX_API_VERSION = 1;
const MIN_API_VERSION = 1;
const URI_BASE        = '';

const INCLUDE_VERSION_HEADERS = false;

class bxpApiClient {
	constructor(bxp, api_req_token) {
		this.host     = bxp.config.api_host;
		this.protocol = bxp.config.api_host_secure ? 'https' : 'http';

		this.timeout  = bxp.config.api_timeout ? parseInt(bxp.config.api_timeout) : TIMEOUT_MAX_MS;

		this.api_req_token = api_req_token ? api_req_token : null;
	}

	requestGet(url) {
		debug("API GET => %s", url);
		var r = new Lie((resolve, reject) => {
			Get.concat({
				'method': 'GET',
				'url': url,
				'headers': this.generateStandardHeaders(),
				'timeout': TIMEOUT_MAX_MS
			}, (err, res, data) => {
				if (err) {
					reject(err);
				} else {
					debug("API GET Status %d", res.statusCode);
					resolve({ http_code: res.statusCode, response: res, data: data.toString('utf8') });
				}
			});
		});

		return r;
	}

	requestPost(url, body) {
		debug("API POST => %s \nBODY: %j", url, body);
		if (! body) body = {};

		var r = new Lie((resolve, reject) => {
			Get.concat({
				'method': 'POST',
				'url': url,
				'body': body,
				'json': true,
				'headers': this.generateStandardHeaders(),
				'timeout': TIMEOUT_MAX_MS
			}, (err, res, data) => {
				if (err) {
					reject(err);
				} else {
					resolve({ http_code: res.statusCode, response: res, data: data.toString('utf8') });
				}
			});
		});

		return r;
	}	

	generateRequestUrl() {
		var paths;
		if (arguments.length == 0) {
			paths = [ '' ];
		} else if (arguments.length > 1) {
			paths = Array.prototype.slice.apply(arguments);
		} else {
			paths = [ paths ];
		}

		var qs = null;
		if (typeof paths[ paths.length - 1 ] == 'object') {
			var params = paths.pop();
			qs = Querystring.stringify(params);
		}

		var path = paths.join("/");
		path = path.replace(/^\//, '');

		var url = `${this.protocol}://${this.host}${URI_BASE}/${path}`;

		if (qs != null) {
			url += "?" + qs;
		}

		return url;
	}

	generateStandardHeaders(custom) {
		var h = {
			'user-agent': this.userAgent(),
			'x-api-minversion': MIN_API_VERSION,
			'x-api-maxversion': MAX_API_VERSION			
		};

		if (this.api_req_token) h['x-api-token'] = this.api_req_token;

		if (! INCLUDE_VERSION_HEADERS) {
			delete h['x-api-minversion'];
			delete h['x-api-maxversion'];
		}

		if (custom) {
			h = Object.assign({}, h, custom);
		}

		return h;
	}

	userAgent() {
		var sw_version = require('../package.json').version;
		return `BoxPiClient/${sw_version} (https://boxtie.io/)`;
	}
}

module.exports = bxpApiClient;
var assert = require('simple-assert');
var test_util = require('./util/test_util');

describe("Baseline Tests", () => {
	it("Our assertion lib works", () => {
		assert(true);
	});

	it("Our shell test util works", () => {
		var ret = test_util.shellCmd('echo hello');
		assert(typeof ret === 'string');
		assert(ret.length > 0);
		assert(ret.trim() === 'hello', 'string is not exactly "hello": ' + ret);
	});
});
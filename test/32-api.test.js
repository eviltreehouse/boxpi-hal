const BoxpiHAL = require('../index');
const assert   = require('simple-assert');
const test_util = require('./util/test_util');

describe("BXP API Client Tests", function() {
	var bxp;

	before(() => {
		var config = test_util.onRaspbian() ? {} : require('./fixtures/config_osx');
		
		config.api_host = "boxtie.io"; // @fixme
		config.api_host_secure = false;
		bxp = new BoxpiHAL(config);
	});

	it("Non-authorized GET", function(done) {
		this.timeout = 7000;

		try {
			assert(test_util.isDefinedObject(bxp.api_client));

			bxp.api_client.requestGet( bxp.api_client.generateRequestUrl() ).then((r) => {
				try {
					assert(r.http_code == 200, 'HTTP Code was not 200 ' + r.http_code);
					assert(typeof r.data === 'string', 'data is not a string ' + typeof(r.data));
					assert(r.data.length > 0);

					done();
				} catch (e) {
					done(e);
				}
			}, done).catch(done);
		} catch(e) {
			done(e);
		}
	});

	it("Non-authorized GET - 404", function(done) {
		this.timeout = 7000;

		assert(test_util.isDefinedObject(bxp.api_client));

		bxp.api_client.requestGet( bxp.api_client.generateRequestUrl('non-existent', 'url') ).then((r) => {
			try {
				assert(r.http_code == 404, 'HTTP Code was not 404 ' + r.http_code);

				done();
			} catch (e) {
				done(e);
			}
		}, done).catch(done);
	});	

	it("Bad Host Failure", function(done) {
		this.timeout = 7000;

		assert(test_util.isDefinedObject(bxp.api_client));
		bxp.api_client.timeout = 5000; // shrink timeout window so we don't wait forever

		bxp.api_client.host = 'bad-host.boxtie-.io';

		bxp.api_client.requestGet( bxp.api_client.generateRequestUrl('non-existent', 'url') ).then((r) => {
			done("Response handler should not have resolved.");
		}, () => { done(); });
	});		
});
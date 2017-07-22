const BoxpiHAL = require('../index');
const test_util = require('./util/test_util');

const assert   = require('simple-assert');

describe("BXP HID Input Tests", function() {

    describe("OS X Tests [virtual]", function() {
        var osx_config = require('./fixtures/config_osx');
        var bxp;

        before(function() {
			if (test_util.onRaspbian()) return this.skip();
			bxp = new BoxpiHAL(osx_config);
        });

		it("We can fake a barcode scan", (done) => {
			const UID = '4111606054549119';
			var vs = bxp.inputHandler().getVirtualScanner();
			assert(test_util.isDefinedObject(vs));
			
			vs.scanUid(UID);
			setTimeout(function() {
				assert(bxp.getLastInput() == UID, 'Last input wasnt as expected: "' + bxp.getLastInput() + '"');

				done();
			}, 1000);
		});

		it("We can handle barcodes with wierd chars", (done) => {
			const UID = '583723^{X}}41';
			const EXP_UID = "583723  X  41";
			var vs = bxp.inputHandler().getVirtualScanner();
			assert(test_util.isDefinedObject(vs));
			
			vs.scanUid(UID);
			setTimeout(function() {
				assert(bxp.getLastInput() == EXP_UID, 'Last input wasnt as expected: "' + bxp.getLastInput() + '"');

				done();
			}, 1000);
		});
    });

    describe("Raspi Tests", function() {
        before(function() {
            if (! test_util.onRaspbian()) this.skip();
        });        
    });
});
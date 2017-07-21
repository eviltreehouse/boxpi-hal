const BoxpiHAL = require('../index');
const assert   = require('simple-assert');
const test_util = require('./util/test_util');

describe("BXP Core Tests", function() {

    describe("OS X Tests [limited]", function() {
        var osx_config = {
            'enable_hid': false,
            'enable_rfid': false,
            'enable_display': false
        };

        before(function() {
            if (test_util.onRaspbian()) this.skip();
        });

        it("We can instance the Boxpi core", () => {
            var bxp = new BoxpiHAL(osx_config);

            assert(typeof bxp === 'object');
            assert(bxp instanceof BoxpiHAL);
        });

    });

    describe("Raspi Tests", function() {
        before(function() {
            if (! test_util.onRaspbian()) this.skip();
        });        
    });
});
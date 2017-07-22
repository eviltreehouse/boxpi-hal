var assert = require('simple-assert');
var test_util = require('./util/test_util');

describe("PI Hardware Bus Tests", function() {

    before('ensureRaspiPlatform', function(){
        if (! test_util.onRaspbian()) this.skip();
    });

    // it("This shouldnt run on OS X", () => {
    //     assert(false);
    // });

    it("Confirm I2C support");
    it("Confirm SPI support");
    it("Confirm HID support");
});
const BoxpiHAL = require('../index');
const assert   = require('simple-assert');
const test_util = require('./util/test_util');

describe("BXP Core Tests", function() {

    describe("OS X Tests [limited scope]", function() {
        var osx_config = require('./fixtures/config_osx');
        var bxp;

        before(function() {
            if (test_util.onRaspbian()) this.skip();
        });

        it("We can instance the Boxpi core", () => {
            bxp = new BoxpiHAL(osx_config);

            assert(typeof bxp === 'object');
            assert(bxp instanceof BoxpiHAL);
        });

        it("Our input handler exists", () => {
            assert(bxp instanceof BoxpiHAL);
            assert(test_util.isDefinedObject(bxp.input));
        });

        it("Our input handler has a virtual HID device", () => {
            assert(bxp.input.virtual);
        });
    });

    describe("Raspi Tests", function() {
        before(function() {
            if (! test_util.onRaspbian()) this.skip();
        });        
    });
});
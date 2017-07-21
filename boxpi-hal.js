"use strict";

const bxpInputHandler = require('./input-handler');

class BoxpiHAL {
    constructor(opt) {
        this.config = require('./config')(opt);
        this.init();
    }

    init() {
        if (this.config.enable_display) this.enableDisplay();
        if (this.config.enable_hid || this.config.enable_rfid) this.enableInput();
    }

    enableDisplay() {

    }

    enableInput() {
        this.input = new bxpInputHandler(this);
    }
}



module.exports = BoxpiHAL;
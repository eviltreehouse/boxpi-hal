"use strict";
const debug = require('debug')('boxpihal:core');

const bxpInputHandler = require('./input-handler');
const bxpOledDisplay  = require('./oled-display');
const bxpApiClient    = require('./api/client');

class BoxpiHAL {
    constructor(opt) {
        debug("Debug ON");
        this.config = require('./config')(opt);
        debug("BoxpiHAL config: %j", this.config);

        this.input = null;
        this.last_input = null;

        this.display = null;

        this.api_client = null;

        this.init();

    }

    init() {
        this.enableInput();
        if (this.config.enable_display) this.enableDisplay();

        this.initApiClient();
    }

    initApiClient() {
        this.api_client = new bxpApiClient(this);
    }

    inputHandler() {
        return this.input;
    }

    getLastInput() {
        return this.last_input;
    }

    enableDisplay() {
        this.display = new bxpOledDisplay(this);
    }

    enableInput() {
        this.input = new bxpInputHandler(this, (inp) => {
            this.last_input = inp;
        });
    }
}



module.exports = BoxpiHAL;
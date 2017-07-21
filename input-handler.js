"use strict";
const debug = require('debug')('boxpihal:input-handler');

const MAX_INPUT_BUFFER = 0x400; // 1024 bytes maximum
const INPUT_WINDOW_MS  = 500;   // 0.5 sec to finish a stream

class bxpInputHandler {
    constructor(bxp, handler) {
        this.hid =  bxp.config.enable_hid === true;
        this.rfid = bxp.config.enable_rfid === true;

        this.last_src      = null;
        this.input_timeout = null;
        this.input_complete = false;

        this.input_buffer = Buffer.alloc(MAX_INPUT_BUFFER, null);
        this.bp = 0x0;

        this.handler = handler;

        this._rc522    = null;
        this._hid_devs = [];

        this.init();
    }

    init() {
        if (this.hid) {
            debug("Initializing HID");
            var HID = require('node-hid');
            var hid_devices = HID.devices();

            // @todo -- find valid devices to link to and set up listeners
        }

        if (this.rfid) {
            debug("Initializing RFID");
            this._rc522 = require('rc522');
            this._rc522.startListening((in_uid) => {
                this.onRfid(in_uid);
            });
        }
    }

    terminate() {
        if (this.rfid) {
            this._rc522.stopListening();
        }

        if (this.hid) {
            for (var i in this._hid_devs) {
                this._hid_devs[i].close();
            }
        }
    }

    deliverBuffer() {
        var input = this.input_buffer.toString('ascii', 0, this.bp);

        this.handler(input, last_src);
        return this;
    }

    resetBuffer() {
        this.input_buffer.fill(null);
        this.bp = 0;

        return this;
    }

    onInput(i, ctx) {
        if (typeof ctx == 'undefined') ctx = { 'src': '', 'mode': 'stream' };
        this.last_src = ctx.src;

        if (ctx.mode == 'stream') {
            // partial data

            if (! this.input_timeout) {
                // arm our timeout
                var self = this;
                this.input_timeout = setTimeout(function() {
                    self.deliverBuffer().resetBuffer();
                    this.input_timeout = null;
                }, INPUT_WINDOW_MS);
            }

            if (this.bp == this.input_buffer.length) {
                // buffer overflow, deliver and reset
                this.deliverBuffer().resetBuffer();
            } else {
                this.storeStreamInput(i);
                if (this.input_complete) {
                    this.deliverBuffer().resetBuffer();
                    this.input_complete = false;
                }
            }
        } else if (ctx.mode == 'scalar') {
            // data received in its entirety
        }
    }

    storeStreamInput(inp) {
        if (this.isStopCharacter(inp)) {
            this.input_complete = true;
        } else {
            this.input_buffer[this.bp++] = inp;
        }
    }

    onHid(buf) {
        // Evaluate the buffer and pull out
        var raw  = buf[2];
        var key1 = buf.toString('ascii', 2, 3);

        var ctx = { 'src': 'hid', 'mode': 'stream' };
        if (raw > 0x0) this.onInput(ctx);
    }

    onRfid(uid) {
        // @fixme -- possibly manipulate the value
        this.onInput(uid, { 'src': 'rfid', 'mode': 'scalar' });
    }
}

module.exports = bxpInputHandler;
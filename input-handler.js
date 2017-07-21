"use strict";
const debug = require('debug')('boxpihal:input-handler');

const MAX_INPUT_BUFFER = 0x400; // 1024 bytes maximum
const INPUT_WINDOW_MS  = 500;   // 0.5 sec to finish a stream

const STOP_CHARS = [ 0x40 ];

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

            for (var hi in hid_devices) {
                var dev_path = hid_devices[hi].path;
                if (! dev_path) continue;

                var dev;
                try {
                    dev = new HID.HID(dev_path);
                } catch(e) {
                    // Failed to attach
                    dev = null;
                }

                var self = this;

                if (dev) {
                    dev.on('data', (data) => {
                        self.onHid(data);
                    });

                    dev.on('error', (err) => {
                        self.onHidError(err);
                    });

                    this._hid_devs.push(dev);
                }
            }
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
            this.input_buffer.write(i, 0, i.length, 'ascii');
            this.bp = i.length;

            this.deliverBuffer().resetBuffer();
        }
    }

    storeStreamInput(inp) {
        if (this.isStopCharacter(inp.charCodeAt(0))) {
            this.input_complete = true;
        } else {
            this.input_buffer[this.bp++] = inp;
        }
    }

    isStopCharacter(char_code) {
        return STOP_CHARS.indexOf(char_code) != -1;
    }

    onHid(buf) {
        var raw;
        var key1;

        if (buf instanceof Buffer) {
            raw  = buf[2];
            key1 = buf.toString('ascii', 2, 3);
        } else {
            raw = (new Buffer(buf))[0];
            key1 = buf;
        }

        var ctx = { 'src': 'hid', 'mode': 'stream' };
        if (raw > 0x0) this.onInput(key1, ctx);
    }

    onHidError(err) {
        debug(error);
    }

    onRfid(uid) {
        // @fixme -- possibly manipulate the value
        this.onInput(uid, { 'src': 'rfid', 'mode': 'scalar' });
    }
}

module.exports = bxpInputHandler;
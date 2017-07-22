"use strict";
const debug = require('debug')('boxpihal:input-handler');
const HidKey = require('./hid/keymap');

const MAX_INPUT_BUFFER = 0x400; // 1024 bytes maximum
const INPUT_WINDOW_MS  = 1500;   // 1.5 sec to finish a stream of input


class bxpInputHandler {
    constructor(bxp, handler) {
        this.hid =  bxp.config.enable_hid === true;
        this.rfid = bxp.config.enable_rfid === true;
        this.virtual = bxp.config.enable_virtual_hid === true;

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
        var self = this;
        
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

        if (this.virtual) {
            debug("Initializing virtual HID device");
            var FakeScanner = require('./hid/virtual-scanner');
            this._fake_hid = new FakeScanner(function(data) {
                self.onHid(data);
            });
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

    getVirtualScanner() {
        if (! this.virtual) throw new Error("Virtual HID not enabled!");
        return this._fake_hid;
    }

    deliverBuffer() {
        var input = this.input_buffer.toString('ascii', 0, this.bp);

        this.handler(input, this.last_src);
        return this;
    }

    resetBuffer() {
        this.input_buffer.fill(null);
        this.bp = 0;

        if (this.input_timeout) clearTimeout(this.input_timeout);

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
                    debug("Input handler hit TIMEOUT of %d ms!", INPUT_WINDOW_MS);
                    self.deliverBuffer().resetBuffer();
                    this.input_timeout = null;
                }, INPUT_WINDOW_MS);
            }

            if (this.bp == this.input_buffer.length) {
                // buffer overflow, deliver and reset
                debug("Buffer overflow! Transmitting now");
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
        if (this.isStopCharacter(inp)) {
            this.input_complete = true;
            debug("Got STOP character");
        } else {
            this.input_buffer[this.bp++] = inp.charCodeAt(0);
            debug("Appending %s to buffer to position %d", inp, this.bp-1);
        }

        debug("storeStreamInput: Buffer is currently >%s<", this.input_buffer.toString('ascii').trim());
    }

    isStopCharacter(char) {
        //return HidKey.isStopCode(char_code);
        return char == "\n";
    }

    onHid(buf) {
        var raw;
        var key1;

        if (buf instanceof Buffer) {
            raw  = buf[2];
            key1 = HidKey.charForScanCode(raw);
            debug("OnHid: %s %d", key1, raw);
        } else {
            raw = (new Buffer(buf))[0];
            key1 = buf.toString('ascii');
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
"use strict";
const debug = require('debug')('boxpihal:input-virtual');
const HidKeymap = require('./keymap');

const DEFAULT_KEY_DELAY_MS = 10;

class bxpHidVirtualScanner {
	constructor(h, key_delay) {
		if (typeof key_delay == 'undefined') key_delay = DEFAULT_KEY_DELAY_MS;
		this.delay = key_delay;
		
		this.last_uid   = null;
		this.key_buffer = null;
		this.bp = 0;

		this.iv_scan    = null;

		this.handler = h;
	}

	scanUid(uid_string) {
		// build our HID-like scan buffer
		this.last_uid = uid_string;
		this.key_buffer = Buffer.alloc((uid_string.length + 1) * 2);

		var ofs = 0;
		for (var i = 0; i < uid_string.length; i++) {
			var ch = uid_string.charAt(i);
			var sc = HidKeymap.scanCodeForChar(ch);
			this.key_buffer[ofs] = sc;
			this.key_buffer[ofs+1] = 0x0; // add a null in between
			ofs += 2;
		}

		this.key_buffer[ofs] = 0x28;
		this.key_buffer[ofs+1] = 0x0;

		this.bp = 0;

		this.beginScan();
	}

	beginScan() {
		if (this.iv_scan) clearInterval(this.iv_scan);
		var self = this;
		
		debug("preparing to send virtual scan %s", this.last_uid);

		this.iv_scan = setInterval(function() {
			if (self.bp == self.key_buffer.length) {
				// we're done!
				clearInterval(self.iv_scan);
				debug("scan delivered -- %d bytes", self.key_buffer.length);
			} else {
				var kb = self._makeHidDataBuffer(self.key_buffer[self.bp]);
				self.handler(kb);
				self.bp++;
			}
		}, this.delay);
	}

	_makeHidDataBuffer(char) {
		var b = Buffer.alloc(8, 0x0);
		b[0x2] = char;
		
		return b;
	}
}

module.exports = bxpHidVirtualScanner;
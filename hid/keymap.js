/**
 * Map important scan codes to their ASCII equivalent
 */

const STOP_CODE = 0x28;
const BAD_CODE_SUB = 0x2C;
const BAD_CHAR_SUB = '?';

const HID_KEYMAP = [
	[ 0x00, ''  ],
	[ 0x04, 'A' ],
	[ 0x05, 'B' ],
	[ 0x06, 'C' ],
	[ 0x07, 'D' ],
	[ 0x08, 'E' ],
	[ 0x09, 'F' ],
	[ 0x0a, 'G' ],
	[ 0x0b, 'H' ],
	[ 0x0c, 'I' ],
	[ 0x0d, 'J' ],
	[ 0x0e, 'K' ],
	[ 0x0f, 'L' ],
	[ 0x10, 'M' ],
	[ 0x11, 'N' ],
	[ 0x12, 'O' ],
	[ 0x13, 'P' ],
	[ 0x14, 'Q' ],
	[ 0x15, 'R' ],
	[ 0x16, 'S' ],
	[ 0x17, 'T' ],
	[ 0x18, 'U' ],
	[ 0x19, 'V' ],
	[ 0x1a, 'W' ],
	[ 0x1b, 'X' ],
	[ 0x1c, 'Y' ],
	[ 0x1d, 'Z' ],
	[ 0x1e, '1' ],
	[ 0x1f, '2' ],
	[ 0x20, '3' ],
	[ 0x21, '4' ],
	[ 0x22, '5' ],
	[ 0x23, '6' ],
	[ 0x24, '7' ],
	[ 0x25, '8' ],
	[ 0x26, '9' ],
	[ 0x27, '0' ],
	[ 0x28, "\n" ],
	[ 0x2c, ' ' ],
	[ 0x2d, '-' ],
	[ 0x2e, '+' ],
	[ 0x31, '|' ],
	[ 0x33, ':' ],
	[ 0x35, '~' ]
];

function scanCodeForChar(ch, default_code) {
	if (typeof default_code == 'undefined') default_code = BAD_CODE_SUB;
	for (var i in HID_KEYMAP) {
		if (HID_KEYMAP[i][1] == ch.toUpperCase()) {
			return HID_KEYMAP[i][0];
		}
	}

	return default_code;
}

function charForScanCode(sc, default_char) {
	if (typeof default_char == 'undefined') default_char = BAD_CHAR_SUB;
	for (var i in HID_KEYMAP) {
		if (HID_KEYMAP[i][0] == sc) {
			return HID_KEYMAP[i][1];
		}
	}

	return default_char;
}

module.exports = {
	isStopCode: (sc) => { return STOP_CODE == sc; },
	scanCodeForChar: scanCodeForChar,
	charForScanCode: charForScanCode
};
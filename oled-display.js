"use strict";
const debug = require('debug')('boxpihal:oled');

const DISPLAY_TYPES = {
    '128x64': {
        'width': 128,
        'height': 64,
    }
};

const BITMAP_KEY = {
    'on': '@',
    'off': '.'
};

const SUPPORTED_FONTS = { '5x7': { "lib": 'oled-font-5x7', 'w': 5, 'h': 7} };
const DEFAULT_FONT    = '5x7';

const ON  = 1;
const OFF = 0;

class bxpOledDisplay {
    constructor(bxp) {
        this.disabled = false;
        this.display_config = {};

        this.oled = null;
        this.inverted = false;

        if (DISPLAY_TYPES[bxp.config.display_type]) {
            this.display_config = {
                'address': bxp.config.display_i2c_address,
                'bus_id': bxp.config.i2c_bus,
                'dims': DISPLAY_TYPES[bxp.config.display_type]
            };
        } else {
            debug("Unsupported Display Type: %s", bxp.config.display_type);
            this.disabled = true;
        }

        this.fonts = {};
        this.font  = 'default';

        this.init();
        this.initFonts(SUPPORTED_FONTS);
    }

    init() {
        if (this.disabled) return;

        debug("Setting up OLED: BUS %d, Address %d, Dimensions: %j", 
            this.display_config.bus_id, this.display_config.address, this.display_config.dims
        );

        var i2c = require('i2c-bus').openSync(this.display_config.bus_id);
        var Oled = require('oled-i2c-bus');

        try {
            this.oled = new Oled(i2c, {
                'width': this.oledWidth(),
                'height': this.oledHeight(),
                'address': this.display_config.address
            });
        } catch(e) {
            debug("Error when attempting to sync to OLED: %s", e.message);
            this.oled = null;
            this.disabled = true;
        }

        if (this.oled) {
            this.oled.turnOnDisplay();
            this.oled.clearDisplay();
            this.oled.fillRect(0, 0, this.oledWidth(-1), this.oledHeight(-1), OFF);
        }
    }

    initFonts(f) {
        if (this.disabled) return;

        for (var fk in f) {
            var font = null;
            try {
                font = require(f[fk].lib);
            } catch(e) {}

            if (font) {
                this.fonts[fk] = { 'font': font, 'w': f[fk].w, 'h': f[fk].h };
            }
        }

        if (this.fonts[ DEFAULT_FONT ]) {
            this.fonts['default'] = this.fonts[DEFAULT_FONT];
        }
    }

    oledDrawBitmap(bitmap, update, bitmap_key) {
        if (typeof update == 'undefined') update = true;
        if (typeof bitmap_key == 'undefined') bitmap_key = BITMAP_KEY;

        var w = bitmap[0].length;
        var h = bitmap.length;

        var px = [];

        for (var y = 0; y < h; y++) {
            var row = bitmap[y];
            for (var x = 0; x < w; x++) {
                if (row.charAt(x) == bitmap_key.on) {
                    px.push([x, y, ON]);
                } else if (row.charAt(x) == bitmap_key.off) {
                    px.push([x, y, OFF]);
                } else {
                    // ignore
                }
            }
        }
    }

    oledDraw(pixels, update) {
        if (this.disabled) return this;
        if (typeof update == 'undefined') update = true;

        this.oled.drawPixel(pixels, update);

        return this;
    }

    oledUpdate() {
        if (this.disabled) return this;
        this.oled.update();
    }

    oledSetInvert(invert) {
        if (this.disabled) return this;

        this.inverted = invert;
        this.oled.invertDisplay(this.inverted);

        return this;
    }

    oledDrawFilledRect(x, y, w, h, color) {
        if (this.disabled) return this;
        if (typeof color == 'undefined') color = 1;

        this.oled.fillRect(
            x, y,
            x + w,
            y + h,
            color
        );

        return this;
    }

    oledDrawRect(x, y, w, h, color) {
        if (this.disabled) return this;
        if (typeof color == 'undefined') color = 1;

        this.oled.drawLine(x    , y    , x + w, y       , color);
        this.oled.drawLine(x + w, y    , x + w, y + h   , color);
        this.oled.drawLine(x + w, y + h, x + w, y       , color);
        this.oled.drawLine(x + w, y + h, x + w, y + h   , color);

        return this;
    }

    oledLine(x, y, x2, y2, color) {
        if (this.disabled) return this;
        if (typeof color == 'undefined') color = 1;

        this.oled.drawLine(x, y, x2, y2, color);

        return this;
    }

    oledWriteString(text, scale, color) {
        if (this.disabled) return this;

        if (typeof scale == 'undefined') scale = 1;
        if (typeof color == 'undefined') color = 1;

        this.oled.writeString(this.getCurrentFontInstance(), scale, text, color, false);

        return this;
    }

    oledSetCursor(col, row, x_ofs, y_ofs) {
        if (this.disabled) return this;

        var font = this.getCurrentFont();

        //          base              spacing              custom
        var x = (font.w * col) + (col == 0 ? 0 : col - 1) + x_ofs;
        var y = (font.h * row) + (row == 0 ? 0 : row - 1) + y_ofs;

        this.oled.setCursor(x, y);

        return this;
    }

    getCurrentFont() {
        return this.fonts[this.font];
    }

    getCurrentFontInstance() {
        var f = this.getCurrentFont();
        if (f) return f.font;
        else return this.fonts['default'].font;
    }

    oledWidth(ofs) {
        if (! ofs) ofs = 0;
        return this.display_config.dims.width + ofs;
    }

    oledHeight(ofs) {
        if (! ofs) ofs = 0;
        return this.display_config.dims.height + ofs;
    }
}

module.exports = bxpOledDisplay;
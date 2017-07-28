var DEFAULTS = {
    'mode': 'development',
    'i2c_bus': '1',
    'spi_device': '/dev/spidev0.0',
    'enable_display': true,
    'enable_hid': true,
    'enable_virtual_hid': false,
    'enable_rfid': true,
    'display_type': '128x64',
    'display_i2c_address': 0x3D
};

function Config(custom) {
    var config = Object.assign({}, DEFAULTS, custom);

    return config;
}

function truthy(v) {
    if (typeof v == 'undefined') return false;
    v = new String(v); v = v.toLowerCase();
    if (parseInt(v) == 1 || v == 'true' || v == 'on' || v.match(/^y/i)) return true;
    return false;
}

module.exports = Config;
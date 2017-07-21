var DEFAULTS = {
    'i2c_bus': '1',
    'spi_device': '/dev/spidev0.0',
    'enable_display': true,
    'enable_hid': true,
    'enable_rfid': true,
    'display_type': '128x64',
    'display_i2c_address': 0x3D
};

function Config(custom) {
    return Object.assign({}, DEFAULTS, custom);
}

module.exports = Config;
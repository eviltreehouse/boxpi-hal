var DEFAULTS = {
    'mode': 'development',
    'i2c_bus': '1',
    'spi_device': '/dev/spidev0.0',
    'enable_display': true,
    'enable_hid': true,
    'enable_virtual_hid': false,
    'enable_rfid': true,
    'display_type': '128x64',
    'display_i2c_address': 0x3D,
    'api_host_secure': true,
    'api_host': null,
    'api_timeout': 0
};

function Config(custom) {
    var config = Object.assign({}, DEFAULTS, custom);

    if (! config.api_host) {
        defineApiHost(config);
    }

    return config;
}

function defineApiHost(config) {
    // Determine API host parameters via automagic means
    if (process.env['BOXTIE_API_HOST']) {
        config.api_host = process.env['BOXTIE_API_HOST'];

        config.api_host_secure = truthy(process.env['BOXTIE_API_HTTPS']);
    } else {
        if (config.mode == 'production') {
            config.api_host = 'api.boxtie.io';
        } else {
            config.api_host = 'np-api.boxtie.io';
            config.api_host_secure = false;
        }
    }

    return config;
}

function truthy(v) {
    if (typeof v == 'undefined') return false;
    v = new String(v); v = v.toLowerCase();
    if (parseInt(v) == 1 || v == 'true' || v == 'on' || v.match(/^y/i)) return true;
    return false;
}

module.exports = Config;
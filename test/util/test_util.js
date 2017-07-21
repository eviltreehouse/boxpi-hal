var os = require('os');

module.exports = {
    onRaspbian: function() { return (os.platform() == 'linux' && os.arch().match(/^armv7/)); }
};
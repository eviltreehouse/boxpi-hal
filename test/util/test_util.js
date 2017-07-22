var os = require('os');
var exec = require('child_process').execSync;

module.exports = {
    onRaspbian: function() { return (os.platform() == 'linux' && os.arch().match(/^armv7/)); },

    isDefinedObject: function(o) { return typeof o === 'object' && o != null; },

    shellCmd: function(cmd) {
        var stdout = exec(cmd);
        return stdout.toString('utf8');
    }
};
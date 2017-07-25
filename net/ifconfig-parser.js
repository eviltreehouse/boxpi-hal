"use strict";
var exec = require('child_process').execSync;

/**
 * Gets `ifconfig` information from the shell.
 * @param {String} interface provide if you want to be explicit
 */
function ifconfigParser(interface) {
    var interface_clean;

    if (interface.match(/^([a-z0-9]+)/)) {
        interface_clean = interface.match(/^([a-z0-9]+)/)[1];
    } else {
        interface_clean = "";
    }

    var ifconfig = exec(`ifconfig ${interface_clean}`).toString('utf8').split(/\n/);

    return parse(ifconfig);
}

function parse(data) {
    var cur_inf = null;
    var parsed = {};

    for (var di in data) {
        var line = data[di];
        if (line.match(/^([a-z0-9]+):/)) {
            var inf = line.match(/^([a-z0-9]+):/)[1];
            parsed[inf] = {};
            cur_inf = parsed[inf];

            line = line.replace(/^([a-z0-9]+):\s*/, '');
        } else {
            line = line.replace(/^\s*/, '');
        }

        if (line.match(/^ether /)) {
            cur_inf['ether'] = line;
        } else if (line.match(/^inet /)) {
            cur_inf['inet'] = inet;
        }
    }

    return parsed;
}

module.exports = ifconfigParser;
"use strict";
const exec = require('child_process').execSync;
const fs   = require('fs');
const path = require('path');

// Full path to system file:
const WPA_SUPPLICANT_CONF = "/etc/wpa_supplicant/wpa_supplicant.conf";
const WPA_BACKUP          = "~/wpa_supplicant.conf.bak";
const CONF_UPDATE_TRIGGER = "wpa_cli reconfigure";

/**
 * Generate a wpa_supplicant.conf file from a 
 * a base JSON configuration.
 * @param {*} def 
 */
function wpaConfig(def) {
    /*
        { 
            ssid: "mywifi", 
            password: "wifipassword"
        }

        to

        network={
            ssid="mywifi"
            psk=43492i4040294204...
        }
    */

    var src = generateWpaConfig(def);
    if (src) writeWpaConfig(src);
    else return false;

    restartWpa();

    return true;
}

function restartWpa() {
    var res = exec("sudo ${CONF_UPDATE_TRIGGER}");
}

function writeWpaConfig(src) {
    fs.writeFileSync(WPA_BACKUP, fs.readFileSync(WPA_SUPPLICANT_CONF)); // backup the original
    fs.writeFileSync(WPA_SUPPLICANT_CONF, src);
}

function generateWpaConfig(def) {
    var psk = generateEncryptedPsk(def.ssid, def.password);
    if (! psk) return null;

    return `network={
        ssid="${def.ssid}"
        psk=${psk}
    }`;
}

function generateEncryptedPsk(ssid, password) {
    var script = writeToTempfile(`wpa_passphrase "${ssid}" "${password}"`);
    var res = exec(`bash ${script}`).toString('utf8');

    fs.unlinkSync(script);

    if (res.match(/psk=[a-f0-9]+/)) {
        var psk = res.match(/psk=([a-f0-9]+)/)[1];

        return psk;
    } else {
        return null;
    }
}

function writeToTempfile(src) {
    var fname = path.resolve(os.tempdir(), "boxpi-" . Date.now() + ".sh");
    fs.writeSync(fname, src);

    return fname;
}

module.exports = wpaConfig;
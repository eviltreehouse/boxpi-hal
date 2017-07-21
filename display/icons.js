function CautionSign() {
    // 7x7
    return squish([
        ". . . @ . . .",
        ". . @ . @ . .",
        ". @ . @ . @ .",
        "@ . . @ . . @",
        "@ . . @ . . @",
        "@ @ @ @ @ @ @",
        ". . . . . . ."
    ]);
}

function FatalSign() {
    // 7x7
    return squish([
        ". . @ @ @ . .",
        ". @ @ @ @ @ .",
        "@ . . @ . . @",
        "@ . @ @ @ . @",
        "@ @ @ . @ @ @",
        ". @ @ @ @ @ .",
        ". @ . @ . @ ."
    ]);    
}

function ConnectingSign() {
    // 10x7
    return squish([
        ". . . . . . . . . .",
        ". . . . . . . . . .",
        ". @ @ @ . . @ @ @ .",
        "@ @ . . @ @ @ . . @",
        ". @ @ @ . . @ @ @ .",
        ". . . . . . . . . .",
        ". . . . . . . . . ."
    ]);
}

function SignalSign() {
    // 7x7
    return squish([
        ". . . . @ @ @",
        ". . . . . . @",
        ". @ @ @ @ . @",
        ". . @ . @ . .",
        ". . @ @ @ . .",
        ". @ . . @ . .",
        ". @ . . . . ."
    ]);    
}

function DataSign() {
    // 7x7
    return squish([
        "@ @ @ @ @ . .",
        "@ . . . . @ .",
        "@ . . . . . @",
        "@ . . . . . @",
        "@ . . . . . @",
        "@ . . . . . @",
        "@ @ @ @ @ @ @"
    ]);
}

function UplinkSign() {
    // 7x7
    return squish([
        ". . . @ . . .",
        ". @ @ @ @ @ .",
        "@ @ @ @ @ @ @",
        ". . @ @ @ . .",
        ". . @ @ @ . .",
        ". . . . . . .",
        "@ @ @ @ @ @ @"
    ]);
}

function squish(arr) {
    // Remove whitespace
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace(/\s/g, '');
    }

    return arr;
}

module.exports = {
    'CautionSign': CautionSign(),
    'FatalSign': FatalSign(),
    'ConnectingSign': ConnectingSign(),
    'SignalSign': SignalSign(),
    'DataSign': DataSign(),
    'UplinkSign': UplinkSign()
};
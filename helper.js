const KEY_MAP = {
    2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6', 8: '7', 9: '8', 10: '9', 11: '0', 12: '-', 13: '=', 14: 'backspace',
    15: 'tab', 16: 'q', 17: 'w', 18: 'e', 19: 'r', 20: 't', 21: 'y', 22: 'u', 23: 'i', 24: 'o', 25: 'p', 26: '[', 27: ']', 28: 'enter',
    29: 'control', 30: 'a', 31: 's', 32: 'd', 33: 'f', 34: 'g', 35: 'h', 36: 'i', 37: 'j', 38: 'k', 39: 'l', 40: ';', 41: '\'',  42: 'shift', 43: '\\',
    44: 'z', 45: 'x', 46: 'c', 47: 'v', 48: 'b', 49: 'n', 50: 'm', 51: ',', 52: '.', 53: '/', 54: 'right_shift', 
    55: '', 56: 'alt', 57: 'space', 58: '', 
    59: 'f1', 60: 'f2', 61: 'f3', 62: 'f4', 63: 'f5', 64: 'f6', 65: 'f7', 66: 'f8', 67: 'f9', 68: 'f10', 69: 'f11', 70: 'f12',
    71: '7', 72: '8', 73: '9', 74: '-', 75: '4', 76: '5', 77: '6', 78: '+', 79: '1', 80: '2', 81: '3', 83: '.',
    3675: 'command', 3612: 'enter',  61007: 'end', 60999: 'home',
    57416: 'up', 57419: 'left', 57421: 'right', 57424: 'down', 
    61000: 'up', 61003: 'left', 61005: 'right', 61008: 'down', 
}

function getKeyModify(modify) {
    if(modify.a) {
        return 'alt'
    } else if(modify.s) {
        return 'shift'
    } else if(modify.c) {
        return 'ctrl'
    } else if(modify.m) {
        return 'meta'
    } else {
        return undefined;
    }
}

function isKeyModify(modify) {
    return [29, 3675].indexOf(modify) !== -1;
}

function getMouseClick(button) {
    if (button === 1) {
        return 'left'
    } else if (button === 2) {
        return 'right'
    } else if (button === 3) {
        return 'middle'
    }
}

exports = module.exports = {
    KEY_MAP: KEY_MAP,
    isKeyModify: isKeyModify,
    getKeyModify: getKeyModify,
    getMouseClick: getMouseClick
}
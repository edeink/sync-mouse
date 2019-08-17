const NUM_TO_KEY = {
    1: 'esc', 2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6', 8: '7', 9: '8', 10: '9', 11: '0', 12: '-', 13: '=', 14: 'backspace',
    15: 'tab', 16: 'q', 17: 'w', 18: 'e', 19: 'r', 20: 't', 21: 'y', 22: 'u', 23: 'i', 24: 'o', 25: 'p', 26: '[', 27: ']', 28: 'enter',
    29: 'control', 30: 'a', 31: 's', 32: 'd', 33: 'f', 34: 'g', 35: 'h', 36: 'j', 37: 'k', 38: 'l', 39: ';', 40: '\'', 41: '',  42: 'shift', 43: '\\',
    44: 'z', 45: 'x', 46: 'c', 47: 'v', 48: 'b', 49: 'n', 50: 'm', 51: ',', 52: '.', 53: '/', 54: 'right_shift',
    55: '', 56: 'alt', 57: 'space', 58: '',
    59: 'f1', 60: 'f2', 61: 'f3', 62: 'f4', 63: 'f5', 64: 'f6', 65: 'f7', 66: 'f8', 67: 'f9', 68: 'f10', 69: 'f11', 70: 'f12',
    71: '7', 72: '8', 73: '9', 74: '-', 75: '4', 76: '5', 77: '6', 78: '+', 79: '1', 80: '2', 81: '3', 83: '.',
    3675: 'command', 3612: 'enter',  61007: 'end', 60999: 'home',
    57416: 'up', 57419: 'left', 57421: 'right', 57424: 'down',
    61000: 'up', 61003: 'left', 61005: 'right', 61008: 'down',
};

const KEY_TO_NUM = {
    ESC: 1, ONE: 2, TWO: 3, THREE: 4, FOUR: 5, FIVE: 6, SIXE: 7, SEVEN: 8, NINE: 9, ZERO: 11, MINUS: 12, EQUAL: 13, BACKSPACE: 14,
    TAB: 15, Q: 16, W: 17, E: 18, R: 19, T: 20, Y: 21, U: 22, I: 23, O: 24, P: 25, LEFT_M_BRACKETS: 26, RIGHT_M_BRACKETS: 27, ENTER: 28,
    CONTROL: 29, A: 30, S: 31, D: 32, F: 33, G: 34, H: 35, J: 36, K: 37, L: 38, SEMICOLON: 39, SINGLE_QUOTE: 40, BACKSLASH: 43,
    Z: 44, X: 45, C: 46, V: 47, B: 48, N: 49, M: 50, COMMA: 51, SPOT: 52, SLASH: 53, RIGHT_SHIFT: 54,
    ALT: 56, SPACE: 57,
    F1: 59, F2: 60, F3: 61, F4: 62, F5: 63, F6: 64, F7: 65, F8: 66, F9: 67, F10: 68, F11: 69, F12: 70,
    COMMAND: 2675, END: 61007, HOME: 60999,

};

exports = module.exports = {
    NUM_TO_KEY,
    KEY_TO_NUM,
};
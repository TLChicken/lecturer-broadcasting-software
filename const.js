exports.keybindIndex_toggleOverlay = 10;
exports.keybindIndex_selectPen = 11;
exports.keybindIndex_selectHighlighter = 12;
exports.keybindIndex_selectEraser = 13;
exports.keybindIndex_nextSlide = 14;
exports.keybindIndex_minimizeToolbar = 15;
exports.keybindIndex_deleteAll = 16;
exports.keybindIndex_saveScreenshot = 17;
exports.keybindIndex_toggleSlideshowRecording = 18;
exports.keybindIndex_toggleWhiteboard = 19;
exports.keybindIndex_toggleLaserPointer = 20;


exports.saveFileName = "lbs_save_v1.5.json";

exports.UiohookKeyREVERSE = {
    0x000E: "Backspace",
    0x000F: "Tab",
    0x001C: "Enter",
    0x003A: "CapsLock",
    0x0001: "Escape",
    0x0039: "Space",
    0x0E49: "PageUp",
    0x0E51: "PageDown",
    0x0E4F: "End",
    0x0E47: "Home",
    0xE04B: "ArrowLeft",
    0xE048: "ArrowUp",
    0xE04D: "ArrowRight",
    0xE050: "ArrowDown",
    0x0E52: "Insert",
    0x0E53: "Delete",
    0x000B: "0",
    0x0002: "1",
    0x0003: "2",
    0x0004: "3",
    0x0005: "4",
    0x0006: "5",
    0x0007: "6",
    0x0008: "7",
    0x0009: "8",
    0x000A: "9",
    0x001E: "A",
    0x0030: "B",
    0x002E: "C",
    0x0020: "D",
    0x0012: "E",
    0x0021: "F",
    0x0022: "G",
    0x0023: "H",
    0x0017: "I",
    0x0024: "J",
    0x0025: "K",
    0x0026: "L",
    0x0032: "M",
    0x0031: "N",
    0x0018: "O",
    0x0019: "P",
    0x0010: "Q",
    0x0013: "R",
    0x001F: "S",
    0x0014: "T",
    0x0016: "U",
    0x002F: "V",
    0x0011: "W",
    0x002D: "X",
    0x0015: "Y",
    0x002C: "Z",
    0x0052: "Numpad0",
    0x004F: "Numpad1",
    0x0050: "Numpad2",
    0x0051: "Numpad3",
    0x004B: "Numpad4",
    0x004C: "Numpad5",
    0x004D: "Numpad6",
    0x0047: "Numpad7",
    0x0048: "Numpad8",
    0x0049: "Numpad9",
    0x0037: "NumpadMultiply",
    0x004E: "NumpadAdd",
    0x004A: "NumpadSubtract",
    0x0053: "NumpadDecimal",
    0x0E35: "NumpadDivide",

    0x0E1C: "NumpadEnter",
    0xEE4F: "NumpadEnd",
    0xEE50: "NumpadArrowDown",
    0xEE51: "NumpadPageDown",
    0xEE4B: "NumpadArrowLeft",
    0xEE4D: "NumpadArrowRight",
    0xEE47: "NumpadHome",
    0xEE48: "NumpadArrowUp",
    0xEE49: "NumpadPageUp",
    0xEE52: "NumpadInsert",
    0xEE53: "NumpadDelete",

    0x003B: "F1",
    0x003C: "F2",
    0x003D: "F3",
    0x003E: "F4",
    0x003F: "F5",
    0x0040: "F6",
    0x0041: "F7",
    0x0042: "F8",
    0x0043: "F9",
    0x0044: "F10",
    0x0057: "F11",
    0x0058: "F12",
    0x005B: "F13",
    0x005C: "F14",
    0x005D: "F15",
    0x0063: "F16",
    0x0064: "F17",
    0x0065: "F18",
    0x0066: "F19",
    0x0067: "F20",
    0x0068: "F21",
    0x0069: "F22",
    0x006A: "F23",
    0x006B: "F24",
    0x0027: "Semicolon",
    0x000D: "Equal",
    0x0033: "Comma",
    0x000C: "Minus",
    0x0034: "Period",
    0x0035: "Slash",
    0x0029: "Backquote",
    0x001A: "BracketLeft",
    0x002B: "Backslash",
    0x001B: "BracketRight",
    0x0028: "Quote",
    0x001D: "Ctrl",
    0x0E1D: "CtrlRight",
    0x0038: "Alt",
    0x0E38: "AltRight",
    0x002A: "Left Shift",
    0x0036: "Right Shift",
    0x0E5B: "Meta",
    0x0E5C: "MetaRight",
    0x0045: "NumLock",
    0x0046: "ScrollLock",
    0x0E37: "PrintScreen"
};

function rgba(red, green, blue, alpha) {
    return "rgba(" + red + ","+ green + ","+ blue + ","+ alpha + ")";
}

exports.colorThemes_keys = ['original', 'pastel', 'darks'];

exports.colorThemes_themeNames = {
    'original': "Original",

    'pastel': "Pastel",

    'darks': "Dark Colors",
};

exports.colorThemes_themeColors = {
    'original':
        [rgba(255, 0, 0, 1),
            rgba(255, 155, 0, 1),
            rgba(255, 255, 0, 1),
            rgba(155, 255, 0, 1),
            rgba(0, 255, 0, 1),
            rgba(102, 255, 204, 1),
            rgba(51, 204, 255, 1),
            rgba(0, 102, 255, 1),
            rgba(102, 0, 255, 1),
            rgba(255, 0, 255, 1)],

    'pastel':
        [rgba(255, 183, 170, 1),
            rgba(255, 213, 186, 1),
            rgba(255, 244, 193, 1),
            rgba(232, 255, 206, 1),
            rgba(204, 255, 240, 1),
            rgba(206, 233, 255, 1),
            rgba(209, 218, 255, 1),
            rgba(212, 201, 255, 1),
            rgba(230, 193, 255, 1),
            rgba(255, 206, 221, 1)],

    'darks':
        [rgba(155, 12, 0, 1),
            rgba(188, 132, 0, 1),
            rgba(188, 176, 0, 1),
            rgba(172, 188, 0, 1),
            rgba(113, 188, 0, 1),
            rgba(0, 188, 84, 1),
            rgba(0, 188, 176, 1),
            rgba(0, 141, 188, 1),
            rgba(0, 47, 188, 1),
            rgba(182, 0, 188, 1)],

};


// class BrushCategory {
//     static get PEN () {
//         return 0;
//     }
//
//     static get HIGHLIGHTER () {
//         return 1;
//     }
//
//     static get ERASER () {
//         return 2;
//     }
// }
//
// class PenSubCat {
//     static get MAIN_PEN () {
//         return "MAIN_PEN";
//     }
// }
//
// class HighlighterSubCat {
//     static get MAIN_HIGHLIGHTER () {
//         return "MAIN_HIGHLIGHTER";
//     }
//
//     static get SINGLE_OPACITY_HIGHLIGHTER () {
//         return "SINGLE_OPACITY_HIGHLIGHTER";
//     }
// }
//
// class EraserSubCat {
//     static get MAIN_ERASER () {
//         return "MAIN_ERASER";
//     }
// }

exports.brushes_keys = ['pen', 'highlighter', 'eraser'];

exports.brushes_keys_to_types = {
    'pen_square': "pen",
    'pen_round': "pen",

    'multiple_opac_highlighter': "highlighter",
    'single_opac_highlighter': "highlighter",

    'eraser': "eraser",
};

exports.brush_types_to_overlaypreload_command = {
    'pen': "activate-pen",
    'highlighter': "activate-highlighter",
    'eraser': "activate-eraser",
}

// module.exports.BrushCategory = BrushCategory;
// module.exports.PenSubCat = PenSubCat;
// module.exports.HighlighterSubCat = HighlighterSubCat;
// module.exports.EraserSubCat = EraserSubCat;
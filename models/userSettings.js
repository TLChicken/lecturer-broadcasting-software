const {UiohookKey} = require("uiohook-napi");
const lbsConsts = require("./const");
const { rgba } = require("./colorUtils")


// class UserSettings {
//
//     constructor() {
//
//         this.colorKeyBinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, UiohookKey.Shift, UiohookKey.P, UiohookKey.H, UiohookKey.E, UiohookKey.ArrowRight]; // Numpad 1 to 0
//         this.selectedColors = lbsConsts.colorThemes_themeColors['original'];
//
//
//         this.isInDrawingMode = false;
//         this.currColor = rgba(255, 0, 0, 0);
//
//         this.drawingBrushSize = 10;
//         this.erasingBrushSize = 30;
//     }
//
// }
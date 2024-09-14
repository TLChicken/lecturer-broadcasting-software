const {UiohookKey} = require("uiohook-napi");
const lbsConsts = require("../const");
const { rgba } = require("./colorUtils")


class SettingsBrushType {
    static get ADD_PIXEL () {
        return 0;
    }

    static get REMOVE_PIXEL () {
        return 1;
    }
}


class UserSettings {

    constructor() {

        this.colorKeyBinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, UiohookKey.Shift, UiohookKey.P, UiohookKey.H, UiohookKey.E, UiohookKey.ArrowRight]; // Numpad 1 to 0
        this.selectedColors = lbsConsts.colorThemes_themeColors['original'];


        this.isInDrawingMode = false;
        this.currColor = rgba(255, 0, 0, 0);

        this.brushType = SettingsBrushType.ADD_PIXEL;
        this.brushSizeScrollWheelOffset = 1;

        this.brushSizes = [10, 30];
    }

    brushSizeUp() {
        let currBrushSize = this.brushSizes[this.brushType];
        let newBrushSize = currBrushSize + this.brushSizeScrollWheelOffset;

        if (newBrushSize <= 200) {
            this.brushSizes[this.brushType] = newBrushSize;
            return newBrushSize;
        } else {
            return currBrushSize;
        }
    }

    brushSizeDown() {
        let currBrushSize = this.brushSizes[this.brushType];
        let newBrushSize = currBrushSize - this.brushSizeScrollWheelOffset;

        if (newBrushSize >= 1) {
            this.brushSizes[this.brushType] = newBrushSize;
            return newBrushSize;
        } else {
            return currBrushSize;
        }
    }

}

module.exports = { UserSettings };
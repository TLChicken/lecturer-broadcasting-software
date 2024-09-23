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

    constructor(saveFileJson) {
        if (saveFileJson == null) {
            this.colorKeyBinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, UiohookKey.Shift, UiohookKey.P, UiohookKey.H, UiohookKey.E, UiohookKey.ArrowRight, UiohookKey.M]; // Numpad 1 to 0
            this.selectedColors = lbsConsts.colorThemes_themeColors['original'];

            this.currColor = rgba(255, 0, 0, 0);
            this.brushSizes = [10, 30];
        } else {
            this.colorKeyBinds = saveFileJson.colorKeyBinds;
            this.selectedColors = saveFileJson.selectedColors;

            this.currColor = saveFileJson.currColor;
            this.brushSizes = saveFileJson.brushSizes;
        }

        this.isInDrawingMode = false;

        this.brushType = SettingsBrushType.ADD_PIXEL;
        this.brushSizeScrollWheelOffset = 1;

    }

    convertToSaveJson() {
        return {
            colorKeyBinds: this.colorKeyBinds,
            selectedColors: this.selectedColors,

            currColor: this.currColor,
            brushSizes: this.brushSizes
        }
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

    setColor(rgbaStr) {
        this.currColor = rgbaStr;
    }

}

module.exports = { UserSettings };
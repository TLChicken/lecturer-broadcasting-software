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

let defaultKeybinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, UiohookKey.Shift, UiohookKey.P, UiohookKey.H, UiohookKey.E, UiohookKey.ArrowRight, UiohookKey.M, UiohookKey.Delete, UiohookKey.PrintScreen, UiohookKey.R];

let defaultBrushData = {
    'pen_square': {
        size: 10,
        color: rgba(255, 0, 0, 0)
    },
    'pen_round': {
        size: 10,
        color: rgba(255, 0, 0, 0)
    },

    'multiple_opac_highlighter': {
        size: 20,
        color: rgba(255, 255, 0, 0)
    },
    'single_opac_highlighter': {
        size: 10,
        color: rgba(255, 255, 0, 0)
    },

    'eraser': {
        size: 30,
        color: rgba(255, 0, 0, 0)
    },
}


class UserSettings {

    constructor(saveFileJson) {
        if (saveFileJson == null) {
            this.colorKeyBinds = defaultKeybinds; // Numpad 1 to 0
            this.selectedColors = lbsConsts.colorThemes_themeColors['original'];

            this.currColor = rgba(255, 0, 0, 0);
            this.brushSizes = [10, 30];

            this.brushData = defaultBrushData;

        } else {
            this.colorKeyBinds = saveFileJson.colorKeyBinds;
            this.selectedColors = saveFileJson.selectedColors;

            this.currColor = saveFileJson.currColor;
            this.brushSizes = saveFileJson.brushSizes;

            // Upgrade save file
            if ('brushData' in saveFileJson) {
                console.log("Loading existing brush data from save");
                this.brushData = saveFileJson.brushData;
            } else {
                console.log("Upgrading existing save by adding default brush data");
                this.brushData = defaultBrushData;
            }


            // For when new keybinds are added
            if (this.colorKeyBinds.length < defaultKeybinds.length) {
                for (let i = this.colorKeyBinds.length; i < defaultKeybinds.length; i++) {
                    this.colorKeyBinds.push(defaultKeybinds[i]);
                }
            }

            // For when new brushes are added
            let brushDataKeys = Object.keys(this.brushData);
            let defaultBrushDataKeys = Object.keys(defaultBrushData);
            let missingKeys = defaultBrushDataKeys.filter(x => !brushDataKeys.includes(x));

            for (const missingKey of missingKeys) {
                console.log("Adding new brush to existing data: " + missingKey.toString());
                this.brushData[missingKey] = defaultBrushData[missingKey];
            }
        }

        this.isInDrawingMode = false;

        this.brushType = SettingsBrushType.ADD_PIXEL;  // REMOVE THIS SOON
        this.brushSizeScrollWheelOffset = 1;

        this.currentBrush = "pen_round";

    }

    convertToSaveJson() {
        return {
            colorKeyBinds: this.colorKeyBinds,
            selectedColors: this.selectedColors,

            currColor: this.currColor,
            brushSizes: this.brushSizes,

            brushData: this.brushData
        }
    }

    brushSizeUp(currBrushKey) {
        let currBrushSize = this.brushData[currBrushKey].size;
        let newBrushSize = currBrushSize + this.brushSizeScrollWheelOffset;

        if (newBrushSize <= 200) {
            this.brushData[currBrushKey].size = newBrushSize;
            return newBrushSize;
        } else {
            return currBrushSize;
        }
    }

    brushSizeDown(currBrushKey) {
        let currBrushSize = this.brushData[currBrushKey].size;
        let newBrushSize = currBrushSize - this.brushSizeScrollWheelOffset;

        if (newBrushSize >= 1) {
            this.brushData[currBrushKey].size = newBrushSize;
            return newBrushSize;
        } else {
            return currBrushSize;
        }
    }

    setColor(rgbaStr, currBrushKey) {
        this.currColor = rgbaStr;

        this.brushData[currBrushKey].color = rgbaStr;
    }

    getBrushData() {
        return this.brushData;
    }

    // brushSizeUp() {
    //     let currBrushSize = this.brushSizes[this.brushType];
    //     let newBrushSize = currBrushSize + this.brushSizeScrollWheelOffset;
    //
    //     if (newBrushSize <= 200) {
    //         this.brushSizes[this.brushType] = newBrushSize;
    //         return newBrushSize;
    //     } else {
    //         return currBrushSize;
    //     }
    // }
    //
    // brushSizeDown() {
    //     let currBrushSize = this.brushSizes[this.brushType];
    //     let newBrushSize = currBrushSize - this.brushSizeScrollWheelOffset;
    //
    //     if (newBrushSize >= 1) {
    //         this.brushSizes[this.brushType] = newBrushSize;
    //         return newBrushSize;
    //     } else {
    //         return currBrushSize;
    //     }
    // }
    //
    // setColor(rgbaStr) {
    //     this.currColor = rgbaStr;
    // }

}

module.exports = { UserSettings };
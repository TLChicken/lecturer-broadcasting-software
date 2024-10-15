
// import { AColorPicker } from "./acolorpicker";
// const AColorPicker = require('a-color-picker');

const params = new URLSearchParams(window.location.search);

let dispWidth = params.get("dispWidth");
let dispHeight = params.get("dispHeight");

let dynamicToolbarWidth = Math.floor(dispWidth / 30);
let dynamicToolbarHeight = Math.floor(dispHeight / 2);
let settingsWidth = Math.floor(dispWidth / 3.8);
let settingsHeight = Math.floor(dispHeight / 1.8);
let dynamicToolbarMinimizedHeight = Math.floor(dynamicToolbarWidth * 1);

let afterGetUserSettingsCallback = null;

let colorThemeDropdownMenu = null;

document.addEventListener('DOMContentLoaded', () => {
    const buttonActions = {
        mouse: () => {
            window.ipcRender.send("toggle-drawing-mode");
        },
        pen: () =>  {
            window.ipcRender.send("select-pen");
        },
        highlighter: () =>  {
            window.ipcRender.send("select-highlighter");
        },
        eraser: () =>  {
            window.ipcRender.send("select-eraser");
        },
        startPresentation: () => console.log('Screen capture tool activated'),
        colorOptions: () => {
            openColorPaletteToolbar();
        },
        clearAll: () => {
            window.ipcRender.send("select-erase-all");
        },
        save: () => {
            saveScreenshot();
        },
        keybindSettings: () => {
            openSettings();
        },
        minimiseToolbar: () => {
            minimiseToolbar();
        },
        exit: () => {
            window.ipcRender.send("close-toolbar");
        },
        maximiseToolbar: () => {
            maximiseToolbar();
        }
    };

    Object.keys(buttonActions).forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', buttonActions[id]);
        }
    });

    let closeBtn = document.getElementById("close-settings-btn");
    closeBtn.addEventListener('click', () => {
        closeSettings();
    })

    let tabbtns = document.getElementsByClassName("settings-tab-btn");
    for (let i = 0; i < tabbtns.length; i++) {
        let currId = tabbtns[i].id;
        tabbtns[i].addEventListener('click', () => {
            switchSettingsTab(tabbtns[i], currId.replace("-btn", ""));
        })
    }

    // let kbBtnList = Array.from(document.querySelectorAll('.keybind-btn'));
    let kbBtnList = document.getElementsByClassName("keybind-btn");
    for (let i = 0; i < kbBtnList.length; i++) {
        let currKbBtn = kbBtnList[i];

        if (i < 10) {
            // Color Keybind calls different function - FIX PLS
            currKbBtn.addEventListener('click', () => {
                changeColorKeybind(currKbBtn.id);
            })
        } else {
            currKbBtn.addEventListener('click', () => {
                changeKeybind(currKbBtn.id, i + 1);
            })
        }


    }


    Coloris({
        themeMode: 'dark',
        alpha: false,
        // format: 'rgb'
    })


    window.ipcRender.receive("enter-drawing-mode", () => {
        let buttonsToUpdId = ["mouse", "maximiseToolbar"];

        buttonsToUpdId.forEach((eleId) => {
            const button = document.getElementById(eleId);
            if (button) {
                button.style.backgroundColor = "#3F986D";
            }
        })
    })

    window.ipcRender.receive("exit-drawing-mode", () => {
        let buttonsToUpdId = ["mouse", "maximiseToolbar"];

        buttonsToUpdId.forEach((eleId) => {
            const button = document.getElementById(eleId);
            if (button) {
                button.style.backgroundColor = "#2B4D3C";
            }
        })
    })

    window.ipcRender.receive("activate-pen", () => {
        toggleButtonOn("pen");
        toggleButtonOff("highlighter");
        toggleButtonOff("eraser");
    })

    window.ipcRender.receive("activate-highlighter", () => {
        toggleButtonOff("pen");
        toggleButtonOn("highlighter");
        toggleButtonOff("eraser");
    })

    window.ipcRender.receive("activate-eraser", () => {
        toggleButtonOff("pen");
        toggleButtonOff("highlighter");
        toggleButtonOn("eraser");
    })

    window.ipcRender.receive("response-get-keybind-key", ( keyString, textHtmlEle ) => {
        console.log("New keystring received: ", keyString);
        document.getElementById(textHtmlEle).innerText = keyString;

        // Re-enable button since new key was chosen
        let kbBtnList = Array.from(document.querySelectorAll('.keybind-btn'));
        kbBtnList.forEach(btn => btn.disabled = false);

        document.getElementById(textHtmlEle).style.backgroundColor = "inherit";
    });

    window.ipcRender.receive("response-get-user-settings", ( userSettings ) => {
        console.log("Got user settings: ", userSettings);

        if (afterGetUserSettingsCallback != null) {
            afterGetUserSettingsCallback(userSettings)
            afterGetUserSettingsCallback = null
        } else {
            console.log("WARNING: But no user settings received callback present!")
        }

    });


    // SET UP TOOLBAR
    // toggleButtonOn("mouse");
    toggleButtonOn("pen");

    colorThemeDropdownMenu = document.getElementById("color-themes-dropdown");
    colorThemeDropdownMenu.addEventListener("change", changeColorTheme);

});

function toggleButtonOn(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.style.backgroundColor = "#39686e";
    }
}

function toggleButtonOff(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.style.backgroundColor = "transparent";
    }
}

function openColorPaletteToolbar() {
    document.getElementById('toolbar-container').style.display = 'none';
    document.getElementById("colors-container").style.display = 'block';

    const colorPaletteToolbar = document.querySelector('.color-palette-toolbar');

    while (afterGetUserSettingsCallback != null) {
        console.log("Waiting for previous user settings request to finish")
    }

    afterGetUserSettingsCallback = ( newUserSettings ) => {
        let currColors = newUserSettings.selectedColors;

        for (let i = 1; i <= 10; i++) {
            const colorButton = document.createElement('button');

            colorButton.classList.add('select-color-button');
            colorButton.id = `select-color${i}`;

            // Create color box in button
            const colorBox = document.createElement('div');
            colorBox.classList.add('select-color-button-color-div');
            colorBox.style.backgroundColor = currColors[i - 1];

            colorButton.addEventListener('click', () => {
                window.ipcRender.send("change-drawing-mode-color", i);

                // Change back from palette mode to toolbar mode
                document.getElementById('toolbar-container').style.display = 'block';
                document.getElementById("colors-container").style.display = 'none';

                // Remove all color buttons from palette toolbar so we can make enw buttons later
                colorPaletteToolbar.innerHTML = '';
            });

            colorButton.appendChild(colorBox);
            colorPaletteToolbar.appendChild(colorButton);
        }
    }

    window.ipcRender.send("get-user-settings");

}

function saveScreenshot() {
    window.ipcRender.send("save-curr-screenshot");
}

function openSettings() {
    document.getElementById('toolbar-container').style.display = 'none';
    document.getElementById('settings-container').style.display = 'block';

    window.ipcRender.send("resize-window-absolute", { width: settingsWidth, height: settingsHeight });

}


function closeSettings() {
    document.getElementById('settings-container').style.display = 'none';
    document.getElementById('toolbar-container').style.display = 'block';


    window.ipcRender.send("resize-window-absolute", { width: dynamicToolbarWidth, height: dynamicToolbarHeight });
}


function switchSettingsTab(clickedBtn, toTabName) {

    var i, tabcontent, tabbtns;

    tabcontent = document.getElementsByClassName("settings-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tabbtns = document.getElementsByClassName("settings-tab-btn");
    for (i = 0; i < tabbtns.length; i++) {
        tabbtns[i].className = tabbtns[i].className.replace(" activated-btn", " unactivated-btn");
    }

    console.log(clickedBtn.className);

    document.getElementById(toTabName).style.display = "block";

    // FIX THIS
    clickedBtn.className.replace(" unactivated-btn", " activated-btn");;

    if (toTabName == "settings-colors-tab") {
        openSettingsColorTab();
    }

    if (toTabName == "settings-keybinds-tab") {
        openSettingsKeybindTab();
    }
}


function openSettingsColorTab() {

    const colorPaletteToolbar = document.getElementById('settings-color-container');
    colorPaletteToolbar.innerHTML = '';

    while (afterGetUserSettingsCallback != null) {
        console.log("Waiting for previous user settings request to finish")
    }

    afterGetUserSettingsCallback = ( newUserSettings ) => {
        let currColors = newUserSettings.selectedColors;

        for (let i = 1; i <= 10; i++) {
            const colorButton = document.createElement('button');
            // colorButton.type = 'color';

            colorButton.classList.add('select-color-button');
            colorButton.id = `select-color${i}`;

            // Create color box in button
            const colorBox = document.createElement('div');
            colorBox.classList.add('select-color-button-color-div');
            colorBox.style.backgroundColor = currColors[i - 1];


            colorButton.addEventListener('click', () => {

                let [r,g,b] = currColors[i - 1].match(/[\d\.]+/g);

                // Tell main window a color has changed
                setupColorEntry(r, g, b, (newR, newG, newB) => {
                    let newRGBA = `rgba(${newR}, ${newG}, ${newB}, 255)`;

                    console.log("Setting " + colorBox + " to " + newRGBA);
                    colorBox.style.backgroundColor = newRGBA;
                    currColors[i - 1] = newRGBA;

                    // Reset Color Themes Dropdown
                    document.getElementById('color-themes-dropdown').selectedIndex = 0;

                    window.ipcRender.send("set-color-to", { colorIndex: i, newColor: newRGBA });
                })

            });

            colorButton.appendChild(colorBox);
            colorPaletteToolbar.appendChild(colorButton);
        }

        // AColorPicker.from('.color-picker');
    }

    window.ipcRender.send("get-user-settings");
}

function openSettingsKeybindTab() {
    // Load all keybinds

    const keybindBtnsAll = document.querySelectorAll('[id^="kb-color-"]');

    while (afterGetUserSettingsCallback != null) {
        console.log("Waiting for previous user settings request to finish")
    }

    afterGetUserSettingsCallback = ( newUserSettings ) => {
        let currKeybindStr = newUserSettings.keybindStrings;

        for (let i = 0; i < keybindBtnsAll.length; i++) {
            const currKeybindBtn = keybindBtnsAll[i];
            console.log("Processing key: " + currKeybindBtn.id);

            const idStr = parseInt(currKeybindBtn.id.slice(9), 10);
            console.log("with id no: " + idStr);

            currKeybindBtn.innerHTML = currKeybindStr[idStr - 1];
        }

        // AColorPicker.from('.color-picker');
    }

    window.ipcRender.send("get-user-settings");

}

function setupColorEntry(r, g, b, callback) {

    document.getElementById('color-entry-area').style.display = 'flex';
    document.getElementById('settings-color-container-wrapper').style.display = 'none';

    // document.getElementById('red-input').value = r;
    // document.getElementById('green-input').value = g;
    // document.getElementById('blue-input').value = b;

    let rgbStr = "rgb(" + r + "," + g + "," + b + ")";
    console.log(rgbStr);
    let hexedStr = rgbToHex(rgbStr)
    console.log(hexedStr)

    Coloris({
        parent: '.color-picker',
        inline: true,
        defaultColor: hexedStr
    });

    let okBtn = document.getElementById('finish-setting-color-btn');

    // Clear all old event listeners
    let newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);

    newOkBtn.addEventListener("click", () => {
        const aftPickingValue = document.getElementById('clr-color-value').value;

        console.log(aftPickingValue);

        const convertedToRBG = rgbaToRbg(hexToRgba(aftPickingValue));

        let rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
        let result, red, green, blue = null;
        if ( (result = rgbRegex.exec(convertedToRBG)) ) {
            red = componentFromStr(result[1], result[2]);
            green = componentFromStr(result[3], result[4]);
            blue = componentFromStr(result[5], result[6]);
        }

        // const red = document.getElementById('red-input').value;
        // const green = document.getElementById('green-input').value;
        // const blue = document.getElementById('blue-input').value;

        if (red == null || green == null || blue == null) {
            alert('RGB values must be set between 0 and 255');
            return;
        }

        callback(red, green, blue);

        document.getElementById('color-entry-area').style.display = 'none';
        document.getElementById('settings-color-container-wrapper').style.display = 'block';

    })

}

function minimiseToolbar() {
    document.getElementById('toolbar-container').style.display = 'none';
    document.getElementById('minimized-container').style.display = 'block';

    window.ipcRender.send("resize-window-absolute", { width: dynamicToolbarWidth, height: dynamicToolbarMinimizedHeight });
}

function maximiseToolbar() {
    document.getElementById('toolbar-container').style.display = 'block';
    document.getElementById('minimized-container').style.display = 'none';

    window.ipcRender.send("resize-window-absolute", { width: dynamicToolbarWidth, height: dynamicToolbarHeight });
}

function changeColorTheme(event) {
    let changedTo = colorThemeDropdownMenu.value;

    window.ipcRender.send("set-color-theme", { colorThemeId: changedTo });

    openSettingsColorTab();
}

function changeColorKeybind(htmlIndexEle) {
    const buttonId = htmlIndexEle;
    console.log('Color Keybind Button clicked:', buttonId.slice(9));

    changeKeybind(htmlIndexEle, parseInt(buttonId.slice(9), 10));
}

function changeKeybind(htmlIndexEle, keybindArrIndexPlusOne) {
    console.log('Changing Keybind: ', keybindArrIndexPlusOne);
    window.ipcRender.send("change-keybind", { colorIndex: keybindArrIndexPlusOne, textHtmlEle: htmlIndexEle });

    // Make button not clickable while choosing key
    let kbBtnList = Array.from(document.querySelectorAll('.keybind-btn'));
    kbBtnList.forEach(btn => btn.disabled = true);

    document.getElementById(htmlIndexEle).style.backgroundColor = "#FF0000";
}

function openColorPicker(colorId) {
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.addEventListener('input', (event) => {
        const colorBox = document.getElementById(`color${colorId}`);
        colorBox.style.backgroundColor = event.target.value;
        console.log(`Selected color for color ${colorId}: ${event.target.value}`);

    });
    colorPicker.click();
}









function hexToRgba(hexString) {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexString)){
        c= hexString.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Hex String not in correct format: ' + hexString);
}


function componentFromStr(numStr, percent) {
    var num = Math.max(0, parseInt(numStr, 10));
    return percent ?
        Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}


function rgbToHex(rgb) {
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
        r = componentFromStr(result[1], result[2]);
        g = componentFromStr(result[3], result[4]);
        b = componentFromStr(result[5], result[6]);

        hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;
}

function rgbaToRbg(rgbaStr) {
    let edited = rgbaStr.replace(/,(?=[^,]+$).*/, ')'); // Regex from me courtesy of CS4248 (might possibly be wrong but I think its correct)
    edited = edited.replace("rgba", "rgb");
    return edited;
}

const params = new URLSearchParams(window.location.search);

let dispWidth = params.get("dispWidth");
let dispHeight = params.get("dispHeight");

let dynamicToolbarWidth = Math.floor(dispWidth / 30);
let dynamicToolbarHeight = Math.floor(dispHeight / 2);
let settingsWidth = Math.floor(dispWidth / 3.8);
let settingsHeight = Math.floor(dispHeight / 1.8);
let dynamicToolbarMinimizedHeight = Math.floor(dynamicToolbarWidth * 1);

let afterGetUserSettingsCallback = null;

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
}

function closeSettings() {
    document.getElementById('settings-container').style.display = 'none';
    document.getElementById('toolbar-container').style.display = 'block';


    window.ipcRender.send("resize-window-absolute", { width: dynamicToolbarWidth, height: dynamicToolbarHeight });
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
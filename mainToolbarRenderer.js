
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
        colorOptions: () => console.log('Palette opened'),
        clearAll: () => {
            window.ipcRender.send("select-erase-all");
        },
        save: () => console.log('Save action initiated'),
        keybindSettings: () => {
            openSettings();
        },
        minimiseToolbar: () => console.log('Minimize Toolbar activated'),
        exit: () => {
            window.ipcRender.send("close-toolbar");
        }
    };

    Object.keys(buttonActions).forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', buttonActions[id]);
        }
    });



    window.ipcRender.receive("enter-drawing-mode", () => {
        const button = document.getElementById("mouse");
        if (button) {
            button.style.backgroundColor = "#3F986D";
        }
    })

    window.ipcRender.receive("exit-drawing-mode", () => {
        const button = document.getElementById("mouse");
        if (button) {
            button.style.backgroundColor = "#2B4D3C";
        }
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

function openSettings() {
    document.getElementById('toolbar-container').style.display = 'none';
    document.getElementById('settings-container').style.display = 'block';

    window.ipcRender.send("resize-window-absolute", { width: 400, height: 600 });

}

function closeSettings() {
    document.getElementById('settings-container').style.display = 'none';
    document.getElementById('toolbar-container').style.display = 'block';


    window.ipcRender.send("resize-window-absolute", { width: 90, height: 650 });
}

function changeColorKeybind(htmlIndexEle) {
    const buttonId = htmlIndexEle;
    console.log('Color Keybind Button clicked:', buttonId.slice(9));

    changeKeybind(htmlIndexEle, parseInt(buttonId.slice(9), 10));
}

function changeKeybind(htmlIndexEle, keybindArrIndexPlusOne) {
    console.log('Changing Keybind: ', keybindArrIndexPlusOne);
    window.ipcRender.send("change-keybind", { colorIndex: keybindArrIndexPlusOne, textHtmlEle: htmlIndexEle });
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
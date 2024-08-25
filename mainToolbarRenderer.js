
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
        keybindSettings: () => console.log('Settings opened'),
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
            button.style.backgroundColor = "#396E55";
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
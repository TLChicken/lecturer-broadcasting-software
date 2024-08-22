
document.addEventListener('DOMContentLoaded', () => {
    const buttonActions = {
        select: () => console.log('Select tool activated'),
        pen: () => console.log('Pen tool activated'),
        highlighter: () => console.log('Highlighter tool activated'),
        eraser: () => console.log('Eraser tool activated'),
        startPresentation: () => console.log('Screen capture tool activated'),
        colorOptions: () => console.log('Palette opened'),
        clearAll: () => console.log('Trash tool activated'),
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
});

window.api.send("run");
window.api.receive("fromMain", (documentId, data) => {
    document.getElementById(documentId).innerHTML = data;
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('open-overlay').addEventListener('click', () => {
        window.ipcRender.send("start-overlay");
    })

    document.getElementById('close-overlay').addEventListener('click', () => {
        window.ipcRender.send("close-overlay");
    })

    document.querySelector('.color-key-list').addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON' && target.id.startsWith('kb-color')) {
            const buttonId = target.id;
            console.log('Button clicked:', buttonId.slice(8));
            // Perform actions based on the buttonId
            window.ipcRender.send("change-keybind", parseInt(buttonId.slice(8), 10));
        }
    });
});


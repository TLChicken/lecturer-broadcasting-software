
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
});

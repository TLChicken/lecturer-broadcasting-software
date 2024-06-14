
window.api.send("run");
window.api.receive("fromMain", (documentId, data) => {
    document.getElementById(documentId).innerHTML = data;
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('open-overlay').addEventListener('click', () => {
        window.controls.startOverlay("test param");
    })

    document.getElementById('close-overlay').addEventListener('click', () => {
        window.controls.closeOverlay("random param");
    })
});

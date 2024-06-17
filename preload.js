/*jshint esversion: 6 */
const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
    // Correct way is to expose 1 method per IPC message
    "api", {
        send: (channel, data) => { // Replace this
            ipcRenderer.send(channel, data);
        },
        receive: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
    }
);

contextBridge.exposeInMainWorld("controls", {
    startOverlay: ( startParams ) => {
        ipcRenderer.send("start-overlay", startParams);
    },
    closeOverlay: ( closeParams ) => {
        ipcRenderer.send("close-overlay", closeParams);
    }
})

console.log("Normal Preloader has run");
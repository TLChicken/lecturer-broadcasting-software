const {
    contextBridge,
    ipcRenderer
} = require("electron");


// contextBridge.exposeInMainWorld('canvasAPI', {
//     onCanvasDraw: (callback) => ipcRenderer.on('canvas-draw', (_event, value) => callback(value))
// })

// White-listed channels
const ipc = {
    'render': {
        // Renderer -> Main
        'send': [],
        // Main -> Renderer
        'receive': [
            'canvas-draw',
            'canvas-changeColor',
            'canvas-choose-pen',
            'canvas-choose-highlighter',
            'canvas-choose-eraser',
            'canvas-change-size-by',

            'draw-mode-activated',
            'draw-mode-unactivated'
        ],
        // Renderer -> Main -> Renderer
        'sendReceive': []
    }
};


contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    'ipcRender', {
        // From render to main.
        send: (channel, args) => {
            let validChannels = ipc.render.send;
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        // From main to render.
        receive: (channel, listener) => {
            console.log("received an event in overlay preloader");
            let validChannels = ipc.render.receive;
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`.
                ipcRenderer.on(channel, (event, ...args) => listener(...args));
            }
        },
        // From render to main and back again.
        invoke: (channel, args) => {
            let validChannels = ipc.render.sendReceive;
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, args);
            }
        }
    }
);

console.log("Overlay Preloader has run"); // Works


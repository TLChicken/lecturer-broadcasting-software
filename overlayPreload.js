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
        'send': [
            'set-menu-brush-size-slider-value',
            'pointer-down-at',
            'pointer-move-at',
            'pointer-up-at',
            'mouse-wheel-at',

            'selected-brush-by-brush-key',
            'console-log',
        ],
        // Main -> Renderer
        'receive': [
            'canvas-draw',
            'canvas-changeColor',
            'canvas-choose-pen',
            'canvas-choose-highlighter',
            'canvas-choose-eraser',

            'canvas-choose-by-brush-key',
            'canvas-insert-text',

            'canvas-change-size-by',
            'canvas-set-brush-size',

            'canvas-erase-all',

            'draw-mode-activated',
            'draw-mode-unactivated',

            'canvas-toggle-whiteboard',
            'canvas-toggle-laser-pointer',
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


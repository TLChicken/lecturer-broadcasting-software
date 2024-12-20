const {
    contextBridge,
    ipcRenderer
} = require("electron");


const ipc = {
    'render': {
        // Renderer -> Main
        'send': [
            // 'change-keybind',
            // 'get-keybind-key',
            // 'change-color',
            // 'get-current-color',
            // 'start-overlay',
            // 'close-overlay',
            // 'set-pen-brush-size-absolute',

            'toggle-drawing-mode',
            'select-pen',
            'select-highlighter',
            'select-eraser',
            'select-using-brushkey',

            'insert-text-from-clipboard',

            'select-erase-all',

            'close-toolbar',

            'resize-window-absolute',

            'change-keybind',
            'get-keybind-key',
            'change-color',
            'get-current-color',

            'get-user-settings',
            'change-drawing-mode-color',
            'save-curr-screenshot',

            'set-color-theme',
            'set-color-to',

            'toggle-slideshow-recording',
            'console-log',
        ],
        // Main -> Renderer
        'receive': [
            // 'response-get-keybind-key',
            // 'response-get-color',
            // 'set-pen-brush-size-slider-value-absolute',

            'enter-drawing-mode',
            'exit-drawing-mode',

            'activate-pen',
            'activate-highlighter',
            'activate-eraser',
            'response-slideshow-recording-btn',

            'response-get-keybind-key',
            'response-get-color',

            'response-get-user-settings',
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
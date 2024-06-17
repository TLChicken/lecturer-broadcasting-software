process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true
const {app, BrowserWindow, ipcMain, screen} = require("electron");
const runner = require('./app.js')

const { uIOhook, UiohookKey } = require('uiohook-napi');

var version = process.argv[1].replace('--', '');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainOverlayWindow;

let colorKeyBinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Numpad 1 to 0
let selectedColors = [rgba(255, 0, 0, 1),
  rgba(255, 155, 0, 1),
  rgba(255, 255, 0, 1),
  rgba(155, 255, 0, 1),
  rgba(0, 255, 0, 1),
  rgba(102, 255, 204, 1),
  rgba(51, 204, 255, 1),
  rgba(0, 102, 255, 1),
  rgba(102, 0, 255, 1),
  rgba(255, 0, 255, 1)];

function rgba(red, green, blue, alpha) {
  return "rgba(" + red + ","+ green + ","+ blue + ","+ alpha + ")";
}

let toggleDrawingKeybind = UiohookKey.Backquote; // Backquote, Tilde key
let toggleEraserKeybind = UiohookKey.E; // E
let currColor = new Uint8ClampedArray([255, 0, 0, 0]);
let isInDrawingMode = false;
let isMouseDown = false;
let lastDrawnCoors = { x: -1, y: -1};


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 750,
    webPreferences:{
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload: `${__dirname}/preload.js`,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html?version=${version}&electron=${process.versions.electron}`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    closeOverlayWindow();
  })
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const dispScaleFactor = screen.getPrimaryDisplay().scaleFactor;

  console.log(screen.getPrimaryDisplay());

  mainOverlayWindow = new BrowserWindow({
    width: width * dispScaleFactor,
    height: height * dispScaleFactor,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    hasShadow: false,
    webPreferences:{
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload: `${__dirname}/overlayPreload.js`,
      zoomFactor: 1.0 / dispScaleFactor,
    }
  });

  mainOverlayWindow.loadURL(`file://${__dirname}/overlayStart.html`);

  mainOverlayWindow.setAlwaysOnTop(true, "pop-up-menu");
  mainOverlayWindow.setFullScreen(true);
  mainOverlayWindow.setMinimizable(false);
  mainOverlayWindow.setIgnoreMouseEvents(true, {
    forward: true
  });

  mainOverlayWindow.on('closed', () => { mainOverlayWindow = null });

  console.log(`Overlay size: ${width * dispScaleFactor}x${height * dispScaleFactor}`);

  isInDrawingMode = false;
  lastDrawnCoors = { x: -1, y: -1};
}

function closeOverlayWindow() {
  if (mainOverlayWindow) {
    mainOverlayWindow.close();
    mainOverlayWindow = null;
  }
}

function drawAt(x, y) {
  if (isInDrawingMode && isMouseDown && (mainOverlayWindow != null)) {
    if (lastDrawnCoors.x == x && lastDrawnCoors.y == y) {
      // Skip drawing on the same coordinate
      console.log("Same as last coor");
    } else {
      // Send mouse coordinates to canvas renderer
      console.log("SEND pixel event at x: ", x, " and y: ", y);

      mainOverlayWindow.webContents.send('canvas-draw', {
        x: x,
        y: y,
        prevCoors: lastDrawnCoors
      });

      lastDrawnCoors = { x: x, y: y};
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  // ADD KEYBOARD SHORTCUTS
  uIOhook.on('keydown', (e) => {
    if (mainOverlayWindow != null) {
      if (toggleDrawingKeybind === e.keycode) {
        if (isInDrawingMode) {
          drawingModeOff();
        } else {
          drawingModeOn();
        }
      }

      if (toggleEraserKeybind === e.keycode) {
        // Toggle Eraser
        console.log("Eraser Toggled");
      }

      let colorSelectedCheck = colorKeyBinds.findIndex((n) => n == e.keycode);
      if (colorSelectedCheck != -1) {
        // Change color according to selected color index

        console.log("Color changing to index ", colorSelectedCheck);
        mainOverlayWindow.webContents.send('canvas-changeColor', selectedColors[colorSelectedCheck]);
      }

      console.log('Keyboard event detected: ', e);
    }
  })

  uIOhook.on('mousemove', (event) => {
    drawAt(event.x, event.y);
  });

  uIOhook.on('mousedown', (event) => {
    isMouseDown = true;
    console.log("Pressed mouse");
    drawAt(event.x, event.y);
  });

  uIOhook.on('mouseup', (event) => {
    isMouseDown = false;

    lastDrawnCoors = { x: -1, y: -1}; // So I can draw on the same location again by clicking again
  });

  uIOhook.on('wheel', (event) => {
    if (isInDrawingMode) {
      // Maybe change brush size
    }
  });

  uIOhook.start()
});

function drawingModeOn() {
  mainOverlayWindow.setIgnoreMouseEvents(false, {
    forward: false
  });

  isInDrawingMode = true;

  console.log("Started Drawing Mode");
}

function drawingModeOff() {
  mainOverlayWindow.setIgnoreMouseEvents(true, {
    forward: true
  });

  isInDrawingMode = false;

  console.log("Stopped Drawing Mode");
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit()
  //}
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("run", (event, args) => {
  runner.run(mainWindow);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("start-overlay", (event, args) => {
  if (!mainOverlayWindow) {
    createOverlayWindow();
  }
})

ipcMain.on("close-overlay", (event, args) => {
  closeOverlayWindow();
})


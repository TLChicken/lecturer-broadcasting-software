process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true
const {app, BrowserWindow, ipcMain, screen, Menu, MenuItem} = require("electron");
const shell = require('electron').shell;
const runner = require('./app.js')

const lbsConsts = require('./const');

const { uIOhook, UiohookKey, WheelDirection} = require('uiohook-napi');

var version = process.argv[1].replace('--', '');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainOverlayWindow;

let colorKeyBinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, UiohookKey.Shift, UiohookKey.P, UiohookKey.H, UiohookKey.E]; // Numpad 1 to 0
let selectedColors = lbsConsts.colorThemes_themeColors['original'];

function rgba(red, green, blue, alpha) {
  return "rgba(" + red + ","+ green + ","+ blue + ","+ alpha + ")";
}

function rgbaToRbg(rgbaStr) {
  let edited = rgbaStr.replace(/,(?=[^,]+$).*/, ')'); // Regex from me courtesy of CS4248 (might possibly be wrong but I think its correct)
  edited = edited.replace("rgba", "rgb");
  return edited;
}

// hex to RGBA converter from here: https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgba(hexString){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexString)){
    c= hexString.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
  }
  throw new Error('Hex String not in correct format: ' + hexString);
}

// RGBA to hex converter from here: https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
// CURRENTLY UNUSED
function rgba2hex(orig) {
  let a,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ?
          (rgb[1] | 1 << 8).toString(16).slice(1) +
          (rgb[2] | 1 << 8).toString(16).slice(1) +
          (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 0o1;
  }
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  hex = hex + a;

  return hex;
}


// RGB to Hex from here: https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
function componentFromStr(numStr, percent) {
  var num = Math.max(0, parseInt(numStr, 10));
  return percent ?
      Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}

function rgbToHex(rgb) {
  var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
  var result, r, g, b, hex = "";
  if ( (result = rgbRegex.exec(rgb)) ) {
    r = componentFromStr(result[1], result[2]);
    g = componentFromStr(result[3], result[4]);
    b = componentFromStr(result[5], result[6]);

    hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  return hex;
}


// let toggleDrawingKeybind = UiohookKey.Backquote; // Backquote, Tilde key
let toggleEraserKeybind = UiohookKey.E; // E
let currColor = new Uint8ClampedArray([255, 0, 0, 0]);
let isInDrawingMode = false;
let isMouseDown = false;
let lastDrawnCoors = { x: -1, y: -1};

let currentlyChangingKeybindCallback = null;


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
  mainOverlayWindow.setResizable(false);
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
    if (currentlyChangingKeybindCallback != null) {
      currentlyChangingKeybindCallback(e.keycode);
      currentlyChangingKeybindCallback = null;
      return; // Dont trigger actual functions of keybind while setting it
    }

    if (mainOverlayWindow != null) {
      if (colorKeyBinds[lbsConsts.keybindIndex_toggleOverlay] === e.keycode && e.ctrlKey) {
        if (isInDrawingMode) {
          drawingModeOff();
        } else {
          drawingModeOn();
        }
      }

      if (colorKeyBinds[lbsConsts.keybindIndex_selectPen] === e.keycode) {
        // Toggle Pen
        console.log("Pen Toggled");
        mainOverlayWindow.webContents.send('canvas-choose-pen', "param");
      }

      if (colorKeyBinds[lbsConsts.keybindIndex_selectHighlighter] === e.keycode) {
        // Toggle Highlighter
        console.log("Highlighter Toggled");
        mainOverlayWindow.webContents.send('canvas-choose-highlighter', "param");
      }

      if (colorKeyBinds[lbsConsts.keybindIndex_selectEraser] === e.keycode) {
        // Toggle Eraser
        console.log("Eraser Toggled");
        mainOverlayWindow.webContents.send('canvas-choose-eraser', "param");
      }

      let colorSelectedCheck = colorKeyBinds.findIndex((n) => n == e.keycode);
      if (colorSelectedCheck != -1 && colorSelectedCheck < 10) { // Check less than 10 as we only want to check for color keybinds
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
      // Change brush size
      if (event.direction == WheelDirection.VERTICAL) {
        // console.log("SCROLL Rotation: " + event.rotation);
        // Scroll UP = -1
        // Scroll DOWN = 1  (page moves down when u scroll on windows)

        mainOverlayWindow.webContents.send('canvas-change-size-by', -event.rotation);
      }
    }
  });

  uIOhook.start()

  const mainMenu = Menu.buildFromTemplate(menuTemplate)

  let colorThemesSubMenuArr = [];

  // Build Color Themes Menu
  for (let i = 0; i < lbsConsts.colorThemes_keys.length; i++) {
    const currKey = lbsConsts.colorThemes_keys[i];
    const themeName = lbsConsts.colorThemes_themeNames[currKey];
    const themeColors = lbsConsts.colorThemes_themeColors[currKey];

    let currThemeMenuItem = new MenuItem({
      click(thisMenuItem, thisBrowserWindow, thisKeyboardEvent) {
        setColorsFromTheme(currKey);
      },
      label: themeName
    });

    colorThemesSubMenuArr.push(currThemeMenuItem);
  }

  let colorThemesMenu = new MenuItem({
    label: "Color Themes",
    type: "submenu",
    submenu: colorThemesSubMenuArr
  });

  mainMenu.append(colorThemesMenu);

  Menu.setApplicationMenu(mainMenu)
});

let menuTemplate = [
  {
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        role: 'toggledevtools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },

  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },

  {
    role: 'Help',
    submenu: [
      {
        label:'Future Homepage',
        click() {
          shell.openExternal('https://github.com/')
        }
      },
      {
        label:'Guide',
        click() {
          shell.openExternal('https://tlchicken.github.io/')
        }
      }
    ]
  }
];

function setColorsFromTheme(themeKey) {
  let selectedTheme_colorArray = lbsConsts.colorThemes_themeColors[themeKey];
  selectedColors = selectedTheme_colorArray;

  // Update display of colors on control panel
  for (let i = 0; i < selectedColors.length; i++) {
    let currColor = selectedColors[i];
    let currColorHex = rgbToHex(rgbaToRbg(currColor));
    let colorInputHtmlEleName =  "color" + (i + 1).toString();

    console.log("TEST " + rgbaToRbg(currColor));

    console.log("Setting Color " + i + " to " + currColor + " hex: " + currColorHex + "   HTML ELE: " + colorInputHtmlEleName);
    mainWindow.webContents.send('response-get-color', currColorHex, colorInputHtmlEleName);
  }

}


// PRE CONDITIONS: The overlay window is alr open
function drawingModeOn() {
  mainOverlayWindow.setIgnoreMouseEvents(false, {
    forward: false
  });

  isInDrawingMode = true;

  mainOverlayWindow.webContents.send('draw-mode-activated', "param");

  console.log("Started Drawing Mode");
}

// PRE CONDITIONS: The overlay window is alr open
function drawingModeOff() {
  mainOverlayWindow.setIgnoreMouseEvents(true, {
    forward: true
  });

  isInDrawingMode = false;

  mainOverlayWindow.webContents.send('draw-mode-unactivated', "param");

  console.log("Stopped Drawing Mode");
}

function changeKeybind(keybindIndex, changedSuccessfullyCallback) {
  // Next time pop up a please enter key window

  currentlyChangingKeybindCallback = ( detectedKey ) => {
    // Put into keybind array
    if (colorKeyBinds.includes(detectedKey)) {
      // Display Error
      console.log("Keybind not changed, CONFLICTING KEY")
    } else {
      colorKeyBinds[keybindIndex - 1] = detectedKey;
      console.log("Keybind Changed Successfully");
      console.log(lbsConsts.UiohookKeyREVERSE[detectedKey]);

      changedSuccessfullyCallback(lbsConsts.UiohookKeyREVERSE[detectedKey]);
    }
  }

}

function changeColor(colorIndex, newColor, changedSuccessfullyCallback) {
  // Next time pop up a please enter key window

  selectedColors[colorIndex - 1] = hexToRgba(newColor);
  console.log("Color " + colorIndex + " Changed Successfully to " + newColor + "   converted: " + hexToRgba(newColor));
  console.log("New value in arr: " + selectedColors[colorIndex - 1]);
  changedSuccessfullyCallback(newColor);

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

ipcMain.on("change-keybind", (event, args) => {
  console.log("Change Keybind Event RECEIVED");
  console.log(args);
  changeKeybind(args.colorIndex, ( newKeyString ) => {
    mainWindow.webContents.send('response-get-keybind-key', newKeyString, args.textHtmlEle)
  });
})


ipcMain.on("change-color", (event, args) => {
  console.log("Change Color Event RECEIVED");
  console.log(args);
  changeColor(args.colorIndex, args.newColor, ( newColorString ) => {
    mainWindow.webContents.send('response-get-color', rgbToHex(rgbaToRbg(newColorString)), args.textHtmlEle)
  });
})

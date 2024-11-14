

function rgba(red, green, blue, alpha) {
    return "rgba(" + red + ","+ green + ","+ blue + ","+ alpha + ")";
}

function rgb(red, green, blue) {
    return "rgb(" + red + ","+ green + ","+ blue + ")";
}

function changeAlphaRgba(rgbaStr, newAlpha) {
    let alphaCommaIndex = rgbaStr.lastIndexOf(",");
    let removedOldAlphaRgbaStr = rgbaStr.slice(0, alphaCommaIndex);

    return removedOldAlphaRgbaStr + "," + newAlpha + ")";
}


function getIntermediateCoordinates(coor1, coor2, numPixelsApart) {
    let x1 = coor1.x;
    let x2 = coor2.x;
    let y1 = coor1.y;
    let y2 = coor2.y;

    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const numPoints = Math.ceil(distance / numPixelsApart);

    const xStep = (x2 - x1) / distance * numPixelsApart;
    const yStep = (y2 - y1) / distance * numPixelsApart;

    const coordinates = [];

    for (let i = 1; i <= numPoints; i++) {
        console.log("Adding coor ", i);
        const x = Math.floor(x1 + i * xStep);
        const y = Math.floor(y1 + i * yStep);
        coordinates.push({ x, y });
    }

    return coordinates;
}

class BrushType {
    static get ADD_PIXEL () {
        return 0;
    }

    static get REMOVE_PIXEL () {
        return 1;
    }
}

class CanvasLayerOrdering {
    static get MAIN_LAYER () {
        return 0;
    }

    static get SINGLE_OPACITY_HIGHLIGHTER_LAYER () {
        return 1;
    }

    static get ALL_LAYERS () {
        return -1;
    }
}


class Brush {
    constructor() {
        if (this.constructor === Brush) {
            throw new Error("Cannot instantiate Brush interface");
        }
        this.color = null;
        this.size = null;
    }

    getBrushType() {
        return BrushType.ADD_PIXEL;
    }

    getCanvasLayer() {
        return CanvasLayerOrdering.MAIN_LAYER;
    }

    getBrushKey() {
        return "unknown-brush";
    }

    setColor(newColor) {
        throw new Error("Must override setColor method");
    }

    setSize(newSize) {
        throw new Error("Must override setSize method");
    }

    drawAtCoor(x, y, prevCoors) {
        throw new Error("Must override drawAtCoor method");
    }

    getPathsToDraw(x, y, prevCoors) {
        throw new Error("Must override getPathsToDraw method");
    }

    getMouseCursorPath(x, y) {
        throw new Error("Must override getMouseCursorPath method");
    }
}

class TLCBrush extends Brush {
    constructor(color = rgba(255, 0, 0, 1), size = 10) {
        super();

        let adjustedOpacityColor = changeAlphaRgba(color, 1);

        this.color = adjustedOpacityColor;
        this.size = size;
    }

    getBrushKey() {
        return "pen_round";
    }

    setColor(newColor) {
        this.color = newColor;
    }

    setSize(newSize) {
        this.size = newSize;
    }

    internalDrawAtCoor(x, y) {
        return {
            color: this.color,
            x: Math.floor(x - (this.size / 2)),
            y: Math.floor(y - (this.size / 2)),
            w: this.size,
            h: this.size
        }
    }

    drawAtCoor(x, y, prevCoors) {
        if (prevCoors.x == -1 && prevCoors.y == -1) {
            return [this.internalDrawAtCoor(x, y)];
        } else {
            console.log(prevCoors);
            // Mouse was moved fast, need to fill in the area in between
            let intermediateCoors = getIntermediateCoordinates(prevCoors, {x: x, y: y}, 1);

            console.log(intermediateCoors);

            let drawCoors = intermediateCoors.map(( coor ) => {
                return this.internalDrawAtCoor(coor.x, coor.y);
            });

            console.log(drawCoors);

            return drawCoors;
        }
    }

    internalGetPathToDraw(x, y) {
        let fillPath = new Path2D();

        fillPath.arc(x, y, this.size / 2, 0, 2 * Math.PI);

        return {
            path2d: fillPath,
            color: this.color
        };
    }

    getPathsToDraw(x, y, prevCoors) {
        if (prevCoors.x == -1 && prevCoors.y == -1) {
            return [this.internalGetPathToDraw(x, y)];
        } else {
            console.log(prevCoors);
            // Mouse was moved fast, need to fill in the area in between
            let intermediateCoors = getIntermediateCoordinates(prevCoors, {x: x, y: y}, 1);

            console.log(intermediateCoors);

            let pathsToDraw = intermediateCoors.map(( coor ) => {
                return this.internalGetPathToDraw(coor.x, coor.y);
            });

            console.log(pathsToDraw);

            return pathsToDraw;
        }
    }

    getMouseCursorPath(x, y) {
        let cursorPath = new Path2D();

        cursorPath.arc(x, y, this.size / 2, 0, 2 * Math.PI);

        // Temp Square Cursor
        // cursorPath.rect(Math.floor(x - (this.size / 2)), Math.floor(y - (this.size / 2)), this.size, this.size);


        return cursorPath;
    }

}

class TLCSquareBrush extends Brush {
    constructor(color = rgba(255, 0, 0, 1), size = 10) {
        super();

        let adjustedOpacityColor = changeAlphaRgba(color, 1);

        this.color = adjustedOpacityColor;
        this.size = size;
    }

    getBrushKey() {
        return "pen_square";
    }

    setColor(newColor) {
        this.color = newColor;
    }

    setSize(newSize) {
        this.size = newSize;
    }

    internalGetPathToDraw(x, y) {
        let fillPath = new Path2D();

        fillPath.rect(Math.floor(x - (this.size / 2)), Math.floor(y - (this.size / 2)), this.size, this.size);

        return {
            path2d: fillPath,
            color: this.color
        };
    }

    getPathsToDraw(x, y, prevCoors) {
        if (prevCoors.x == -1 && prevCoors.y == -1) {
            return [this.internalGetPathToDraw(x, y)];
        } else {
            console.log(prevCoors);
            // Mouse was moved fast, need to fill in the area in between
            let intermediateCoors = getIntermediateCoordinates(prevCoors, {x: x, y: y}, 1);

            console.log(intermediateCoors);

            let pathsToDraw = intermediateCoors.map(( coor ) => {
                return this.internalGetPathToDraw(coor.x, coor.y);
            });

            console.log(pathsToDraw);

            return pathsToDraw;
        }
    }

    getMouseCursorPath(x, y) {
        let cursorPath = new Path2D();

        cursorPath.rect(Math.floor(x - (this.size / 2)), Math.floor(y - (this.size / 2)), this.size, this.size);

        return cursorPath;
    }

}

class TLCHighlighter extends Brush {
    constructor(color = rgba(255, 0, 0, 0.2), size = 10) {
        super();

        let adjustedOpacityColor = changeAlphaRgba(color, 0.2);

        this.color = adjustedOpacityColor;
        this.size = size;
    }

    getBrushKey() {
        return "multiple_opac_highlighter";
    }

    setColor(newColor) {
        // Make lighter color
        let newColorArr = newColor.replace(/[^\d,]/g, '').split(',');
        this.color = rgba(newColorArr[0], newColorArr[1], newColorArr[2], 0.2);
    }

    setSize(newSize) {
        this.size = newSize;
    }

    internalDrawAtCoor(x, y) {
        // Next time only draw the change in height difference to prevent the lines glitch thing
        return {
            color: this.color,
            x: x,
            y: y - this.size,
            w: 1,
            h: this.size * 2
        }
    }

    drawAtCoor(x, y, prevCoors) {
        if (prevCoors.x == -1 && prevCoors.y == -1) {
            return [this.internalDrawAtCoor(x, y)];
        } else {
            console.log(prevCoors);
            // Mouse was moved fast, need to fill in the area in between
            let intermediateCoors = getIntermediateCoordinates(prevCoors, {x: x, y: y}, 1);

            console.log(intermediateCoors);

            let drawCoors = intermediateCoors.map(( coor ) => {
                return this.internalDrawAtCoor(coor.x, coor.y);
            });

            console.log(drawCoors);

            return drawCoors;
        }
    }

    internalGetPathToDraw(x, y) {
        let fillPath = new Path2D();

        fillPath.rect(x, y - this.size, 3, this.size * 2);

        return {
            path2d: fillPath,
            color: this.color
        };
    }

    getPathsToDraw(x, y, prevCoors) {
        if (prevCoors.x == -1 && prevCoors.y == -1) {
            return [this.internalGetPathToDraw(x, y)];
        } else {
            console.log(prevCoors);
            // Mouse was moved fast, need to fill in the area in between
            let intermediateCoors = getIntermediateCoordinates(prevCoors, {x: x, y: y}, 1);

            console.log(intermediateCoors);

            let pathsToDraw = intermediateCoors.map(( coor ) => {
                return this.internalGetPathToDraw(coor.x, coor.y);
            });

            console.log(pathsToDraw);

            return pathsToDraw;
        }
    }

    getMouseCursorPath(x, y) {
        let cursorPath = new Path2D();

        cursorPath.rect(x, y - this.size, 3, this.size * 2);

        return cursorPath;
    }
}

class SingleOpacityHighlighter extends TLCHighlighter {
    constructor(color = rgba(255, 0, 0, 1), size = 10) {
        super();

        // Alpha was 0.2
        let adjustedOpacityColor = changeAlphaRgba(color, 1);

        this.color = adjustedOpacityColor;
        this.size = size;
    }

    getBrushKey() {
        return "single_opac_highlighter";
    }

    getCanvasLayer() {
        return CanvasLayerOrdering.SINGLE_OPACITY_HIGHLIGHTER_LAYER;
    }

    setColor(newColor) {
        // Make lighter color
        let newColorArr = newColor.replace(/[^\d,]/g, '').split(',');
        this.color = rgba(newColorArr[0], newColorArr[1], newColorArr[2], 1); // Alpha was 0.2
    }
}

class TLCEraser extends Brush {
    constructor(color = rgba(0, 0, 0, 0), size = 30) {
        super();
        this.color = color;
        this.size = size;
    }

    getBrushType() {
        return BrushType.REMOVE_PIXEL;
    }

    getCanvasLayer() {
        return CanvasLayerOrdering.ALL_LAYERS;
    }

    getBrushKey() {
        return "eraser";
    }

    setColor(newColor) {
        // Make lighter color
        let newColorArr = newColor.replace(/[^\d,]/g, '').split(',');
        this.color = rgba(newColorArr[0], newColorArr[1], newColorArr[2], 0);
    }

    setSize(newSize) {
        this.size = newSize;
    }

    internalDrawAtCoor(x, y) {
        // Next time only draw the change in height difference to prevent the lines glitch thing
        return {
            color: this.color,
            x: Math.floor(x - (this.size / 2)),
            y: Math.floor(y - (this.size / 2)),
            w: this.size,
            h: this.size
        }
    }

    drawAtCoor(x, y, prevCoors) {
        if (prevCoors.x == -1 && prevCoors.y == -1) {
            return [this.internalDrawAtCoor(x, y)];
        } else {
            console.log(prevCoors);
            // Mouse was moved fast, need to fill in the area in between
            let intermediateCoors = getIntermediateCoordinates(prevCoors, {x: x, y: y}, 1);

            console.log(intermediateCoors);

            let drawCoors = intermediateCoors.map(( coor ) => {
                return this.internalDrawAtCoor(coor.x, coor.y);
            });

            console.log(drawCoors);

            return drawCoors;
        }
    }

    getMouseCursorPath(x, y) {
        let cursorPath = new Path2D();

        cursorPath.rect(Math.floor(x - (this.size / 2)), Math.floor(y - (this.size / 2)), this.size, this.size);

        return cursorPath;
    }
}

let brushKeyToBrush = {
    'pen_square': TLCSquareBrush,
    'pen_round': TLCBrush,

    'multiple_opac_highlighter': TLCHighlighter,
    'single_opac_highlighter': SingleOpacityHighlighter,

    'eraser': TLCEraser,
}

const params = new URLSearchParams(window.location.search);

let currBrush = new TLCBrush(params.get("beginBrushColor"), params.get("beginBrushSize"));

let previousBrush = new TLCBrush(params.get("beginBrushColor"), params.get("beginBrushSize"));

let drawingBrushSize = 10;
let erasingBrushSize = 30;

let isInDrawingMode = false;

let settingTextInfo = null;

let isLaserPointerOn = false;


function getPointOnCanvas(c, x, y) {
    let box = c.getBoundingClientRect();

    return {
        x: x - box.left * (c.width / box.width),
        y: y - box.top  * (c.height / box.height)
    };
}

function drawRectangle(ctx, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawAtCoor(canvasLayers, x, y, lastDrawnCoors) {

    const c = canvasLayers.mainC;
    const ctx = c.getContext('2d');

    const highlighterC = canvasLayers.highlighterC;
    const highlighterCtx = highlighterC.getContext('2d');

    const contextLayers = [ctx, highlighterCtx];

    let canvasCoors = getPointOnCanvas(canvasLayers.topMostLayer, x, y);
    console.log("Drawing pixel at x: ", canvasCoors.x, "  y: ", canvasCoors.y);


    if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
        const selectedLayerNo = currBrush.getCanvasLayer();

        // Refactored and redid implementation for drawing to use Path2D instead of coors as its more efficient
        let brushResults = currBrush.getPathsToDraw(canvasCoors.x, canvasCoors.y, lastDrawnCoors);

        if (selectedLayerNo != CanvasLayerOrdering.ALL_LAYERS) {
            brushResults.forEach((brushResult) => {
                // if (brushResult.x >= 0 && brushResult.y >= 0) {
                    // drawRectangle(contextLayers[selectedLayerNo], brushResult.color, brushResult.x, brushResult.y, brushResult.w, brushResult.h);

                contextLayers[selectedLayerNo].fillStyle = brushResult.color;
                contextLayers[selectedLayerNo].fill(brushResult.path2d);
                // }
            })
        } else {
            // Draw on all layers (This would never be used)
            console.log("WARNING: ADD PIXEL on all layers called");

        }
    } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
        const selectedLayerNo = currBrush.getCanvasLayer();

        // Erasing cannot be done using Path2Ds
        let brushResults = currBrush.drawAtCoor(canvasCoors.x, canvasCoors.y, lastDrawnCoors);


        if (selectedLayerNo != CanvasLayerOrdering.ALL_LAYERS) {
            // Erase from 1 layer only - CURRENTLY UNUSED
            brushResults.forEach((brushResult) => {
                if (brushResult.x >= 0 && brushResult.y >= 0) {
                    contextLayers[selectedLayerNo].clearRect(brushResult.x, brushResult.y, brushResult.w, brushResult.h);
                }
            })

        } else {
            // Erase from all layers
            brushResults.forEach((brushResult) => {
                if (brushResult.x >= 0 && brushResult.y >= 0) {
                    ctx.clearRect(brushResult.x, brushResult.y, brushResult.w, brushResult.h);
                    highlighterCtx.clearRect(brushResult.x, brushResult.y, brushResult.w, brushResult.h);
                }
            })
        }
    } else {
        console.log("UNKNOWN Brush Type " + currBrush.getBrushType().toString());
    }

}

function toggleZoomScreen() {
    document.body.style.zoom = (1 / window.devicePixelRatio);
}

function drawBorder(ctx, borderColor) {
    const borderThickness = 5;

    // Vertical Bounds
    drawRectangle(ctx, borderColor, 0, 0, borderThickness, window.innerHeight);
    drawRectangle(ctx, borderColor, window.innerWidth - borderThickness, 0, borderThickness, window.innerHeight);

    // Horizontal Bounds
    drawRectangle(ctx, borderColor, borderThickness, 0, window.innerWidth - (2 * borderThickness), borderThickness);
    // drawRectangle(ctx, borderColor, borderThickness, window.innerHeight - borderThickness, window.innerWidth - (2 * borderThickness), borderThickness);

}

function eraseBorder(ctx) {
    const borderThickness = 5;

    // Vertical Bounds
    ctx.clearRect(0, 0, borderThickness, window.innerHeight);
    ctx.clearRect(window.innerWidth - borderThickness, 0, borderThickness, window.innerHeight);

    // Horizontal Bounds
    ctx.clearRect(borderThickness, 0, window.innerWidth - (2 * borderThickness), borderThickness);
    ctx.clearRect(borderThickness, window.innerHeight - borderThickness, window.innerWidth - (2 * borderThickness), borderThickness);

}


// So I can redraw mouse cursor when scroll wheel is used even though mouse did not move
let previousRedrawX = 0;
let previousRedrawY = 0;

function redrawMouseCursor(c, ctx, x = previousRedrawX, y = previousRedrawY) {
    previousRedrawX = x;
    previousRedrawY = y;

    clearCanvas(c, ctx);

    let canvasCoor = getPointOnCanvas(c, x, y);

    let currPath = currBrush.getMouseCursorPath(canvasCoor.x, canvasCoor.y);

    // console.log(currPath);

    ctx.stroke(currPath);

}

function redrawLaserPointer(laserPointerCanvas, laserPointerCtx, x = previousRedrawX, y = previousRedrawY) {
    clearCanvas(laserPointerCanvas, laserPointerCtx);

    let canvasCoor = getPointOnCanvas(laserPointerCanvas, x, y);

    let laserPath = new Path2D();
    laserPath.arc(x, y, 12, 0, 2 * Math.PI);
    const innerGradient = laserPointerCtx.createRadialGradient(x, y, 10, x, y, 2);
    innerGradient.addColorStop(0, "red");
    innerGradient.addColorStop(1, "white");

    laserPointerCtx.fillStyle = innerGradient;
    laserPointerCtx.fill(laserPath);



    let laserBorder = new Path2D();
    laserBorder.arc(x, y, 17, 0, 2 * Math.PI);
    laserBorder.arc(x, y, 15, 0, 2 * Math.PI, true);

    laserPointerCtx.fill(laserBorder);

}


function clearCanvas(c, ctx) {
    ctx.clearRect(0, 0, c.width, c.height);
}

function drawTextOnCanvas(c, ctx, x, y, theText, fontSize, fontColor) {
    ctx.save();
    ctx.font = fontSize.toString() + "px serif";
    ctx.fillStyle = fontColor;

    ctx.fillText(theText, x, y);

    window.ipcRender.send("console-log", "Text: " + theText + "  " + ctx.font + "    " + ctx.fillStyle)

    ctx.restore();
}


document.addEventListener('DOMContentLoaded', (event) => {

    const whiteboardCanvas = document.getElementById('whiteboardCanvas');
    const whiteboardCtx = whiteboardCanvas.getContext('2d');
    whiteboardCanvas.width = window.innerWidth;
    whiteboardCanvas.height = window.innerHeight;

    const c = document.getElementById('overlayCanvas');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const highlighterCanvas = document.getElementById('highlighterCanvas');
    const highlighterCtx = highlighterCanvas.getContext('2d');
    highlighterCanvas.width = window.innerWidth;
    highlighterCanvas.height = window.innerHeight;

    const laserPointerCanvas = document.getElementById('laserPointerCanvas');
    const laserPointerCtx = laserPointerCanvas.getContext('2d');
    laserPointerCanvas.width = window.innerWidth;
    laserPointerCanvas.height = window.innerHeight;

    const mouseCursorCanvas = document.getElementById('mouseCursorCanvas');
    const mouseCursorCtx = mouseCursorCanvas.getContext('2d');
    mouseCursorCanvas.width = window.innerWidth;
    mouseCursorCanvas.height = window.innerHeight;
    mouseCursorCtx.strokeStyle = 'black';

    const canvasLayers = { mainC: c, highlighterC: highlighterCanvas, laserPointerC: laserPointerCanvas, mouseCursorC: mouseCursorCanvas, topMostLayer: mouseCursorCanvas };

    console.log(window);
    console.log(window.innerWidth);


    canvasLayers.topMostLayer.addEventListener("pointerdown", ( e ) => {
        if (settingTextInfo != null) {

            let canvasCoor = getPointOnCanvas(mouseCursorCanvas, e.x, e.y);

            clearCanvas(mouseCursorCanvas, mouseCursorCtx);
            drawTextOnCanvas(c, ctx, canvasCoor.x, canvasCoor.y, settingTextInfo.theText, settingTextInfo.fontSize, settingTextInfo.fontColor);

            // Stop text drawing action
            settingTextInfo = null;

            return;
        }

        window.ipcRender.send("pointer-down-at", { x: e.x, y: e.y });
    })

    canvasLayers.topMostLayer.addEventListener("pointermove", ( e ) => {
        window.ipcRender.send("pointer-move-at", { x: e.x, y: e.y });

        // window.ipcRender.send("console-log", "Setting-text-info: " + settingTextInfo.theText + "  " + settingTextInfo.fontSize + "  " + settingTextInfo.fontColor);


        if (settingTextInfo != null) {

            let canvasCoor = getPointOnCanvas(mouseCursorCanvas, e.x, e.y);

            clearCanvas(mouseCursorCanvas, mouseCursorCtx);
            drawTextOnCanvas(mouseCursorCanvas, mouseCursorCtx, canvasCoor.x, canvasCoor.y, settingTextInfo.theText, settingTextInfo.fontSize, changeAlphaRgba(settingTextInfo.fontColor, 0.6));

            // Dont draw the normal mouse cursor anymore
            return;
        }

        if (isInDrawingMode) {
            redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx, e.x, e.y);
        }

        if (isLaserPointerOn) {
            redrawLaserPointer(laserPointerCanvas, laserPointerCtx, e.x, e.y);
        }
    })

    canvasLayers.topMostLayer.addEventListener("pointerup", ( e ) => {
        window.ipcRender.send("pointer-up-at", { x: e.x, y: e.y })
    })

    canvasLayers.topMostLayer.addEventListener("wheel", ( e ) => {
        window.ipcRender.send("mouse-wheel-at", { scrollAmt: e.deltaY })
    })

    window.ipcRender.receive('canvas-draw', ( coors ) => {
        console.log("Canvas Draw Event Received");
        drawAtCoor(canvasLayers, coors.x, coors.y, coors.prevCoors);
    });

    window.ipcRender.receive('canvas-changeColor', ( newColor ) => {
        console.log('Canvas Change Color Event Received');

        if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
            currBrush = previousBrush;
            redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx);

            window.ipcRender.send('selected-brush-by-brush-key', currBrush.getBrushKey());
        }

        currBrush.setColor(newColor);
    });

    // window.ipcRender.receive('canvas-choose-pen', ( param ) => {
    //     console.log("PEN chosen");
    //     currBrush = new TLCBrush(changeAlphaRgba(currBrush.color, 1), drawingBrushSize);
    //
    //     window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: drawingBrushSize });
    //
    //     if (isInDrawingMode) {
    //         redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx);
    //     }
    // });
    //
    // window.ipcRender.receive('canvas-choose-highlighter', ( param ) => {
    //     console.log("Highlighter chosen");
    //     currBrush = new SingleOpacityHighlighter(changeAlphaRgba(currBrush.color, 0.2), drawingBrushSize);
    //
    //     window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: drawingBrushSize });
    //
    //     if (isInDrawingMode) {
    //         redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx);
    //     }
    // });
    //
    // window.ipcRender.receive('canvas-choose-eraser', ( param ) => {
    //     console.log("Eraser chosen");
    //     currBrush = new TLCEraser(currBrush.color, erasingBrushSize);
    //
    //     window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: erasingBrushSize });
    //
    //     if (isInDrawingMode) {
    //         redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx);
    //     }
    // });

    window.ipcRender.receive('canvas-choose-by-brush-key', ( args ) => {
        console.log("BRUSH KEY chosen: " + args.toString());
        let theNewBrushClass = brushKeyToBrush[args.brushKey];
        let currBrushData = args.currBrushData;

        if (currBrush.getBrushType() != BrushType.REMOVE_PIXEL) {
            previousBrush = currBrush;
        }

        currBrush = new theNewBrushClass(currBrushData.color, currBrushData.size);

        // window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: currBrushData.size });

        if (isInDrawingMode) {
            redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx);
        }
    });

    window.ipcRender.receive('canvas-insert-text', ( args ) => {
        // window.ipcRender.send("console-log", "Insert Text received: " + args.theText + "  " + args.fontColor + "  " + args.fontSize);

        settingTextInfo = {
            theText: args.theText,
            fontColor: args.fontColor, // After going through ipcRenderer everything is converted to String automatically
            fontSize:  Math.max(parseInt(args.fontSize) * 2, 20)
        }

    })



    window.ipcRender.receive('draw-mode-activated', ( param ) => {
        console.log("Draw Mode activated");
        const borderColor = rgba(0, 165, 255, 0.3);
        eraseBorder(ctx);
        drawBorder(ctx, borderColor);

        isInDrawingMode = true;
    });

    window.ipcRender.receive('draw-mode-unactivated', ( param ) => {
        console.log("Draw Mode UNactivated");
        const borderColor = rgba(170, 170, 170, 0.3);
        eraseBorder(ctx);
        drawBorder(ctx, borderColor);

        clearCanvas(mouseCursorCanvas, mouseCursorCtx);

        isInDrawingMode = false;
    });

    // window.ipcRender.receive('canvas-change-size-by', ( sizeOffset ) => {
    //     console.log("Changing size of brush");
    //     if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
    //         drawingBrushSize = Math.max(1, drawingBrushSize + sizeOffset);
    //         drawingBrushSize = Math.min(200, drawingBrushSize);
    //         currBrush.setSize(drawingBrushSize);
    //
    //         window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: drawingBrushSize });
    //
    //     } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
    //
    //         const oldSize = erasingBrushSize;
    //
    //         erasingBrushSize = Math.max(1, erasingBrushSize + sizeOffset);
    //         erasingBrushSize = Math.min(200, erasingBrushSize);
    //
    //         if (isNaN(erasingBrushSize)) {
    //             erasingBrushSize = oldSize;
    //         }
    //
    //         currBrush.setSize(erasingBrushSize);
    //
    //         console.log("ERASER Size Offset: " + sizeOffset + "   Old Size: " + oldSize + "   New Size: " + erasingBrushSize);
    //
    //         window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: erasingBrushSize });
    //
    //     } else {
    //         console.log("Unknown Brush Type Detected - Changing size of brush");
    //     }
    //
    //
    // });

    window.ipcRender.receive('canvas-set-brush-size', ( newBrushSize, brushType ) => {
        let considerationBrushType = currBrush.getBrushType();

        if (brushType != null) {
            considerationBrushType = brushType;
        }

        console.log("Changing size of brush ABSOLUTE");
        if (considerationBrushType == BrushType.ADD_PIXEL) {
            drawingBrushSize = newBrushSize;

            if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
                currBrush.setSize(drawingBrushSize);
            }
        } else if (considerationBrushType == BrushType.REMOVE_PIXEL) {
            erasingBrushSize = newBrushSize;

            if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
                currBrush.setSize(erasingBrushSize);
            }
        } else {
            console.log("Unknown Brush Type Detected - Changing size of brush");
        }


        if (isInDrawingMode) {
            redrawMouseCursor(mouseCursorCanvas, mouseCursorCtx);
        }
    });

    window.ipcRender.receive('canvas-erase-all', () => {
        console.log("Canvas Erase All Event Received");

        const canvasLayersArr = Object.values(canvasLayers);
        canvasLayersArr.forEach( (currC) => {
            const currCtx = currC.getContext('2d');
            currCtx.clearRect(0, 0, currC.width, currC.height);

            let borderColor = rgba(170, 170, 170, 0.3);
            if (isInDrawingMode) {
                borderColor = rgba(0, 165, 255, 0.3);
            }
            eraseBorder(ctx);
            drawBorder(ctx, borderColor);
        })
    });


    window.ipcRender.receive('canvas-toggle-whiteboard', ( isToggleOn ) => {
        window.ipcRender.send("console-log", "Toggle Whiteboard received in Overlay to: " + isToggleOn);

        if (!isToggleOn) {
            clearCanvas(whiteboardCanvas, whiteboardCtx);
        } else {
            drawRectangle(whiteboardCtx, rgb(255, 255, 255), 0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
        }

    })

    window.ipcRender.receive('canvas-toggle-laser-pointer', ( isToggleOn ) => {
        window.ipcRender.send("console-log", "Toggle Laser Pointer received in Overlay to: " + isToggleOn);

        if (!isToggleOn) {
            // Remove laser pointer
            isLaserPointerOn = false;
            clearCanvas(laserPointerCanvas, laserPointerCtx);
        } else {
            // Start laser pointer
            isLaserPointerOn = true;
            redrawLaserPointer(laserPointerCanvas, laserPointerCtx);
        }

    })


    const borderColor = rgba(170, 170, 170, 0.3);
    drawBorder(ctx, borderColor);

    console.log("Overlay Render DOMContentLoaded ran");

});
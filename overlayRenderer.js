
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

    setColor(newColor) {
        throw new Error("Must override setColor method");
    }

    setSize(newSize) {
        throw new Error("Must override setSize method");
    }

    drawAtCoor(x, y, prevCoors) {
        throw new Error("Must override drawAtCoor method");
    }
}

class TLCBrush extends Brush {
    constructor(color = rgba(255, 0, 0, 1), size = 10) {
        super();

        let adjustedOpacityColor = changeAlphaRgba(color, 1);

        this.color = adjustedOpacityColor;
        this.size = size;
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

}

class TLCHighlighter extends Brush {
    constructor(color = rgba(255, 0, 0, 0.2), size = 10) {
        super();

        let adjustedOpacityColor = changeAlphaRgba(color, 0.2);

        this.color = adjustedOpacityColor;
        this.size = size;
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

}

class SingleOpacityHighlighter extends TLCHighlighter {
    constructor(color = rgba(255, 0, 0, 1), size = 10) {
        super();

        // Alpha was 0.2
        let adjustedOpacityColor = changeAlphaRgba(color, 1);

        this.color = adjustedOpacityColor;
        this.size = size;
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
}

let currColor = rgba(255, 0, 0, 0);
let currBrush = new TLCBrush();
let drawingBrushSize = 10;
let erasingBrushSize = 30;

let isInDrawingMode = false;

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

    let brushResults = currBrush.drawAtCoor(canvasCoors.x, canvasCoors.y, lastDrawnCoors);

    if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
        const selectedLayerNo = currBrush.getCanvasLayer();

        if (selectedLayerNo != CanvasLayerOrdering.ALL_LAYERS) {
            brushResults.forEach((brushResult) => {
                if (brushResult.x >= 0 && brushResult.y >= 0) {
                    drawRectangle(contextLayers[selectedLayerNo], brushResult.color, brushResult.x, brushResult.y, brushResult.w, brushResult.h);
                }
            })
        } else {
            // Draw on all layers (This would never be used)

        }
    } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
        const selectedLayerNo = currBrush.getCanvasLayer();

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
    const borderThickness = 10;

    // Vertical Bounds
    drawRectangle(ctx, borderColor, 0, 0, borderThickness, window.innerHeight);
    drawRectangle(ctx, borderColor, window.innerWidth - borderThickness, 0, borderThickness, window.innerHeight);

    // Horizontal Bounds
    drawRectangle(ctx, borderColor, borderThickness, 0, window.innerWidth - (2 * borderThickness), borderThickness);
    drawRectangle(ctx, borderColor, borderThickness, window.innerHeight - borderThickness, window.innerWidth - (2 * borderThickness), borderThickness);

}

function eraseBorder(ctx) {
    const borderThickness = 10;

    // Vertical Bounds
    ctx.clearRect(0, 0, borderThickness, window.innerHeight);
    ctx.clearRect(window.innerWidth - borderThickness, 0, borderThickness, window.innerHeight);

    // Horizontal Bounds
    ctx.clearRect(borderThickness, 0, window.innerWidth - (2 * borderThickness), borderThickness);
    ctx.clearRect(borderThickness, window.innerHeight - borderThickness, window.innerWidth - (2 * borderThickness), borderThickness);

}

document.addEventListener('DOMContentLoaded', (event) => {

    const c = document.getElementById('overlayCanvas');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const highlighterCanvas = document.getElementById('highlighterCanvas');
    const highlighterCtx = highlighterCanvas.getContext('2d');
    highlighterCanvas.width = window.innerWidth;
    highlighterCanvas.height = window.innerHeight;

    const canvasLayers = { mainC: c, highlighterC: highlighterCanvas, topMostLayer: highlighterCanvas };

    console.log(window);
    console.log(window.innerWidth);

    window.ipcRender.receive('canvas-draw', ( coors ) => {
        console.log("Canvas Draw Event Received");
        drawAtCoor(canvasLayers, coors.x, coors.y, coors.prevCoors);
    });

    window.ipcRender.receive('canvas-changeColor', ( newColor ) => {
        console.log('Canvas Change Color Event Received');
        currBrush.setColor(newColor);
    });

    window.ipcRender.receive('canvas-choose-pen', ( param ) => {
        console.log("PEN chosen");
        currBrush = new TLCBrush(changeAlphaRgba(currBrush.color, 1), drawingBrushSize);

        window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: drawingBrushSize });

    });

    window.ipcRender.receive('canvas-choose-highlighter', ( param ) => {
        console.log("Highlighter chosen");
        currBrush = new SingleOpacityHighlighter(changeAlphaRgba(currBrush.color, 0.2), drawingBrushSize);

        window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: drawingBrushSize });

    });

    window.ipcRender.receive('canvas-choose-eraser', ( param ) => {
        console.log("Eraser chosen");
        currBrush = new TLCEraser(currBrush.color, erasingBrushSize);

        window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: erasingBrushSize });

    });

    window.ipcRender.receive('draw-mode-activated', ( param ) => {
        console.log("Draw Mode activated");
        const borderColor = rgba(0, 165, 255, 0.5);
        eraseBorder(ctx);
        drawBorder(ctx, borderColor);

        isInDrawingMode = true;
    });

    window.ipcRender.receive('draw-mode-unactivated', ( param ) => {
        console.log("Draw Mode UNactivated");
        const borderColor = rgba(170, 170, 170, 0.5);
        eraseBorder(ctx);
        drawBorder(ctx, borderColor);

        isInDrawingMode = false;
    });

    window.ipcRender.receive('canvas-change-size-by', ( sizeOffset ) => {
        console.log("Changing size of brush");
        if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
            drawingBrushSize = Math.max(1, drawingBrushSize + sizeOffset);
            drawingBrushSize = Math.min(200, drawingBrushSize);
            currBrush.setSize(drawingBrushSize);

            window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: drawingBrushSize });

        } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {

            const oldSize = erasingBrushSize;

            erasingBrushSize = Math.max(1, erasingBrushSize + sizeOffset);
            erasingBrushSize = Math.min(200, erasingBrushSize);

            if (isNaN(erasingBrushSize)) {
                erasingBrushSize = oldSize;
            }

            currBrush.setSize(erasingBrushSize);

            console.log("ERASER Size Offset: " + sizeOffset + "   Old Size: " + oldSize + "   New Size: " + erasingBrushSize);

            window.ipcRender.send("set-menu-brush-size-slider-value", { newBrushSize: erasingBrushSize });

        } else {
            console.log("Unknown Brush Type Detected - Changing size of brush");
        }


    });

    window.ipcRender.receive('canvas-set-brush-size', ( newBrushSize ) => {
        console.log("Changing size of brush ABSOLUTE");
        if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
            drawingBrushSize = newBrushSize;
            currBrush.setSize(drawingBrushSize);
        } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
            erasingBrushSize = newBrushSize;
            currBrush.setSize(erasingBrushSize);
        } else {
            console.log("Unknown Brush Type Detected - Changing size of brush");
        }

    });

    window.ipcRender.receive('canvas-erase-all', () => {
        console.log("Canvas Erase All Event Received");

        const canvasLayersArr = Object.values(canvasLayers);
        canvasLayersArr.forEach( (currC) => {
            const currCtx = currC.getContext('2d');
            currCtx.clearRect(0, 0, currC.width, currC.height);

            let borderColor = rgba(170, 170, 170, 0.5);
            if (isInDrawingMode) {
                borderColor = rgba(0, 165, 255, 0.5);
            }
            eraseBorder(ctx);
            drawBorder(ctx, borderColor);
        })
    });

    const borderColor = rgba(170, 170, 170, 0.5);
    drawBorder(ctx, borderColor);

    console.log("Overlay Render DOMContentLoaded ran");

});
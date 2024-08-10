
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
            x: x,
            y: y,
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
            y: y,
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

class TLCEraser extends Brush {
    constructor(color = rgba(0, 0, 0, 0), size = 30) {
        super();
        this.color = color;
        this.size = size;
    }

    getBrushType() {
        return BrushType.REMOVE_PIXEL;
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
            x: x,
            y: y,
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

function drawAtCoor(ctx, c, x, y, lastDrawnCoors) {
    let canvasCoors = getPointOnCanvas(c, x, y);
    console.log("Drawing pixel at x: ", canvasCoors.x, "  y: ", canvasCoors.y);

    let brushResults = currBrush.drawAtCoor(canvasCoors.x, canvasCoors.y, lastDrawnCoors);

    if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
        brushResults.forEach((brushResult) => {
            if (brushResult.x >= 0 && brushResult.y >= 0) {
                drawRectangle(ctx, brushResult.color, brushResult.x, brushResult.y, brushResult.w, brushResult.h);
            }
        })
    } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
        brushResults.forEach((brushResult) => {
            if (brushResult.x >= 0 && brushResult.y >= 0) {
                ctx.clearRect(brushResult.x, brushResult.y, brushResult.w, brushResult.h);
            }
        })
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
    const ctx = c.getContext('2d');``
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    console.log(window);
    console.log(window.innerWidth);

    window.ipcRender.receive('canvas-draw', ( coors ) => {
        console.log("Canvas Draw Event Received");
        drawAtCoor(ctx, c, coors.x, coors.y, coors.prevCoors);
    });

    window.ipcRender.receive('canvas-changeColor', ( newColor ) => {
        console.log('Canvas Change Color Event Received');
        currBrush.setColor(newColor);
    });

    window.ipcRender.receive('canvas-choose-pen', ( param ) => {
        console.log("PEN chosen");
        currBrush = new TLCBrush(changeAlphaRgba(currBrush.color, 1), drawingBrushSize);
    });

    window.ipcRender.receive('canvas-choose-highlighter', ( param ) => {
        console.log("Highlighter chosen");
        currBrush = new TLCHighlighter(changeAlphaRgba(currBrush.color, 0.2), drawingBrushSize);
    });

    window.ipcRender.receive('canvas-choose-eraser', ( param ) => {
        console.log("Eraser chosen");
        currBrush = new TLCEraser(currBrush.color, erasingBrushSize);
    });

    window.ipcRender.receive('draw-mode-activated', ( param ) => {
        console.log("Draw Mode activated");
        const borderColor = rgba(0, 165, 255, 0.5);
        eraseBorder(ctx);
        drawBorder(ctx, borderColor);
    });

    window.ipcRender.receive('draw-mode-unactivated', ( param ) => {
        console.log("Draw Mode UNactivated");
        const borderColor = rgba(170, 170, 170, 0.5);
        eraseBorder(ctx);
        drawBorder(ctx, borderColor);
    });

    window.ipcRender.receive('canvas-change-size-by', ( sizeOffset ) => {
        console.log("Changing size of brush");
        if (currBrush.getBrushType() == BrushType.ADD_PIXEL) {
            drawingBrushSize = Math.max(1, drawingBrushSize + sizeOffset);
            currBrush.setSize(drawingBrushSize);
        } else if (currBrush.getBrushType() == BrushType.REMOVE_PIXEL) {
            erasingBrushSize = Math.max(1, erasingBrushSize + sizeOffset);
            currBrush.setSize(erasingBrushSize);
        } else {
            console.log("Unknown Brush Type Detected - Changing size of brush");
        }


    });

    const borderColor = rgba(170, 170, 170, 0.5);
    drawBorder(ctx, borderColor);

    console.log("Overlay Render DOMContentLoaded ran");

});
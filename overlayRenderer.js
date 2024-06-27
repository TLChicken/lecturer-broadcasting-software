
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


class Brush {
    constructor() {
        if (this.constructor === Brush) {
            throw new Error("Cannot instantiate Brush interface");
        }
        this.color = null;
        this.size = null;
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
        this.color = color;
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
        this.color = color;
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

let currColor = rgba(255, 0, 0, 0);
let currBrush = new TLCBrush();

function rgba(red, green, blue, alpha) {
    return "rgba(" + red + ","+ green + ","+ blue + ","+ alpha + ")";
}

function rgb(red, green, blue) {
    return "rgb(" + red + ","+ green + ","+ blue + ")";
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

    brushResults.forEach((brushResult) => {
        if (brushResult.x >= 0 && brushResult.y >= 0) {
            drawRectangle(ctx, brushResult.color, brushResult.x, brushResult.y, brushResult.w, brushResult.h);
        }
    })

}

function toggleZoomScreen() {
    document.body.style.zoom = (1 / window.devicePixelRatio);
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
        currBrush = new TLCBrush();
    });

    window.ipcRender.receive('canvas-choose-highlighter', ( param ) => {
        console.log("Highlighter chosen");
        currBrush = new TLCHighlighter();
    });

    window.ipcRender.receive('canvas-choose-eraser', ( param ) => {
        console.log("Eraser chosen");
        currBrush = new TLCBrush();
    });

    // Vertical Bounds
    drawRectangle(ctx, rgba(255, 0, 0, 1), 0, 0, 10, window.innerHeight);
    drawRectangle(ctx, rgba(0, 255, 0, 1), window.innerWidth - 10, 0, 10, window.innerHeight);

    // Horizontal Bounds
    drawRectangle(ctx, rgba(0, 0, 255, 1), 0, 0, window.innerWidth, 10);
    drawRectangle(ctx, rgba(255, 255, 0, 1), 0, window.innerHeight - 10, window.innerWidth, 10);


    console.log("Overlay Render DOMContentLoaded ran");

});
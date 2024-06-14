

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

    drawAtCoor(x, y) {
        throw new Error("Must override drawAtCoor method");
    }
}

class TLCBrush extends Brush {
    constructor(color = [255, 0, 0, 255], size = 1) {
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

    drawAtCoor(x, y) {
        return [{
            color: this.color,
            x: x,
            y: y,
            w: this.size,
            h: this.size
        }]
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


function drawRectangle(ctx, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawAtCoor(ctx, x, y) {
    console.log("Drawing pixel at x: ", x, "  y: ", y);

    let brushResults = currBrush.drawAtCoor(x, y);

    brushResults.forEach((brushResult) => {
        if (brushResult.x >= 0 && brushResult.y >= 0) {
            drawRectangle(ctx, brushResult.color, brushResult.x, brushResult.y, brushResult.w, brushResult.h);
        }
    })

}


document.addEventListener('DOMContentLoaded', (event) => {
    const c = document.getElementById('overlayCanvas');
    const ctx = canvas.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    window.ipcRender.receive('canvas-draw', ( coors ) => {
        console.log("Canvas Draw Event Received");
        drawAtCoor(ctx, coors.x, coors.y);
    })

});

function drawRectangle(c, color, x, y, w, h) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('overlayCanvas');
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

// Example function to draw an array of pixels on the canvas
    function drawPixels(pixelArray, width, height) {
        const imageData = context.createImageData(width, height);
        for (let i = 0; i < pixelArray.length; i++) {
            imageData.data[i] = pixelArray[i];
        }
        context.putImageData(imageData, 0, 0);
    }

// Example usage of drawPixels function
    const width = canvas.width;
    const height = canvas.height;
    const pixelArray = new Uint8ClampedArray(width * height * 4); // RGBA for each pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            pixelArray[index] = 255;     // Red
            pixelArray[index + 1] = 0;   // Green
            pixelArray[index + 2] = 0;   // Blue
            pixelArray[index + 3] = 255; // Alpha
        }
    }
    drawPixels(pixelArray, width, height);

});
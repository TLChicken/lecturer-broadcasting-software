

exports.rgba = (red, green, blue, alpha) => {
    return "rgba(" + red + ","+ green + ","+ blue + ","+ alpha + ")";
}

exports.rgb = (red, green, blue) => {
    return "rgb(" + red + ","+ green + ","+ blue + ")";
}

exports.changeAlphaRgba = (rgbaStr, newAlpha) => {
    let alphaCommaIndex = rgbaStr.lastIndexOf(",");
    let removedOldAlphaRgbaStr = rgbaStr.slice(0, alphaCommaIndex);

    return removedOldAlphaRgbaStr + "," + newAlpha + ")";
}

exports.rgbaToRbg = (rgbaStr) => {
    let edited = rgbaStr.replace(/,(?=[^,]+$).*/, ')'); // Regex from me courtesy of CS4248 (might possibly be wrong but I think its correct)
    edited = edited.replace("rgba", "rgb");
    return edited;
}

// hex to RGBA converter from here: https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
exports.hexToRgba = (hexString) => {
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
exports.rgba2hex = (orig) => {
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

exports.rgbToHex = (rgb) => {
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
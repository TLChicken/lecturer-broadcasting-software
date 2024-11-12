const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');


const LBS_USER_DATA_PATH = path.join(app.getPath("userData"), 'lbs_save_v1.1.json');
console.log("Save Data at: " + LBS_USER_DATA_PATH);

let slideshowRecordingPDF = null;

function readUserData() {
    try {
        const data = fs.readFileSync(LBS_USER_DATA_PATH, 'utf-8');
        return JSON.parse(data);
    } catch(error) {
        console.log('Error retrieving user data', error);
        return null;
    }
}

function writeUserData(data) {
    fs.writeFileSync(LBS_USER_DATA_PATH, JSON.stringify(data));
}

function getTimestampedFilename(extension) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // yyyy-mm-dd-hh-mm-ss
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}` + extension;
}

async function saveInDownloadsFolder(screenshot) {
    const filePath = path.join(app.getPath('downloads'), getTimestampedFilename(".PNG"));
    fs.writeFileSync(filePath, screenshot, (err) => {
        if (err) throw err;
        console.log('Screenshot saved to', filePath);
    });

    return filePath;
}

function startSlideshowPDF() {
    const filePath = path.join(app.getPath('downloads'), getTimestampedFilename(".pdf"));

    slideshowRecordingPDF = new PDFDocument({
        autoFirstPage: false
        // size: 'LEGAL',
        // layout: 'landscape',
        // margin: 0
    });
    slideshowRecordingPDF.pipe(fs.createWriteStream(filePath));

}

function slideshowPDFAddSlide(imagePath, imageWidth, imageHeight) {
    // Can use image-size library if dont want to manually specify image sizes
    // https://github.com/image-size/image-size

    if (slideshowRecordingPDF != null) {
        slideshowRecordingPDF.addPage({
            size: [imageHeight, imageWidth],
            layout: 'landscape',
            margin: 0
        })

        slideshowRecordingPDF.image(imagePath, {
            fit: [slideshowRecordingPDF.page.width, slideshowRecordingPDF.page.height],
            align: 'left',
            valign: 'top'
        });
        console.log("Recorded slide in PDF   Path: " + imagePath);


    } else {
        console.log("Adding slide to null PDF File");
    }
}

function endSlideshowPDF() {
    // If no images then dont save the file?
    if (slideshowRecordingPDF != null) {
        slideshowRecordingPDF.end();
        slideshowRecordingPDF = null;
    } else {
        console.log("Ending null PDF File");
    }
}

module.exports = { readUserData, writeUserData, saveInDownloadsFolder, startSlideshowPDF, slideshowPDFAddSlide, endSlideshowPDF };
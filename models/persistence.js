const { app } = require('electron');
const path = require('path');
const fs = require('fs');


const LBS_USER_DATA_PATH = path.join(app.getPath("userData"), 'lbs_save_v1.1.json');
console.log("Save Data at: " + LBS_USER_DATA_PATH);

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

function getTimestampedFilename() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // yyyy-mm-dd-hh-mm-ss
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}.png`;
}

function saveInDownloadsFolder(screenshot) {
    const filePath = path.join(app.getPath('downloads'), getTimestampedFilename());
    fs.writeFile(filePath, screenshot, (err) => {
        if (err) throw err;
        console.log('Screenshot saved to', filePath);
    });
}

module.exports = { readUserData, writeUserData, saveInDownloadsFolder };
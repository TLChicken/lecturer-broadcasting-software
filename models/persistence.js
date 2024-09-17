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

module.exports = { readUserData, writeUserData };
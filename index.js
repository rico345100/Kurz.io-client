"use strict";
const electron = require('electron');
const fs = require('fs');
const { app, BrowserWindow, Tray, ipcMain } = electron;
const notifier = require('node-notifier');
const path = require('path');
//const remoteAddr = 'http://localhost:3000';
const remoteAddr = 'http://52.193.49.20:3000';
const crypto = require('crypto');

let win;						// current window
let allWindowClosed = false;	// use this for check all window closed

const ALGORITHM = 'aes-256-ctr';
const KEY = 'a7ydkjz';

function encrypt(text) {
	var cipher = crypto.createCipher(ALGORITHM, KEY);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}
function decrypt(text) {
	var decipher = crypto.createDecipher(ALGORITHM, KEY);
	var dec = decipher.update(text, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
}

function createJSONFileIfNotExists(fileName) {
	return new Promise( (resolve, reject) => {
		function createJSON() {
			fs.access(`${__dirname}/config/${fileName}.json`, '0755', (err) => {
				if(err) {
					let stream = fs.createWriteStream(`${__dirname}/config/${fileName}.json`);
					stream.write(encrypt(JSON.stringify({})));
					stream.end();

					stream.on('error', (err) => {
						reject(err);
					});

					stream.on('finish', () => {
						resolve();
					});				
				}
				else {
					resolve();
				}
			});
		}

		fs.access(`${__dirname}/config`, '0755', (err) => {
			if(err) {
				fs.mkdir(`${__dirname}/config`, '0755', (err) => {
					if(err) {
						return reject(err);
					}

					createJSON();
				});			
			}
			else {
				createJSON();
			}
		});		
	});
}

// Promise readConfig(String fileName)
function readConfig(fileName) {
	return new Promise( (resolve, reject) => {
		createJSONFileIfNotExists(fileName).then( () => {
			// read file
			let readStream = fs.createReadStream(`${__dirname}/config/${fileName}.json`);
			let fileData = '';

			readStream.on('readable', () => {
				var chunk;

				while(chunk = readStream.read()) {
					fileData += chunk;
				}
			});
			readStream.on('end', () => {
				resolve(JSON.parse(decrypt(fileData)) || {});
			});
			readStream.on('error', (err) => {
				console.error('Failed to read config: ', err);
			});
		});
	});
}

// Promise writeConfig(String fileName, String key, String value)
function writeConfig(fileName, key, value) {
	return new Promise( (resolve, reject) => {
		readConfig(fileName).then((configJSON) => {
			configJSON[key] = value;

			let writeStream = fs.createWriteStream(`${__dirname}/config/${fileName}.json`);
			writeStream.write(encrypt(JSON.stringify(configJSON)));
			writeStream.end();

			writeStream.on('finish', () => {
				resolve();
			});
			writeStream.on('error', (err) => {
				console.error('Failed to write to config:', err);
			});
		});
	});
}

function initApp() {
	allWindowClosed = false;

	const electronScreen = electron.screen;
	const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;
	
	win = new BrowserWindow({
		width,
		height,
		icon: `file://${__dirname}/html/dist/images/logo.png`
	});
	win.loadURL(`file://${__dirname}/html/dist/index.html`);
	// win.webContents.openDevTools();

	
	win.on('closed', () => {
		win = null;
	});

	ipcMain.on('notification', (ev, arg) => {
		notifier.notify({
			title: arg.sender,
			message: arg.message,
			icon: path.join(__dirname, 'noti.png'),
			sound: true
		}, (err, response) => {
			console.log('Error:', err);
			console.log('Response:', response);
		});
	});

	ipcMain.on('download-file', (ev, arg) => {
		win.webContents.downloadURL(`${remoteAddr}/channel/${arg.channelID}/file/${arg.fileId}`);
	});
	
	ipcMain.on('set debug=true', (ev, arg) => {
		win.webContents.openDevTools();
	});
	ipcMain.on('set debug=false', (ev, arg) => {
		win.webContents.closeDevTools();
	});	

	// save data into file as JSON
	// options:
	// String name: name of the file to save
	// String key: key to save
	// String value: value to save
	ipcMain.on('save', (ev, arg) => {
		writeConfig(arg.name, arg.key, arg.value).then( () => {
			ev.sender.send('save', true);
		});
	});

	ipcMain.on('load', (ev, arg) => {
		readConfig(arg.name).then( configs => {
			ev.sender.send('load', configs);
		});
	});
}

app.on('ready', () => {
	initApp();
	const appTray = new Tray(path.join(__dirname, './tray-icon.png'));

	appTray.on('click', () => {
		if(allWindowClosed) {
			initApp();
		}
		else {
			BrowserWindow.getAllWindows()[0].focus()
		}
	});
});

app.on('window-all-closed', () => {
	allWindowClosed = true;

	if(process.platform !== 'darwin') {
		app.quit();
	}
});

// restart app for osx
app.on('activate', () => {
	if(win === null) {
		initApp();
	}
});
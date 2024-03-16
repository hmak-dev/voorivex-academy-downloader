const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { downloadDir } = require('./config');

function delay(duration) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}

function initDirectories(data) {
	data.forEach((course) => {
		const courseDir = path.resolve(downloadDir, course.title);

		if (!fs.existsSync(courseDir)) {
			fs.mkdirSync(courseDir);
		}

		course.children.forEach((folder) => {
			const folderDir = path.resolve(courseDir, folder.title);

			if (!fs.existsSync(folderDir)) {
				fs.mkdirSync(folderDir);
			}
		});
	});
}

function downloadFile(url, filename, onProgress) {
	const writer = fs.createWriteStream(filename);

	return axios({
		method: 'get',
		url,
		responseType: 'stream',
		onDownloadProgress: onProgress,
	}).then(response => {
		return new Promise((resolve, reject) => {
			response.data.pipe(writer);

			let error = null;
			writer.on('error', err => {
				error = err;
				writer.close();
				reject(err);
			});
			writer.on('close', () => {
				if (!error) {
					resolve(true);
				}
			});
		});
	});
}

const sizeNames = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'YB'];
function numberToSize(size) {
	if (size === 0) return `0 ${sizeNames[0]}`;

	const i = Math.floor(Math.log(size) / Math.log(1024));
	return `${(size / 1024 ** i).toFixed(2)} ${sizeNames[i]}`;
}


function numberToTime(time) {
	let output = [];

	const hour = Math.floor(time / 3600);
	const minute = Math.floor((time % 3600) / 60);
	const second = Math.floor(time % 60);

	if (hour > 0) {
		output.push(`${hour} hour${hour > 1 ? 's' : ''}`);
	}

	if (minute > 0) {
		output.push(`${minute} minute${minute > 1 ? 's' : ''}`);
	}

	if (second > 0) {
		output.push(`${second} second${second > 1 ? 's' : ''}`);
	}

	return output.join(' ');
}

function message(msg) {
	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	process.stdout.write(msg);
}

module.exports = {
	delay,
	downloadFile,
	initDirectories,
	numberToSize,
	numberToTime,
	message,
};
const fs = require('fs');
const path = require('path');

const config = require('./config');

const successLogFile = path.resolve(config.logsDir, 'success.json');
const failLogFile = path.resolve(config.logsDir, 'fail.json');

const errorLogFile = path.resolve(config.logsDir, 'error.log');

const logs = {
	success: [],
	fail: [],
}

function initLogs() {
	if (!fs.existsSync(config.logsDir)) {
		fs.mkdirSync(config.logsDir);
	}

	if (fs.existsSync(successLogFile)) {
		const data = fs.readFileSync(successLogFile, 'utf-8');
		try {
			logs.success = JSON.parse(data);
		} catch { }
	}

	if (fs.existsSync(failLogFile)) {
		const data = fs.readFileSync(failLogFile, 'utf-8');
		try {
			logs.fail = JSON.parse(data);
		} catch { }
	}
}

function writeLog(data, file) {
	fs.writeFileSync(file, JSON.stringify(data), 'utf-8');
}

function logSuccess(key) {
	logs.success.push(key);

	writeLog(logs.success, successLogFile);
}

function logFail(key) {
	logs.fail.push(key);

	writeLog(logs.fail, failLogFile);
}

function logError(error) {
	fs.appendFileSync(errorLogFile, new Date().toString() + '\n' + error + '\n\n\n');
}

module.exports = {
	logs,
	initLogs,
	logSuccess,
	logFail,
	logError,
};
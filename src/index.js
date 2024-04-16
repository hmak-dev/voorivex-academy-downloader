const fs = require('fs');
const path = require('path');

const { initDirectories, delay, downloadFile, numberToSize, numberToTime, message } = require('./utils');

const config = require('./config');
const api = require('./api');
const log = require('./log');

log.initLogs();

async function processVideo(video, basePath) {
	let videoFailCount = 0;

	if (!log.logs.success.includes(video.key)) {
		try {
			message(`Removing Old Video`);
			let removeFailCount = 0;
			let removeOk = false;
			while (!removeOk) {
				await delay(1000);
				const response = await api.remove(video.key);

				if (response.data === true) {
					removeOk = true;
				} else {
					removeFailCount++;

					if (removeFailCount > 3) {
						throw `Removing Old Video Failed 3 Times`;
					}
				}
			}

			message(`Generating New Video`);
			let generateFailCount = 0;
			let generateOk = false;
			while (!generateOk) {
				await delay(1000);
				const response = await api.generate(video.key);

				if (response.data === 'your action is added to queue') {
					generateOk = true;
				} else {
					generateFailCount++;

					if (generateFailCount > 3) {
						throw `Generating New Video Failed 3 Times`;
					}
				}
			}

			message(`Getting Video URL`);
			let urlFailCount = 0;
			let url = null;
			while (url === null) {
				await delay(2000);
				const response = await api.getActiveLink();

				if (response.data.type === 'active' && response.data.videos.length > 0) {
					url = response.data.videos[0].url;
				} else {
					urlFailCount++;

					if (urlFailCount > 3) {
						throw `Getting Video URL Failed 3 Times`;
					}
				}
			}

			const videoPath = path.resolve(basePath, video.title);
			await downloadFile(url, videoPath, (progress) => {
				message(`Downloading '${video.key.split('/').at(-1)}'   ::   ${numberToSize(progress.loaded)} of ${numberToSize(progress.total)}   ${(progress.progress * 100).toFixed(2)}%   ::   ${numberToSize(progress.rate)}/s   ::   ${numberToTime(progress.estimated)}`);
			});

			log.logSuccess(video.key);

			message(`Downloaded '${video.key}'\n`);
		} catch (error) {
			videoFailCount++;

			log.logError(error);
			log.logFail(video.key);

			message(`Failed to Download '${video.key}'\n`);

			if (videoFailCount > 10) {
				message(`Failed to Get 10 Videos. Exiting...\n`);

				process.exit(1);
			}

			await delay(10000 * videoFailCount);
		}
	}
}

async function traverse(item, basePath) {
	if (item.type === 'folder') {
		const dir = path.resolve(basePath, item.title);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		for (let child of item.children) {
			await traverse(child, dir);
		}
	} else if (item.type === 'file') {
		await processVideo(item, basePath)
	}
}

(async () => {
	let failCount = 0;

	try {
		let dataFailCount = 0;

		message(`Getting Video Catalog`);

		let data = [];
		let dataOk = false;
		while (!dataOk) {
			await delay(1000);
			const response = await api.video();

			if (response.status === 200 && response.data.length > 0) {
				dataOk = true;
				data = response.data;
			} else {
				dataFailCount++;

				if (dataFailCount > 5) {
					message(`Getting Video Catalog Failed 5 Times. Exiting...\n`);

					process.exit(1);
				}
			}
		}

		message(`Video Catalog Downloaded\n`);

		const basePath = path.resolve(config.downloadDir);

		for (let collection of data) {
			await traverse(collection, basePath);
		}
	} catch (error) {
		log.logError(error);

		failCount++;

		if (failCount > 5) {
			message(`Failed 5 Times. Exiting...\n`);

			process.exit(1);
		}
	}
})();
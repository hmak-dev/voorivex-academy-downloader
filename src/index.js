const fs = require('fs');
const path = require('path');

const { initDirectories, delay, downloadFile, numberToSize, numberToTime, message } = require('./utils');

const config = require('./config');
const api = require('./api');
const log = require('./log');

log.initLogs();

(async () => {
	let failCount = 0;

	try {
		let dataFailCount = 0;
		let videoFailCount = 0;

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

		initDirectories(data);

		loopCourse: for (const course of data) {
			loopFolder: for (const folder of course.children) {
				loopVideo: for (const video of folder.children) {
					if (!log.logs.success.includes(video.key)) {
						try {
							message(`Removing Old Video`);
							let removeFailCount = 0;
							let removeOk = false;
							loopRemove: while (!removeOk) {
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
							loopGenerate: while (!generateOk) {
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
							loopUrl: while (url === null) {
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

							const videoPath = path.resolve(config.downloadDir, course.title, folder.title, video.title);
							await downloadFile(url, videoPath, (progress) => {
								message(`Downloading '${video.key}'   ::   Downloaded: ${numberToSize(progress.loaded)} of ${numberToSize(progress.total)}   ${(progress.progress * 100).toFixed(2)}%   ::   Rate: ${numberToSize(progress.rate)}/s   ::   Estimated: ${numberToTime(progress.estimated)}`);
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
			}
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
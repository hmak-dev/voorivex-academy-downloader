const axios = require('axios');

const { token } = require('./config');

function video() {
	return axios.get('https://dl-api.voorivex.academy/video', {
		headers: {
			Authorization: token,
		}
	});
}

function remove(key) {
	return axios.post(
		'https://dl-api.voorivex.academy/video/remove',
		{
			key,
		},
		{
			headers: {
				Authorization: token,
			},
		}
	);
}

function generate(key) {
	return axios.post(
		'https://dl-api.voorivex.academy/video/ganerate',
		{
			key,
		},
		{
			headers: {
				Authorization: token,
			},
		}
	);
}

function getActiveLink() {
	return axios.get('https://dl-api.voorivex.academy/video/getActiveLink', {
		headers: {
			Authorization: token,
		}
	});
}

module.exports = {
	video,
	remove,
	generate,
	getActiveLink,
}
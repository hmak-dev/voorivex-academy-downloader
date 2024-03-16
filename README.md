# Voorivex Academy Downloader
This downloader is built with **Node.js** and **axios** to automate the process of download [voorivex academy](https://voorivex.academy) class videos.

## Requirements
In order to use it:
1. You need to have `node` and `npm` installed in your device. You can download it using [NVM](https://github.com/nvm-sh/nvm).  
2. Open the [download page](https://voorivex.academy/download/).
3. Find the XHR request to `https://dl-api.voorivex.academy/video` in the network tab.
4. Find the `Authorization` header in the request and copy the JWT token.
5. Then put your JWT token in the `token` field of `src/config.js` file.

## Installation
Before using the downloader you need to install the dependencies with the following command:

```bash
npm install
```

## Usage
Just run the following command to start the downloader and it will do the rest.

```bash
npm start
```

Note that the process of downloaded and failed videos and error log will be stored in the `logs` directory. So, if the network fails or you want to download new videos, just start it again. It will continue.

## Output
The downloaded videos will be stored in `videos` directory in the project root.
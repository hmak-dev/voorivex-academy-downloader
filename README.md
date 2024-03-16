# Voorivex Academy Downloader
This downloader is built with **Node.js** and **axios** to automate the process of download [voorivex academy](https://voorivex.academy) class videos.

## Requirements
In order to use it:
1. You need to have `node` and `npm` installed in your device. You can download it using [NVM](https://github.com/nvm-sh/nvm).  
2. Then put your `Authorization` header contents in the `token` field of `src/config.js` file.

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

## Output
The downloaded videos will be stored in `videos` directory in the project root.
// ----- configuration -----
const playerIds = [];
const playerTickets = [];
const checkInCooldownAverage = 90; // default: 90
const checkOutCooldownAverage = 45; // default: 45
const playerWinProbability = 95; // default: 95
// ----- setup & variables -----
const axios = require('axios').create();
axios.interceptors.request.use((config) => {
	config.headers['Content-Type'] = null;
	config.headers['User-Agent'] = null;
	config.headers['Accept'] = null;
	config.headers['Accept-Encoding'] = null;
	return config;
});
const APILink = 'http://league.speedrunners.doubledutchgames.com/';
const pathGetRanking = 'Service/GetRanking';
const pathCheckIn = 'Service/CheckIn';
const pathCheckOut = 'Service/CheckOut';
let checkInCooldown = 0;
let checkOutCooldown = 0;
let iterations = 0;
let numberOfPlayers = 0;
let playerScores = [];
// ----- end -----

const main = async () => {
	log('Starting service in 10 seconds...');

	if (playerIds.length < 2 || playerIds.length > 4 || playerIds.length != playerTickets.length) {
		log(`Invalid number of players (${playerIds.length}), must be >2 and <=4`);
		process.exit(1);
	} else {
		numberOfPlayers = playerIds.length;
		log(`Number of players: ${numberOfPlayers}`);
	}

	getRankingDetails();
	setInterval(getRankingDetails, 10 * 60 * 1000);
	await sleep(10);

	while (true) {
		iterations++;
		checkInCooldown = getRandom(checkInCooldownAverage - 20, checkInCooldownAverage + 20);
		checkOutCooldown = getRandom(checkOutCooldownAverage - 10, checkOutCooldownAverage + 10);
		randomiseScores();

		try {
			await checkIn();
			log(`Checked in  successfully (${iterations})`);
			await sleep(checkInCooldown);

			await checkOut();
			log(`Checked out successfully (${iterations})`);
			await sleep(checkOutCooldown);
		} catch (e) {
			errorHandler(e);
		}
	}
};

const getRankingDetails = async () => {
	for (let i = 0; i < numberOfPlayers; i++) {
		const requestBody = `v=107&code=${playerTickets[i]}&id=${playerIds[i]}`;
		try {
			log(`Player ${i + 1} rank: ${(await axios.post(APILink + pathGetRanking, requestBody)).data.score}`);
		} catch (e) {
			errorHandler(e);
		}
	}
};

const checkIn = async () => {
	for (let i = 0; i < numberOfPlayers; i++) {
		let body = `v=107&code=${playerTickets[i]}&id=${playerIds[i]}`;
		for (let j = 0; j < numberOfPlayers; j++) {
			body += `&pid[]=${playerIds[j]}`;
		}
		await axios.post(APILink + pathCheckIn, body);
	}
};

const checkOut = async () => {
	for (let i = 0; i < numberOfPlayers; i++) {
		let body = `v=107&code=${playerTickets[i]}&id=${playerIds[i]}`;
		for (let j = 0; j < numberOfPlayers; j++) {
			body += `&pscore[]=${playerScores[j]}`;
		}
		await axios.post(APILink + pathCheckOut, body);
	}
};

const errorHandler = async (e) => {
	if (e.response) {
		log(`Error occured: ${e.response.status || 0} - ${e.message}`);
		if (e.response.status == 401) process.exit(1);
	} else {
		log(`Unknown error occured: ${e.message}`);
	}
};

const randomiseScores = () => {
	const winner = getRandom(0, 101) < playerWinProbability ? 0 : getRandom(1, numberOfPlayers);
	for (let i = 0; i < numberOfPlayers; i++) {
		playerScores[i] = i === winner ? 3 : getRandom(0, 3);
	}
};

const sleep = async (seconds) => {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const getRandom = (min, max) => {
	return Math.floor(Math.random() * (max - min)) + min;
};

const log = (message) => {
	const pad = (n) => (n < 10 ? '0' + n : n);
	const now = new Date();
	const logMessage = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}] ${message}\n`;

	process.stdout.write(logMessage);
};

main();

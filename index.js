// ----- configuration -----
const checkInCooldownAverage = 90; // default: 90, cooldown for how long the game lasts
const checkOutCooldownAverage = 45; // default: 45, cooldown for in between games
const playerIds = []; // place player IDs here, separated by commas, first player is the favored one
const playerTickets = []; // place player tickets here, must be in the same order as player IDs
const playerWinProbability = 95; // default: 95, win probability of first player
// ----- constants & variables -----
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

	callGetRankingDetails();
	setInterval(callGetRankingDetails, 10 * 60 * 1000);
	await sleep(10);

	while (true) {
		iterations++;
		checkInCooldown = getRandom(checkInCooldownAverage - 20, checkInCooldownAverage + 20);
		checkOutCooldown = getRandom(checkOutCooldownAverage - 10, checkOutCooldownAverage + 10);
		randomiseScores();

		await callAPIfn(checkIn);
		log(`Checked in  successfully (${iterations})`);
		await sleep(checkInCooldown);

		await callAPIfn(checkOut);
		log(`Checked out successfully (${iterations})`);
		await sleep(checkOutCooldown);
	}
};

const callAPIfn = async (fn) => {
	try {
		return await fn();
	} catch (e) {
		errorHandler(e);
	}
};

const callGetRankingDetails = async () => {
	for (let i = 0; i < numberOfPlayers; i++) {
		log(`Player ${i + 1} rank: ${await getRankingDetails(playerTickets[i], playerIds[i])}`);
	}
};

const getRankingDetails = async (playerTicket, playerId) => {
	let requestBody = `v=107&code=${playerTicket}&id=${playerId}`;

	try {
		return (await post(pathGetRanking, requestBody)).data.score;
	} catch (e) {
		errorHandler(e);
	}
};

const checkIn = async () => {
	for (let i = 0; i < numberOfPlayers; i++) {
		let body = `v=107&code=${playerTickets[i]}&id=${playerIds[i]}`;
		for (let j = 0; j < numberOfPlayers; j++) {
			body += `&pid[]=${playerIds[j]}`;
		}
		await post(pathCheckIn, body);
	}
};

const checkOut = async () => {
	for (let i = 0; i < numberOfPlayers; i++) {
		let body = `v=107&code=${playerTickets[i]}&id=${playerIds[i]}`;
		for (let j = 0; j < numberOfPlayers; j++) {
			body += `&pscore[]=${playerScores[j]}`;
		}
		await post(pathCheckOut, body);
	}
};

const post = async (path, body) => {
	let headers = { headers: { 'Content-Length': body.length } };
	return (await fetch(APILink + path, { method: 'POST', body: body, headers: headers })).json();
};

const errorHandler = async (e) => {
	log(`Error occured: ${e.response.status || 0} - ${e.message}`);
	if (e.response.status == 401) process.exit(1);
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

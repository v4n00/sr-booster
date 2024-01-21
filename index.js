// ----- constants -----
let APILink = 'http://league.speedrunners.doubledutchgames.com/';
let pathGetRanking = 'Service/GetRanking';
let pathCheckIn = 'Service/CheckIn';
let pathCheckOut = 'Service/CheckOut';
// ----- configuration -----
let checkOutAverage = 90; // default: 90
let cooldownAverage = 45; // default: 45
let p1id = 0;
let p2id = 0;
let p1code = 0;
let p2code = 0;
// ----- variables -----
let duration = 0;
let cooldown = 0;
let p1score = 3;
let p2score = 0;
let iterations = 0;
// ----- end -----

async function main() {
	log('Starting service in 15 seconds...');

	callGetRankingDetails();
	setInterval(callGetRankingDetails, 600 * 1000);
	await sleep(15);

	while (true) {
		iterations++;
		duration = getRandom(checkOutAverage - 20, checkOutAverage + 20);
		cooldown = getRandom(cooldownAverage - 10, cooldownAverage + 10);
		randomiseScores();

		await callAPIfn(checkIn);
		log(`Checked in  successfully (${iterations})`);
		await sleep(duration);

		await callAPIfn(checkOut);
		log(`Checked out successfully (${iterations})`);
		await sleep(cooldown);
	}
}

async function callAPIfn(fn) {
	try {
		return await fn();
	} catch (e) {
		errorHandler(e);
	}
}

async function callGetRankingDetails() {
	log(`Player 1 rank: ${await getRankingDetails(p1code, p1id)}`);
	log(`Player 2 rank: ${await getRankingDetails(p2code, p2id)}`);
}

async function getRankingDetails(ticket, pid) {
	let requestBody = `v=107&code=${ticket}&id=${pid}`;

	try {
		return (await post(pathGetRanking, requestBody)).data.score;
	} catch (e) {
		errorHandler(e);
	}
}

async function checkIn() {
	let body1 = `v=107&code=${p1code}&id=${p1id}&pid[]=${p1id}&pid[]=${p2id}`;
	let body2 = `v=107&code=${p2code}&id=${p2id}&pid[]=${p1id}&pid[]=${p2id}`;

	await post(pathCheckIn, body1);
	await post(pathCheckIn, body2);
}

async function checkOut() {
	let body1 = `v=107&code=${p1code}&id=${p1id}&pscore[]=${p1score}&pscore[]=${p2score}`;
	let body2 = `v=107&code=${p2code}&id=${p2id}&pscore[]=${p1score}&pscore[]=${p2score}`;

	await post(pathCheckOut, body1);
	await post(pathCheckOut, body2);
}

async function post(path, body) {
	let headers = { headers: { 'Content-Length': body.length } };
	return (await fetch(APILink + path, { method: 'POST', body: body, headers: headers })).json();
}

async function errorHandler(e) {
	log(`Error occured: ${e.response.status || 0} - ${e.message}`);
	if (e.response.status == 401) process.exit(1);
}

function randomiseScores() {
	if (getRandom(0, 101) < 95) {
		p1score = 3;
		p2score = getRandom(0, 3);
	} else {
		p1score = getRandom(0, 3);
		p2score = 3;
	}
}

async function sleep(seconds) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function log(message) {
	const pad = (n) => (n < 10 ? '0' + n : n);
	const now = new Date();
	const logMessage = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}] ${message}\n`;

	process.stdout.write(logMessage);
}

main();

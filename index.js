import axios from 'axios';
import fs from 'fs';
import PromptSync from 'prompt-sync';

// ----- constants -----
const prompt = PromptSync();
axios.defaults.headers.common = {};
let APILink = 'http://league.speedrunners.doubledutchgames.com/';
let pathGetRanking = 'Service/GetRanking';
let pathCheckIn = 'Service/CheckIn';
let pathCheckOut = 'Service/CheckOut';
// ----- configuration -----
let debugging = false;
let checkOutAverage = 90; // default: 90
let cooldownAverage = 45; // default: 45
let p1id = 969447309;
let p2id = 48800273;
let p1ticket = 1076816120;
let p2ticket = 1486945010;
// ----- variables -----
let duration = 0;
let cooldown = 0;
let p1score = 3;
let p2score = 0;
let iterations = 0;
// ----- end -----

async function main() {
	log('Starting service');

	// ask for player id
	let input;
	input = prompt('player 1 ID: ');
	p1id = input == 0 ? p1id : input;
	input = prompt('player 2 ID: ');
	p2id = input == 0 ? p2id : input;

	// ask for tickets
	input = prompt('player 1 ticket: ');
	p1ticket = input == 0 ? p1ticket : input;
	input = prompt('player 2 ticket: ');
	p2ticket = input == 0 ? p2ticket : input;

	// cold start
	log(`Player 1 rank: ${await getRankingDetails(p1ticket, p1id)}`);
	log(`Player 2 rank: ${await getRankingDetails(p2ticket, p2id)}`);

	input = prompt('Start? ');
	if (input == 0) process.exit(0);

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

// Handler

async function callAPIfn(fn) {
	try {
		return await fn();
	} catch (e) {
		log(`Error occured: ${e.message}`);
		process.exit(1);
	}
}

// API calls

async function getRankingDetails(ticket, pid) {
	let requestBody = `v=107&code=${ticket}&id=${pid}`;

	try {
		return (await post(pathGetRanking, requestBody)).data.score;
	} catch (e) {
		log(`Error occured: ${e.message}`);
		process.exit(1);
	}
}

async function checkIn() {
	let body1 = `v=107&code=${p1ticket}&id=${p1id}&pid[]=${p1id}&pid[]=${p2id}`;
	let body2 = `v=107&code=${p2ticket}&id=${p2id}&pid[]=${p1id}&pid[]=${p2id}`;

	try {
		await post(pathCheckIn, body1);
		await post(pathCheckIn, body2);
	} catch (e) {
		throw e;
	}
}

async function checkOut() {
	let body1 = `v=107&code=${p1ticket}&id=${p1id}&pscore[]=${p1score}&pscore[]=${p2score}`;
	let body2 = `v=107&code=${p2ticket}&id=${p2id}&pscore[]=${p1score}&pscore[]=${p2score}`;

	try {
		await post(pathCheckOut, body1);
		await post(pathCheckOut, body2);
	} catch (e) {
		throw e;
	}
}

async function post(path, body) {
	let link = APILink + path;
	let headers = { headers: { 'Content-Length': body.length, 'User-Agent': '', 'Accept-Encoding': '' } };
	try {
		if (!debugging) return await axios.post(link, body, headers);
		else return { data: { score: 10000 } };
	} catch (e) {
		throw e;
	}
}

// aux functions

function randomiseScores() {
	if (getRandom(0, 101) < 95) {
		p1score = 3;
		p2score = getRandom(0, 3);
	} else {
		p1score = getRandom(0, 3);
		p2score = 3;
	}
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function log(message) {
	function pad(number) {
		return number < 10 ? '0' + number : number;
	}

	const now = new Date();
	const hours = pad(now.getHours());
	const minutes = pad(now.getMinutes());
	const seconds = pad(now.getSeconds());
	const timestamp = `${hours}:${minutes}:${seconds}`;
	const logMessage = `[${timestamp}] ${message}\n`;

	process.stdout.write(logMessage);
	fs.appendFile('log.txt', logMessage, (err) => {
		if (err) {
			console.error('Error writing to log file', err);
		}
	});
}

// start

main();

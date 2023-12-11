let debugging = false;
let randomiseScoresChance = 95;

let i = 0;
let stopping = false;

let p1Ticket = document.getElementById('p1ticket');
let p1playerId = document.getElementById('p1playerId');
let p1score = document.getElementById('p1score');

let p2Ticket = document.getElementById('p2ticket');
let p2playerId = document.getElementById('p2playerId');
let p2score = document.getElementById('p2score');

let getRankDetailsPlayer1Btn = document.getElementById('getRankDetailsPlayer1Btn');
let getRankDetailsPlayer2Btn = document.getElementById('getRankDetailsPlayer2Btn');
let checkInBtn = document.getElementById('checkInBtn');
let checkOutBtn = document.getElementById('checkOutBtn');

let p1rank = document.getElementById('p1rank');
let p2rank = document.getElementById('p2rank');

let checkInSuccess = document.getElementById('checkInSuccess');
let checkOutSuccess = document.getElementById('checkOutSuccess');

let startBtn = document.getElementById('startBtn');
let stopBtn = document.getElementById('stopBtn');
let howManyLoopsInput = document.getElementById('howManyLoopsInput');
let loopOutput = document.getElementById('loopOutput');
let secondsLeft = document.getElementById('secondsLeft');
let logger = document.getElementById('log');
let randomCheck = document.getElementById('randomCheck');

p1playerId.addEventListener('change', () => {
	localStorage.setItem('p1playerId', p1playerId.value);
});
p2playerId.addEventListener('change', () => {
	localStorage.setItem('p2playerId', p2playerId.value);
});
p1score.addEventListener('change', () => {
	localStorage.setItem('p1score', p1score.value);
});
p2score.addEventListener('change', () => {
	localStorage.setItem('p2score', p2score.value);
});
document.addEventListener('DOMContentLoaded', () => {
	if (localStorage.getItem('p1playerId')) p1playerId.value = localStorage.getItem('p1playerId');
	if (localStorage.getItem('p2playerId')) p2playerId.value = localStorage.getItem('p2playerId');
	if (localStorage.getItem('p1score')) p1score.value = localStorage.getItem('p1score');
	if (localStorage.getItem('p2score')) p2score.value = localStorage.getItem('p2score');
});

getRankDetailsPlayer1Btn.addEventListener('click', () => {
	let details = { ticket: p1Ticket.value, playerId: p1playerId.value };
	fetch('/api/get-details', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(details),
	})
		.then((response) => response.json())
		.then((data) => {
			p1rank.value = data.score;
			log('successfully got rank');
			console.log(data);
		})
		.catch((error) => {
			p1rank.value = error;
		});
});

function log(input) {
	const now = new Date();
	logger.innerHTML += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - ${input}\n`;
}

getRankDetailsPlayer2Btn.addEventListener('click', () => {
	let details = { ticket: p2Ticket.value, playerId: p2playerId.value };
	fetch('/api/get-details', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(details),
	})
		.then((response) => response.json())
		.then((data) => {
			p2rank.value = data.score;
			log('successfully got rank');
			console.log(data);
		})
		.catch((error) => {
			p2rank.value = error;
		});
});

checkInBtn.addEventListener('click', () => {
	let details = { ticketp1: p1Ticket.value, ticketp2: p2Ticket.value, playerIdp1: p1playerId.value, playerIdp2: p2playerId.value };
	fetch('/api/check-in', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(details),
	})
		.then((response) => response.json())
		.then((data) => {
			checkInSuccess.value = '?';
			if (data === '200-200') {
				log('successfully checked in');
				checkInSuccess.value = 'success';
			} else {
				log('failed check in');
			}
			console.log(data);
		})
		.catch((error) => {
			log('failed check in');
			console.log(error);
		});
});

checkOutBtn.addEventListener('click', () => {
	if (randomCheck.checked == true) randomiseScores();
	let details = { ticketp1: p1Ticket.value, ticketp2: p2Ticket.value, playerIdp1: p1playerId.value, playerIdp2: p2playerId.value, p1score: p1score.value, p2score: p2score.value };
	fetch('/api/check-out', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(details),
	})
		.then((response) => response.json())
		.then((data) => {
			checkOutSuccess.value = '?';
			if (data === '200-200') {
				log('successfully checked out');
				checkOutSuccess.value = 'success';
			} else {
				log('failed check out');
			}
			console.log(data);
		})
		.catch((error) => {
			log('failed check out');
			console.log(error);
		});
});

function getRnd(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDuration() {
	let howDuration = getRnd(0, 100);
	let duration = 0;

	if (howDuration < 60) duration = 80;
	else duration = 130;

	let offset = getRnd(-30, 30);
	duration = duration + offset;
	return duration * 1000;
}

function getRandomCooldown() {
	let howDuration = getRnd(0, 100);
	let duration = 0;

	if (howDuration < 66) duration = 20;
	else duration = 35;

	let offset = getRnd(-10, 10);
	duration = duration + offset;
	return duration * 1000;
}

function randomiseScores() {
	let winOrLose = getRnd(0, 100);
	if (winOrLose < randomiseScoresChance) {
		p1score.value = 3;
		p2score.value = getRnd(0, 3);
	} else {
		p1score.value = getRnd(0, 3);
		p2score.value = 3;
	}
}

startBtn.addEventListener('click', async () => {
	if (howManyLoopsInput.value == 0 || howManyLoopsInput.value == null) {
		loopOutput.value = 'missing loops';
		return;
	}
	let duration = 0;
	let cooldown = 0;
	let loops = howManyLoopsInput.value;
	loopOutput.value = 'started';
	log('started loops');
	for (i = 0; i < loops; i++) {
		if (!stopping) {
			if (debugging) duration = getRandomDuration() % 10000;
			else duration = getRandomDuration();

			if (debugging) cooldown = getRandomCooldown() % 10000;
			else cooldown = getRandomCooldown();

			secondsLeft.value = duration / 1000 - 1;
			let clock = setInterval(() => {
				secondsLeft.value = secondsLeft.value - 1;
			}, 1000);

			checkInBtn.click();

			await sleep(duration);
			clearInterval(clock);
			if (!stopping) loopOutput.value = `cooldown ${i + 1}/${loops}`;
			else loopOutput.value = 'cooldown stopping';

			secondsLeft.value = cooldown / 1000 - 1;
			let clock2 = setInterval(() => {
				secondsLeft.value = secondsLeft.value - 1;
			}, 1000);

			checkOutBtn.click();

			if (!stopping) {
				await sleep(cooldown);
			}
			clearInterval(clock2);
		}
		if (!stopping) loopOutput.value = `completed ${i + 1}/${loops}`;
		else loopOutput.value = 'completed stopping';
		secondsLeft.value = -1;
	}
	if (!stopping) loopOutput.value = 'finished';
	else loopOutput.value = 'stopped finished';
	stopping = false;
	log('finished loops');
});

stopBtn.addEventListener('click', () => {
	log('stopped loops');
	i = 999;
	stopping = true;
	loopOutput.value = `stopping`;
});

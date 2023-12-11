import axios from 'axios';
import express, { urlencoded } from 'express';

let app = express();
app.use(express.json());
app.use(
	urlencoded({
		extended: true,
	})
);
app.use(express.static('public'));
axios.defaults.headers.common = {};

let APILink = 'http://league.speedrunners.doubledutchgames.com/';
let debugging = false;

async function getRankingDetails(details) {
	if (details == null) return;

	let URLPath = APILink + 'Service/GetRanking';

	let ticket = details.ticket;
	let playerId = details.playerId;

	let requestBody = `v=107&code=${ticket}&id=${playerId}`;
	let header = { headers: { 'Content-Length': requestBody.length, 'User-Agent': '', 'Accept-Encoding': '' } };

	if (!debugging) {
		let response = (await axios.post(URLPath, requestBody, header)).data;
		return response;
	}

	return { score: '10000' };
}

async function checkIn(details) {
	if (details == null) return;

	let URLPath = APILink + 'Service/CheckIn';

	let requestBody1 = `v=107&code=${details.ticketp1}&id=${details.playerIdp1}&pid[]=${details.playerIdp1}&pid[]=${details.playerIdp2}`;
	let requestBody2 = `v=107&code=${details.ticketp2}&id=${details.playerIdp2}&pid[]=${details.playerIdp1}&pid[]=${details.playerIdp2}`;
	let header1 = { headers: { 'Content-Length': requestBody1.length, 'User-Agent': '', 'Accept-Encoding': '' } };
	let header2 = { headers: { 'Content-Length': requestBody2.length, 'User-Agent': '', 'Accept-Encoding': '' } };

	console.log(`check IN p1: ${URLPath}, ${requestBody1}`);
	console.log(`check IN p2: ${URLPath}, ${requestBody2}`);

	if (!debugging) {
		let response1 = await axios.post(URLPath, requestBody1, header1);
		let response2 = await axios.post(URLPath, requestBody2, header2);

		return `${response1.status}-${response2.status}`;
	}

	return '200-200';
}

async function checkOut(details) {
	let URLPath = APILink + 'Service/CheckOut';

	if (details == null) return;

	let requestBody1 = `v=107&code=${details.ticketp1}&id=${details.playerIdp1}&pscore[]=${details.p1score}&pscore[]=${details.p2score}`;
	let requestBody2 = `v=107&code=${details.ticketp2}&id=${details.playerIdp2}&pscore[]=${details.p1score}&pscore[]=${details.p2score}`;
	let header1 = { headers: { 'Content-Length': requestBody1.length, 'User-Agent': '', 'Accept-Encoding': '' } };
	let header2 = { headers: { 'Content-Length': requestBody2.length, 'User-Agent': '', 'Accept-Encoding': '' } };

	console.log(`check OUT p1: ${URLPath}, ${requestBody1}`);
	console.log(`check OUT p2: ${URLPath}, ${requestBody2}`);

	if (!debugging) {
		let response1 = await axios.post(URLPath, requestBody1, header1);
		let response2 = await axios.post(URLPath, requestBody2, header2);

		return `${response1.status}-${response2.status}`;
	}

	return '200-200';
}

app.post('/api/get-details', async (req, res) => {
	let response = await getRankingDetails(req.body);
	res.json(response);
});

app.post('/api/check-in', async (req, res) => {
	let response = await checkIn(req.body);
	res.json(response);
});

app.post('/api/check-out', async (req, res) => {
	let response = await checkOut(req.body);
	res.json(response);
});

app.listen(8000);
console.log('Website is running at http://localhost:8000');

const fs = require('fs');
const winston = require('winston');
const wanakana = require('./wanakana');

const reviewLogger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.File({ filename: 'reviews.log' })
	]
});

const reviewStatesFile = 'review-states.json';
const factsFile = 'facts.json';

let reviewStates = {};
if(fs.existsSync(reviewStatesFile)){
	reviewStates = JSON.parse(fs.readFileSync(reviewStatesFile));
}
console.log('review states:', reviewStates);

let facts = {};

let syncFacts = () => {
	if(fs.existsSync(factsFile)){
		facts = JSON.parse(fs.readFileSync(factsFile));
	}

	for(const id in facts){
		if(!reviewStates[id]){
			const condition = Math.floor(Math.random() * 2);
			reviewStates[id] = { id: id, condition: condition, streak: 0, due: new Date().getTime() };
		}
	}
	fs.writeFileSync(reviewStatesFile, JSON.stringify(reviewStates));
};

const streakToInterval = (streak) => {
	const minute = 1000 * 60;
	const hour = minute * 60;
	const day = hour * 24;
	switch(streak){
		case -1:
			return 0;
		case 0:
			return 5 * minute;
		default:
			return day * Math.pow(2, streak - 1) - 6 * hour;
	}
};

const updateDue = (id, result) => {
	if(result == 1){
		reviewStates[id].streak++;
	} else {
		reviewStates[id].streak = -1;
	}
	reviewStates[id].due = new Date().getTime() + streakToInterval(reviewStates[id].streak);
	fs.writeFileSync(reviewStatesFile, JSON.stringify(reviewStates));
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports.init = (app) => {
	app.get('/review', (req, res) => {
		syncFacts();

		const now = new Date().getTime();
		let firstReview = null;
		let factList = [];
		let dayFromNow = new Date().getTime() + 1000 * 60 * 60 * 24;
		let next24hourReviews = 0;
		for(const id in facts){
			if(reviewStates[id].due < now){
				const fact = facts[id];
				factList.push(fact);
			} else {
				if(firstReview == null || reviewStates[id].due < firstReview){
					firstReview = reviewStates[id].due;
				}
			}

			if(reviewStates[id].due < dayFromNow){
				next24hourReviews++;
			}
		}
		if(factList.length == 0){
			res.render('no-reviews', { time: firstReview, cards: Object.keys(reviewStates).length, next24hourReviews: next24hourReviews, facts: facts });
		} else {
			shuffle(factList);
			res.render('review', { time: firstReview, facts: facts, cards: Object.keys(reviewStates).length, condition: reviewStates[factList[0].id].condition, fact: factList[0], remaining: factList.length });
		}
	});

	app.post('/review', (req, res) => {
		const logMessage = { id: req.body.id, input: req.body.input, duration: req.body.duration, streak: reviewStates[req.body.id].streak, time: new Date().getTime(), tries: req.body.tries };
		const original =  facts[req.body.id].target;
		const reading = facts[req.body.id].reading;
		let result = { correct: 0, reading: reading };

		console.log(reading + ' tries: ' + req.body.tries);

		if(req.body.type == 't') {
			const input = req.body.input;
			if(reading == input || reading == wanakana.toKana(input)){
				logMessage.result = 1;
				result.correct = 1;
				updateDue(req.body.id, 1);
			} else {
				logMessage.result = 0;
				if(req.body.tries == 0) {
					console.log('reseting card: ' + reading);
					updateDue(req.body.id, 0);
				}
			}

			reviewLogger.log({ level: 'info', message: logMessage });
			res.json(result);
		} else if(req.body.type == 's'){
			logMessage.result = 0;
			for(let i = 0; i < req.body.results.length; i++){
				let transcript = req.body.results[i];
				if(transcript == original || transcript == reading){
					logMessage.result = 1;
					result.correct = 1;
					updateDue(req.body.id, 1);
					break;
				}
			}

			if(result.correct == 0 && req.body.tries == 0){
				console.log('reseting card: ' + reading);
				updateDue(req.body.id, 0);
			}

			logMessage.results = req.body.results;

			reviewLogger.log({ level: 'info', message: logMessage });
			res.json(result);
		} else {
			res.json(result);
		}
	});

	app.post('/delete-review', (req, res) => {
		const id = req.body.id;
		if(id){
			console.log('deleting ' + id);
			delete reviewStates[id];
			fs.writeFileSync(reviewStatesFile, JSON.stringify(reviewStates));
			if(fs.existsSync(factsFile)){
				facts = JSON.parse(fs.readFileSync(factsFile));
				delete facts[id];
				fs.writeFileSync(factsFile, JSON.stringify(facts));
			}
		}
		res.send('done');
	});

	app.get('/review-stats', (req, res) => {
		if(fs.existsSync(factsFile)){
			facts = JSON.parse(fs.readFileSync(factsFile));
		}

		let reviewHistory = [];
		const logStrings = fs.readFileSync('reviews.log', 'utf8').split('\n');
		for(const logString of logStrings){
			if(logString != "")
				reviewHistory.push(JSON.parse(logString));
		}

		res.render('review-stats', { facts: facts, reviewStates: reviewStates, reviewLogs: reviewHistory });
	});
};
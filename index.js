const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const fs = require('fs');
const opener = require('opener');

const childProcess= require("child_process");

const ejs = require('ejs');

const furigana = require('./libs/furigana');
const config = require('./libs/config');
const ip = require('./libs/network-ip');
const cleanHtml = require('./libs/clean-html');

server.listen(1414);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app
	.use(bodyParser.urlencoded({ limit: '1mb', extended: true }))
	.use(bodyParser.json({ limit: '1mb' }));

app.get('/', function(req, res){
	res.render('index');
});

app.get('/options', function(req, res){
	res.render('options');
});

app.get('/new-text', function(req, res){
	console.log(req.query.text);

	req.query.text = req.query.text.replace(/<br>/g, "");
	req.query.trans = req.query.trans.replace(/<br>/g, "");

	const template = fs.readFileSync('views/furigana.ejs', 'utf-8');
	const furiOutput = furigana(req.query.text);
	io.sockets.emit('new-text', { html: ejs.render(template, { elements: furiOutput }), text: req.query.text, trans: req.query.trans });
	res.send('done');
});

app.get('/write', function(req, res){
	fs.appendFile('history.txt', req.query.text + '\n', function (err) {
		if (err) throw err;
	});
});

io.on('connection', function (socket) {
	console.log('socket connected');

	var ips = ip();
	for(let i in ips){
		ips[i] = ips[i] + ":1414";
	}
	socket.emit('new-text', "Connection opened.");
	socket.emit('new-text', `Open FFXIV and begin a quest to see the dialogue text here. Currently only ARR and Heavensward are supported because I don't have Stormblood on Steam.`);
	socket.emit('new-text', `If you only have one monitor and still want to play fullscreen, you can use the tool on other devices on your local network (including a cell phone if needed) by entering one of these IP addresses into Chrome:<br>${ips.join(', ')}`);
	socket.emit('new-text', "[DISCLAIMER] The furigana and dictionary entries may be wrong. You should double check anything that seems weird to avoid learning the wrong thing.");
});

console.log('listening on :1414');

// if(config.openFfxivHook) {
const ffxivHook = childProcess.spawn('FFXIVHook.exe', { cwd: 'ffxiv-hook/' });
ffxivHook.stdout.on('data', (data) => {	console.log(`stdout: ${data}`); });
ffxivHook.stderr.on('data', (data) => {	console.log(`stderr: ${data}`); });

process.on("SIGINT", function () {
	console.log('killing ffxivHook');
	ffxivHook.kill();
	process.exit();
});
// }

opener([ "chrome", "--app=http://localhost:1414/" ]);
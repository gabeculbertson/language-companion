var kuromoji = require('kuromoji');
var hepburn = require("hepburn");
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

var wanakana = require('./wanakana.js');
var clean = require('./clean');

var tokenizer = null;

function getKatakana (text){
	let outText = "";
	for(let i = 0; i < text.length; i++){
		outText += wanakana.toKatakana(text[i]);
	}
	return outText;
}

function getHiragana (text){
	let outText = "";
	for(let i = 0; i < text.length; i++){
		outText += wanakana.toHiragana(text[i]);
	}
	return outText;
}

kuromoji.builder({ dicPath: "node_modules/kuromoji/dist/dict" }).build(function (err, tok) {
    // tokenizer is ready
    //var path = tokenizer.tokenize("彼は新しい仕事できっと成功するだろう。");//"すもももももももものうち");
    //console.log(path);
    console.log('ja tokenizer ready');
    tokenizer = tok;
    emitter.emit('ja-tokenizer-initialized');

 //    console.log(getHiragana('ウーン'));
	// console.log(module.exports.getTokensSync('うーん'));
});

function returnAfterInitialized(callback){
	if(tokenizer){
		callback();
	} else {
		emitter.on('ja-tokenizer-initialized', callback);
	}
}

module.exports.getPronunciation = function(text, callback){
	returnAfterInitialized(function (){
		var tokens = tokenizer.tokenize(text);
		//console.log(tokens);
		var outStr = "";
		for (var i in tokens) {
			outStr += tokens[i].reading + " ";
		}
		outStr = outStr.replace("*", "");
		callback(hepburn.fromKana(outStr));
	});
}

function getPronunciationSync (text, options){
	var convertToCharacters = function(s){
		return wanakana.toRomaji(s).replace(/undefined/g, ""); 
	}
	if(options && options.kana){
		convertToCharacters = function(s){
			return wanakana.toHiragana(wanakana.toRomaji(s).replace(/undefined/g, ""));
		}
	} else if(options && options.katakana){
		convertToCharacters = function(s){
			return s;
		}
	}


	var tokens = tokenizer.tokenize(text);
	console.log(tokens);
	var outStr = [];
	for (var i in tokens) {
		if(tokens[i].reading){
			outStr.push(tokens[i].reading);
		} else {
			outStr.push(tokens[i].surface_form);
		}
	}
	return convertToCharacters(outStr.join(''));
}

module.exports.afterInit = returnAfterInitialized;

module.exports.getPronunciationSync = getPronunciationSync;

module.exports.getTokens = function(text, callback){
	returnAfterInitialized(function(){
		var tokens = tokenizer.tokenize(text);
		var arr = [];
		for(var i in tokens){
			arr.push(tokens[i].surface_form);
		}
		callback(arr);
	});
}

module.exports.getTokensSync = function(text){
	var tokens = tokenizer.tokenize(text);
	var arr = [];
	for(var i in tokens){
		var token = { s: tokens[i].surface_form };
		if(tokens[i].reading && getKatakana(tokens[i].surface_form) != tokens[i].reading){
			token.r = getHiragana(tokens[i].reading);
		}
		arr.push(token);
	}
	return arr;
}

module.exports.getMinForm = function(text){
	return getPronunciationSync(text);
}
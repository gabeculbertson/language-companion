var jaTools = require('./ja-tools');

function breakDown(token){
	if(token.r[token.r.length - 1] != token.s[token.s.length - 1]){
		return { kanji: { s: token.s, r: token.r } };
	}

	var outObj = { kanji: { s: "", r: "" }, kana: { s: "" } };
	for(var i = 0; i < token.s.length; i++){
		if(token.s[token.s.length - i - 1] != token.r[token.r.length - i - 1]){
			// console.log(i, token);
			outObj.kana.s = token.r.substring(token.r.length - i);
			outObj.kanji.s = token.s.substring(0, token.s.length - i);
			outObj.kanji.r = token.r.substring(0, token.r.length - i);
			break;
		}
	}
	return outObj;
}

module.exports = function(text, options){
	options = options || {};

	var tokens = jaTools.getTokensSync(text);
	console.log(tokens);
	var outTokens = [];
	for(var i in tokens){
		if(tokens[i].r){
			var split = breakDown(tokens[i]);
			outTokens.push(split.kanji);
			if(split.kana){
				outTokens.push(split.kana);
			}
		} else {
			outTokens.push(tokens[i]);
		}
	}
	console.log(outTokens);

	if(options.onlyFurigana){
		let text = "";
		for(let token of outTokens){
			console.log(token);
			text += token.r || token.s;
		}
		return text;
	}

	return outTokens;
}
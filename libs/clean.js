var punctuation = '.,\'!?。…、！？';

var punctuationTable = {};
for(var i in punctuation){
	punctuationTable[punctuation[i]] = true;
}

function addSpace(textArray){
	if(textArray[textArray.length - 1] != ' '){
		textArray.push(' ');
	}
}

module.exports.punctuation = punctuation;

module.exports.cleanPunctuation = function(text){
	var punctuationFreeText = [];
	// remove pronunciation
	for(var i in text){
		if(text[i] in punctuationTable){
			addSpace(punctuationFreeText);
		} else if(text[i] == ' '){
			addSpace(punctuationFreeText);
		} else {
			punctuationFreeText.push(text[i]);
		}
	}
	return punctuationFreeText.join('');
}
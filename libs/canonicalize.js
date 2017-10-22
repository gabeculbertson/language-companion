var jaTools = require('./ja-tools');
var clean = require('./clean');

module.exports = function(text){
	var punctuationFreeText = clean.cleanPunctuation(text);

	// convert to ascii characters
	var words = punctuationFreeText.trim().split(' ');
	// console.log(words);
	var newWords = [];
	for(var i in words){
		// console.log(words[i]);
		newWords.push(jaTools.getPronunciationSync(words[i]).toLowerCase())
	}
	return newWords;
}
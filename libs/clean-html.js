const _tagRegex = /(<([^>]+)>)/ig;

module.exports = (text) => {
	return text.replace(_tagRegex, "");
}
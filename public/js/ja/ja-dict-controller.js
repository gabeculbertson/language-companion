$.getScript( "/js/ja/data.js", function( data, textStatus, jqxhr ) {
	window.langToolsConfig = window.langToolsConfig || {};

	let dict = null;
	let rcxConfig = {
		kanjicomponents: true,
		kanjiinfo: true,
		onlyreading: false,
		namesDatPath: '/js/ja/data/'
	};

	try {
		dict = new rcxDict(this.haveNames, rcxConfig);
	}
	catch (ex) {
		alert('Error loading dictionary: ' + ex);
	}

	let lastText = "";
	let lastElement = null;
	let lastStart = -1;
	let lastSearchResult = null;

	const selectForward = (startNode, startIndex, length) => {
		let endNode = startNode;
		let endIndex = startIndex + length;
		let text = startNode.textContent.substring(startIndex, Math.min(startIndex + length, startNode.textContent.length));
		if(startNode.parentNode.tagName == "RB"){
			endNode = startNode.parentNode;
			while(endNode != null && endNode.nextSibling != null && text.length < length){
				endNode = endNode.nextSibling;
				if(!endNode || endNode.tagName == "RT") continue;
				endIndex = length - text.length;
				text += endNode.textContent.substring(0, Math.min(length - text.length, endNode.textContent.length));
			}
			endNode = endNode.firstChild;
		} 
		return { text: text, startNode: startNode, endNode: endNode, endIndex: endIndex };
	};

	const handleSelection = (e) => {
		if(window.langToolsConfig && window.langToolsConfig.disableDictionary){
			$(document).trigger("definition-changed", [ "" ]);
			return;
		}

		let range = document.caretRangeFromPoint(e.clientX, e.clientY);
		if(!range) {
			$(document).trigger("definition-changed", [ "" ]);
			return;
		}
		if(range.startOffset == lastStart) return;

		let node = range.startContainer;

		lastStart = range.startOffset;
		lastElement = node.parentNode;

		let targetText = selectForward(node, range.startOffset, 20).text;
		// console.log(targetText);
		let searchResult = dict.wordSearch(targetText, false);
		lastSearchResult = searchResult;

		if(targetText == "en"){
			$(document).trigger("definition-changed", [ "en", 0, 0, node.parentNode ]);
			return;
		}

		if(searchResult && searchResult.data && searchResult.data.length > 0){
			const word = searchResult.data[0][0].split(' ')[0];
			const size = word.length;
			let newSelection = selectForward(node, range.startOffset, size);
			let newRange = document.createRange();
			newRange.setStart(newSelection.startNode, range.startOffset);
			newRange.setEnd(newSelection.endNode, newSelection.endIndex); 

			let selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(newRange);

			if(lastSearchResult){
				let clientRects = newRange.getClientRects();
				$(document).trigger("definition-changed", [ dict.makeHtml(lastSearchResult), clientRects[0].left, clientRects[0].top, lastElement, word ]);
				e.preventDefault();
			}
		} else {
			let selection = window.getSelection();
			selection.removeAllRanges();
			$(document).trigger("definition-changed", [ "" ]);
		}
	}

	$(document).click((e) => {
		if(!window.isMobile) return;
		console.log('doing mobile');
		handleSelection(e);
	});

	$(document.body).not("no-dict").mousemove((e) => {
		if(window.isMobile) return;
		handleSelection(e);
	});

	$(document.body).not("no-dict").click((e) => {
		if(lastSearchResult){
			$(document).trigger("definition-changed", [ dict.makeHtml(lastSearchResult), lastStart, lastElement ]);
			e.preventDefault();
		}
	});
});
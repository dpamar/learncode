function Node(id, word) {
	this.id = id;
	this.word = word;
	this.nexts = {};
	this.count = 0;
	this.addNext= function(nextId) {
		if(this.nexts[nextId] == null) this.nexts[nextId] = 0;
		this.nexts[nextId]++;
		this.count++;
	}
}

function ChatBot(hist) {
	this.historyDepth = hist;
	this.nodes = [];
	this.dictionary = {};

	this.nodeCount = 0;

	this.addSentence = function(string) {
		var words = string.split(/\s+/);
		var previous = [];
		for(var i=0; i<this.historyDepth; i++) previous.push(`__START${i}__`);
		var current = words.shift();

		for(var currentNode = this.getNode(previous, current); words.length; currentNode = nextNode) {
			previous.shift();
			previous.push(current);
			current = words.shift();
			var nextNode = this.getNode(previous, current);
			currentNode.addNext(nextNode.id);
		}
		previous.shift();
		previous.push(current);
		current = '__END__';
		var nextNode = this.getNode(previous, current);
		currentNode.addNext(nextNode.id);
	}

	this.getNode = function(previous, current) {
		var currentSource = this.dictionary;
		previous.map(word => {
			var next = currentSource[word];
			if(!next) currentSource[word] = next = {};
			currentSource = next;
		});
		var currentNode = currentSource[current];
		if(!currentNode) this.nodes.push(currentSource[current] = currentNode = new Node(this.nodeCount++, current));
		return currentNode;
	}

	this.talk = function() {
		var startNode = this.dictionary;
		for(var i=0; i<this.historyDepth; i++) startNode = startNode[`__START${i}__`];
		var startWords = Object.keys(startNode);

		var current = startNode[startWords[Math.floor(Math.random() * startWords.length)]];
		var result = [];
		while(current.word != '__END__') {
			result.push(current.word);
			var nextIndex = Math.floor(Math.random() * current.count);
			var nextId;
			for(var pairs = Object.entries(current.nexts),i=0; i<pairs.length; i++)
			{
				nextIndex -= pairs[i][1];
				if(nextIndex >= 0) continue;
				nextId = pairs[i][0];
				break;
			}
			current = this.nodes[nextId];
		}
		return result.join(' ');
	}
}

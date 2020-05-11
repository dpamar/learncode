function Node(id, prev,curr) {
	this.id = id;
	this.previous = prev;
	this.current = curr;
	this.nexts = {};
	this.count = 0;
	this.addNext= function(nextId) {
		if(this.nexts[nextId] == null) this.nexts[nextId] = 0;
		this.nexts[nextId]++;
		this.count++;
	}
}

function ChatBot() {
	
	this.nodes = [];
	this.dictionary = {};

	this.nodeCount = 0;

	this.addSentence = function(string) {
		var words = string.split(/\s+/);
		
		var previous = '__START__';
		var current = words.shift();

		for(var currentNode = this.getNode(previous, current); words.length; currentNode = nextNode) {
			previous = current;
			current = words.shift();
			var nextNode = this.getNode(previous, current);
			currentNode.addNext(nextNode.id);
		}
		previous = current;
		current = '__END__';
		var nextNode = this.getNode(previous, current);
		currentNode.addNext(nextNode.id);
	}

	this.getNode = function(previous, current) {
		var first = this.dictionary[previous];
		if(!first) this.dictionary[previous] = first = {};
		var currentNode = first[current];
		if(!currentNode) this.nodes.push(first[current] = currentNode = new Node(this.nodeCount++, previous, current));
		return currentNode;
	}

	this.talk = function() {
		var startNode = this.dictionary['__START__'];
		var startWords = Object.keys(startNode);

		var previous = '__START__';
		var current = startNode[startWords[Math.floor(Math.random() * startWords.length)]];

		var result = [];
		while(current.current != '__END__') {
			result.push(current.current);
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

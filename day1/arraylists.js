function ArrayList(val) {
	this.value = val;
	this.getValue = function() { return this.value; }
	this.next = null;
	this.addItem = function(item) {
		for(var current = this; current.next != null; ) current = current.next;
		return current.next = item;
	}
	this.getNext = function() { return this.next; }
}

function ArrayListSets(size) {
	//Init data structure
	this.lists = [];
	this.roots = [];
	this.weights = [];
	for(var i=0; i<size; i++) {
		var list = new ArrayList(i);
		this.lists.push(list);
		this.roots.push(i);
		this.weights.push(1);
	}
	
	//Get class for given item
	this.getClass = function(item) {
		return this.roots[item];
	}

	//Get class for given item
	this.getClassWeight = function(item) {
		var cl = this.getClass(item);
		return this.weights[cl];
	}

	//Add new link
	this.addLink = function(node1, node2) {
		var c1 = this.getClass(node1);
		var c2 = this.getClass(node2);
		if(c1 == c2) return;

		if(this.weights[c1] >= this.weights[c2]) {
			kept = c1; replaced = c2;
		} else {
			kept = c2; replaced = c1;
		}
		this.weights[kept] += this.weights[replaced];
		this.lists[kept].addItem(this.lists[replaced]);
		for(var current = this.lists[replaced]; current != null; current = current.getNext())
			this.roots[current.getValue()] = kept;
	}
}

function DisjointSets(size) {
	
	//Init data structure
	this.array = [];
	this.weight = [];
	this.classCount = size;
	for(var i=0; i<size; i++) {
		this.array.push(i);
		this.weight.push(1);
	}
	
	//Get class for given item
	this.getClass = function(item) {
		var result = this.array[item];
		if(result == item) return item;
		return this.array[item] = this.getClass(result);
	}

	//Get class for given item
	this.getClassWeight = function(item) {
		var cl = this.getClass(item);
		return this.weight[cl];
	}

	//Add new link
	this.addLink = function(node1, node2) {
		var c1 = this.getClass(node1);
		var c2 = this.getClass(node2);
		if(c1 == c2) return;
		this.classCount--;
		if(this.weight[c1] >= this.weight[c2]) {
			this.array[c2] = c1;
			this.weight[c1] += this.weight[c2];
		} else {
			this.array[c1] = c2;
			this.weight[c2] += this.weight[c1];
		}
	}
}

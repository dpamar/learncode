function getStatistics(sample) {
	var chars = [];
	var counts = [];
	for(var i=0; i<sample.length; i++) {
		var c = sample[i];
		var index = chars.indexOf(c);
		if(index == -1) {
			index = chars.length;
			chars.push(c);
			counts.push([c, 0]);
		}
		counts[index][1]++;
	}
	return counts.map(x=>[x[0], x[1]/sample.length]);
}

//A node : a char, a weight and two children (left and right)
function Node(chr, weight, left, right) {
	this.chr = chr;
	this.weight = weight;
	this.left = left;
	this.right = right;
}

function HuffmanTree(frequences) {
	var nodes = frequences.map(x => new Node(x[0], x[1], null, null));

	while(nodes.length != 1) {

		//Find 2 nodes with smallest weights
		nodes.sort((a,b) => b.weight - a.weight);
		var node1 = nodes.pop();
		var node2 = nodes.pop();

		//Merge nodes: no char, sum of weights and 2 children)
		var merge = new Node(null,
			node1.weight + node2.weight,
			node1,
			node2);
		nodes.push(merge);
	}

	return nodes[0];
}

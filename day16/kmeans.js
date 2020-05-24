//KMeans, given k and a set of vectors.
//Note : set.length >= k
function KMeans(k, set, initPlusPlus) {
	this.k = k;
	this.set = set;


	//Euclidean distance (squared)
	this.distance = (x, y) => x.map((v, i) => v-y[i]).reduce((a,b)=>a+b*b, 0);

	this.means = [];
	if(initPlusPlus) {
		//KMeans++ initialization:
		//pick one center randomly (first one) from set
		//for centers 2 to k :
		//    for each point P, get D=min(distance(P), C) for C in available centers
		//    get a random point from set with weighted probability D^2

		this.means.push(this.set[Math.floor(Math.random()*this.set.length)].map(x=>x));
		var distances = this.set.map(x=>1/0);
		for(var i=1; i<k; i++) {
			var sum = 0;
			for(var j=0; j<this.set.length; j++) {
				var d = this.distance(this.set[j], this.means[i-1]);
				if(d < distances[j]) distances[j] = d;
				sum += distances[j];
			}
			var rnd = Math.random()*sum;
			for(var j=0; rnd > 0; j++) rnd -= distances[j];
			this.means.push(this.set[j-1].map(x=>x));
		}
	} else {
		for(var i=0; i<k; i++) this.means.push(this.set[Math.floor(Math.random()*this.set.length)].map(x=>x));
	}

	this.partition = null;

	//Get current partition : closest mean for each point
	this.getPartition = () => {
		var result = [];
		for(var i=0; i<this.set.length; i++) {
			var min = 1/0;
			var target = -1;
			for(var j=0; j<this.k; j++) {
				var dist = this.distance(this.means[j], this.set[i]);
				if(dist > min) continue;
				min = dist;
				target = j
			}
			result.push(target);
		}
		return this.partition = result;
	}
	this.getPartition();

	this.nextStep = () => {
		var currentPartition = [];
		var sums = [];
		var counts = [];

		for(var i=0; i<this.k; i++) {
			var sum = [];
			for(var j=0; j<this.set[0].length; j++) sum.push(0);
			sums.push(sum);
			counts.push(0);
		}

		for(var i=0; i<this.set.length; i++) {
			var target = this.partition[i];
			currentPartition.push(target);
			for(var j=0; j<this.set[0].length; j++) sums[target][j] += this.set[i][j];
			counts[target]++;
		}
		for(var i=0; i<this.k; i++) {
			if(counts[i] == 0) continue;
			for(var j=0; j<this.set[0].length; j++) sums[i][j] /= counts[i];
		}

		this.means = sums;
		return this.getPartition().map((x,i) => x-currentPartition[i]).filter(x=>x).length > 0;
	}
}

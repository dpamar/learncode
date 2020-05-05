function Markov(size){
	
	this.size = size;
	this.getSize = function() { return this.size; }

	//Initialize matrix
	this.matrix = [];
	for(var i=0; i<size; i++) {
		var vector = [];
		for(var j=0; j<size; j++) vector.push(0);
		this.matrix.push(vector);
	}

	//Add a new probability in matrix
	this.setProbability = function(from, to, probability) {
		this.matrix[to][from] = probability;
	}

	this.getProbability = function(from, to) { return this.matrix[to][from]; }

	//Check that sum of probabilities is always 1
	this.validateMatrix = function() {
		var sums = [];
		for(var from = 0; from < this.size; from++) {
			sums.push(this.matrix.reduce((a,b)=>a + b[from], 0));
		}
		return sums.map((sum, index) => [index, sum]).filter(total => total[1] != 1);
	}

	//Get probabilities after some iterations given initial state
	this.predict = function(iterationCount, initial) {
		return vProduct(fastPow(this.matrix, iterationCount), initial);
	}


	this.testConvergence = function(iterations, threshold) {
		var mat = this.matrix;
		for(var it=0; it<iterations; it++) {
			mat = mProduct(mat, mat);
			next = mProduct(mat, this.matrix);

			var distance = 0;
			for(var i=0; i<this.size; i++) {
				for(var j=0; j<this.size; j++) {
					distance += (mat[i][j] - next[i][j])**2;
				}
			}
			distance = Math.sqrt(distance);
			if(distance < threshold) return mat;
		}
		return null;
	}
}

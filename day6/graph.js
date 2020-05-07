function Graph() {

	this.links = [];
	this.addLink = function(from, to) { this.links.push([from, to]); }

	this.linkMatrix;
	this.generateMatrix = function() {
		this.linkMatrix = [];
		var nodeIndex = {};
		var index = 0;

		this.links.map(link => {
			if(nodeIndex[link[0]] == null) nodeIndex[link[0]] = index++;
			if(nodeIndex[link[1]] == null) nodeIndex[link[1]] = index++;
		});

		for(var i=0; i<index; i++) {
			var row = [];
			for(var j=0; j<index; j++) {
				row.push(false);
			}
			this.linkMatrix.push(row);
		}
		this.links.map(link => this.linkMatrix[nodeIndex[link[0]]][nodeIndex[link[1]]] = 
				this.linkMatrix[nodeIndex[link[1]]][nodeIndex[link[0]]] = true);
	}

	this.getPolynomial = function(includeCoefficients) {
		var coefficients = this.deletionContraction();
		var lambda = x => {
                	var res = 0;
	                for(var i = coefficients.length-1; i >= 0; i--)
        	                res = res * x + coefficients[i];
                	return res;
        	};
		if(includeCoefficients) return [lambda, coefficients];
		return lambda;
	}

	/* Deletion-contraction algorithm
	 *  1. find a link in matrix.
	 *     No link found ==> return X^number of nodes
	 *  2. "Deletion" : remove this link then compute polynom (Pdel)
	 *  3. "Contraction": merge the 2 nodes then compute polynom (Pcon)
	 *  4. return Pdel-Pcon
	*/
	
	this.deletionContraction = function() {

		var nodeCount = this.linkMatrix.length;

		//Find one edge
		var i = -1, j = -1;
		for(var ii=0; i == -1 && ii<nodeCount; ii++) {
			for(var jj=ii+1; jj<nodeCount; jj++) {
				if(this.linkMatrix[ii][jj] == false) continue;
				i = ii;
				j = jj;
				break;
			}
		}

		if(i == -1) {
			var res = [];
			for(var i=0; i<nodeCount; i++) res.push(0);
			res.push(1);
			return res;
		}

		//Deletion
		this.linkMatrix[i][j] = this.linkMatrix[j][i] = false;
		var pDel = this.deletionContraction();
		this.linkMatrix[i][j] = this.linkMatrix[j][i] = true;

		//Contraction
		var row1 = this.linkMatrix.splice(j,1)[0];
		var row2 = this.linkMatrix.splice(i,1)[0];
		var newRow = [];
		for(var index = 0; index<nodeCount; index++) {
			if(index == i || index == j) continue;
			newRow.push(row1[index] || row2[index]);
		}
		newRow.push(false);
		for(var index = 0; index<nodeCount-2; index++) {
			this.linkMatrix[index].splice(j,1);
			this.linkMatrix[index].splice(i,1);
			this.linkMatrix[index].push(newRow[index]);
		}
		this.linkMatrix.push(newRow);

		var pCon = this.deletionContraction();

		this.linkMatrix.pop();
		for(var index = 0; index<nodeCount-2; index++) {
			this.linkMatrix[index].pop();
			this.linkMatrix[index].splice(i, 0, false);
			this.linkMatrix[index].splice(j, 0, false);
		}
		this.linkMatrix.splice(i, 0, row2);
		this.linkMatrix.splice(j, 0, row1);
		for(var index = 0; index<nodeCount; index++) {
			this.linkMatrix[index][i] = this.linkMatrix[i][index];
			this.linkMatrix[index][j] = this.linkMatrix[j][index];
		}

		//Subtract 2 polynoms
		for(var index = 0; index<pCon.length; index++)
			pDel[index] -= pCon[index];
		return pDel;
	}
}

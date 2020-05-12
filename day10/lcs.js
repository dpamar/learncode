function LCS(a, b) {
	
	this.matrix = [];
	this.str1 = a;
	this.str2 = b;
	
	var previousRow, row = [];
	for(var j=0; j <= this.str2.length; j++) row.push(0);
	this.matrix.push(row);
	
	for(var i = 0; i < this.str1.length; i++) {
		previousRow = row;
		row = [0];
		for(var j=0; j < this.str2.length; j++) {
			if(this.str1[i] == this.str2[j]) row.push(previousRow[j] + 1);
			else row.push(Math.max(row[j], previousRow[j+1]));
		}
		this.matrix.push(row);
	}
	
	this.subsequence = '';
	this.diffDetails = [];
	this.diff = function(i,j) {
		if(i > 0 & j > 0 && this.str1[i-1] == this.str2[j-1]) {
			this.diff(i-1, j-1);
			this.subsequence += this.str1[i-1];
			this.diffDetails.push(0);			this.diffDetails.push(0);
		} else if(j > 0 && (!i || this.matrix[i][j-1] >= this.matrix[i-1][j])) {
			this.diff(i, j-1);
			this.diffDetails.push(1);
		} else if(i > 0 && (!j || this.matrix[i][j-1] < this.matrix[i-1][j])) {
			this.diff(i-1, j);
			this.diffDetails.push(-1);
		}
	}
	this.diff(this.str1.length, this.str2.length);
	
	
	this.getLength = () => this.matrix[this.str1.length][this.str2.length];
	this.getSubSequence = () => this.subsequence;
	this.getDiff = () => this.diffDetails;
}

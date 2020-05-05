function mProduct(m1, m2) {
	if(m1[0].length != m2.length) return null;

	var rowCount = m1.length;
	var colCount = m2[0].length;
	var sumCount = m2.length;

	var res = [];
	for(var row = 0; row<rowCount; row++) {
		var vect = [];
		for(var col = 0; col<colCount; col++) {
			var cellValue = 0;
			for(var k = 0; k<sumCount; k++) {
				cellValue += m1[row][k] * m2[k][col];
			}
			vect.push(cellValue);
		}
		res.push(vect);
	}
	return res;
}

function vProduct(matrix, vector) {
	if(matrix[0].length != vector.length) return null;
	return matrix.map(row => row.map((cell, index) => cell*vector[index]).reduce((a,b) => a+b, 0));
}

function fastPow(matrix, exp) {
	if(exp == 1) return matrix;

	var res = fastPow(mProduct(matrix, matrix), exp>>1);
	if(exp & 1) return mProduct(matrix, res);
	return res;
}

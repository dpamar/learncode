/*Polynomials : set of coefficients (from 0 to mod)*/
function Polynomial (galoisField, coefficients) {

	this.field = galoisField;
	this.coefficients = coefficients;
	this.degree = 0;
	this.isZero = true;
	
	//Clean coefficients : make sure the first one is not null (or P = 0)
	this.cleanCoeff = () => {
		while(this.coefficients.length && !this.coefficients[0])
			this.coefficients.shift();
		if(this.isZero = !this.coefficients.length)this.coefficients.push(0);
		this.degree = this.coefficients.length - 1;
	}
	this.cleanCoeff();
	
	
	//Evaluate polynomial. Note : sums and powers ==> use field arithmetic !
	this.evaluate = x => this.coefficients.reduce((res, coeff) => 
		this.field.add(this.field.mul(res,x), coeff),
		0
	);
	
	this.toString = () => this.coefficients.map((x,i) =>`${x}X^${this.degree-i}`).join(' + ');
}

// Sum polynomials : sum monomials' coefficients using field arithmetic rules
function addP(pA, pB) {
	var add = pA.field.add;
	var res = [];
	var degree = pA.degree < pB.degree ? pB.degree : pA.degree;
	for(var i=degree; i >=0 ; i--)
		res.push(add(pA.coefficients[pA.degree - i] || 0, pB.coefficients[pB.degree - i] || 0));
	return new Polynomial(pA.field, res);
}

//Multiply polynomials : monomial of degree k = sum(monomials Ai and Bj with i+j = k)
function mulP(pA, pB) {
	var add = pA.field.add;
	var mul = pA.field.mul;
	var res = [];
	var degree = pA.degree + pB.degree;
	for(var k=0; k <= degree; k++) {
		var coeff = 0;
		for(var i = 0; i <= pA.degree; i++) {
			coeff = add(coeff, mul(pA.coefficients[i], pB.coefficients[k-i]));
		}
		res.push(coeff);
	}
	return new Polynomial(pA.field, res);
}

//Divide polynomials : scale divisor to match highest monomials coefficient, subtract, loop while degree >= divisor's degree
function divP(pA, pB) {
	var add = pA.field.add;
	var mul = pA.field.mul;
	var inv = pA.field.inv;
	
	var coeffInverse = inv(pB.coefficients[0]); //pB = aX^k+ bX^k-1 + ... ==> compute 1/a
	var quotient = pA.coefficients.map(x => 0);
	var remainder = pA.coefficients.map(x => x); //copy coefficients
	while(remainder.length >= pB.coefficients.length) {
		var scaleRatio = mul(remainder[0], coeffInverse); //pA = a'X^q+... ==> compute a'/a
		
		//Update quotient
		var degreeDelta = remainder.length - pB.coefficients.length;
		quotient[quotient.length - 1 - degreeDelta] = add(quotient[quotient.length - 1 - degreeDelta], scaleRatio);

		//Update remainder
		//scaled : a'X^k + ..., align k and q and subtract (= add in this field)
		pB.coefficients.map((x, index) => remainder[index] = add(mul(x, scaleRatio), remainder[index]));		
		//remove null monomials
		while(remainder.length && !remainder[0]) remainder.shift();
	}
	return [new Polynomial(pA.field, quotient), new Polynomial(pA.field, remainder)];
}

function modP(pN, pM) { return divP(pN, pM)[1]; }

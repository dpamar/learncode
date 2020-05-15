function ReedSolomonEncoder(galoisField, base) {
	this.field = galoisField;
	this.base = base;
	
	this.generators = [new Polynomial(this.field, [1])];
	
	this.getGenerator = degree => {
		var maxDegree = this.generators.length;
		var maxGenerator = this.generators[maxDegree-1];
		for(; maxDegree <= degree; maxDegree++) {
			maxGenerator = mulP(maxGenerator,
				new Polynomial(this.field, [1, this.field.exps[maxDegree + this.base - 1]]));
			this.generators.push(maxGenerator);
		}
		return this.generators[degree];
	}

	//Encode : generate data + 2x correctionCount bytes
	this.encode = (data, correctionCount) => {
		var dataLength = data.length;	
		var res = data.map(x=>x);
		for(var i=0; i<correctionCount; i++) res.push(0,0);
		var pCorrection = this.getGenerator(correctionCount<<1);
		var pData = new Polynomial(this.field, res);
		var pMod = modP(pData, pCorrection);
		pMod.coefficients.map(x => res[dataLength++] = x);
		return res;
	}
}

function ReedSolomonDecoder(galoisField, base) {
	this.field = galoisField;
	this.base = base;
	
	//Get syndrome polynomial : evaluate P(2^n) for n=0..correction count, and build a polynomial with these coefficients
	this.getSyndrome = (data, redundancyCount) => {
		var pData = new Polynomial(this.field, data);
		var syndromes = []
		for(var i=redundancyCount-1; i>=0; i--) {
			syndromes.push(pData.evaluate(this.field.exps[i+this.base]));
		}
		return new Polynomial(this.field, syndromes);
	};

	//Extended euclidean algorithm. Result : [gcd(a,b); u; v] where u*a + v*b = gcd(a,b)
	// This one halts before end
	this.euclideanAlgorithm = (a, b, limit) => {
		if(a.degree < b.degree) return this.euclideanAlgorithm(b, a);
		return this.extEuclAlg(
			a, new Polynomial(this.field, [1]), new Polynomial(this.field, []),
			b, new Polynomial(this.field, []), new Polynomial(this.field, [1]),
			limit);
	}
	
	this.extEuclAlg = (rPrev, uPrev, vPrev, rCurrent, uCurrent, vCurrent, limit) => {
		if(rCurrent.degree < limit) return [rCurrent, uCurrent, vCurrent];
		var div = divP(rPrev, rCurrent);
		var q = div[0], rNext = div[1];
		var uNext = addP(uPrev, mulP(uCurrent, q));
		var vNext = addP(vPrev, mulP(vCurrent, q));
		return this.extEuclAlg(rCurrent, uCurrent, vCurrent, rNext, uNext, vNext, limit);
	}
	
	this.findErrors = (pLocator, pEvaluator) => {
		var add = this.field.add;
		var mul = this.field.mul;
		var inv = this.field.inv;
		var log = this.field.logs;
		
		var result = [];
		var errorCount = pLocator.degree;
		
		//Find error locations : roots of locator
		var locations = [];
		var locationInverses = [];
		for(var i=0; i<=this.field.mod; i++) {
			if(pLocator.evaluate(i) == 0) {
				locations.push(i);
				locationInverses.push(this.field.inv(i));
			}
		}

		//Find error values
		for(var i=0; i<errorCount; i++) {
			var l = locations[i];
			var d = 1;
			for(var j=0; j<errorCount; j++) {
				if(i != j) {
					d = mul(d, add(1, mul(locationInverses[j], l)));
				}
			}
			var value = mul(pEvaluator.evaluate(l), inv(d));
			if(this.base) value = mul(value, l);
			result.push([log[locationInverses[i]], value]);
		}
        return result;
    }

	this.decode = (data, redundancyCount) => {
		var add = this.field.add;
		var mul = this.field.mul;
		var inv = this.field.inv;
		
		var syndrome = this.getSyndrome(data, redundancyCount*2);
		if(syndrome.isZero) {
			var resData = data.slice(0, data.length - redundancyCount*2);
			return [resData, []];
		}
		var monomial = [1];
		for(var i=0; i<redundancyCount; i++) monomial.push(0,0);
		var euclidResult = this.euclideanAlgorithm(new Polynomial(this.field, monomial), syndrome, redundancyCount);
		var gcd = euclidResult[0];
		var v = euclidResult[2];
		var factor = inv(v.coefficients[v.degree]);
		gcd.coefficients = gcd.coefficients.map(x=>mul(factor, x));
		v.coefficients = v.coefficients.map(x=>mul(factor, x));
		
		var errors = this.findErrors(v, gcd);
		var resData = data.slice(0, data.length - redundancyCount*2);
		errors = errors.map(error => {
			var position = data.length - 1 - error[0];
			if(position < resData.length)
				resData[position] = add(resData[position], error[1]);
			return [position, error[1]];
		});
		return [resData, errors];
	}
}

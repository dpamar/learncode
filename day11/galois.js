function Galois(size, polynomial) {

	this.mod = (1<<size) - 1;

	this.generator = polynomial;

	this.exps = [];
	this.logs = [0];
	var elem = 1;
	for(var i=0; i < this.mod; i++) {
		//Compute / store 2^n, and inverse 
		this.exps.push(elem);
		this.logs[elem] = i;

		elem <<= 1;
		if(elem > this.mod) elem = (elem^this.generator) & this.mod;
	}
	this.exps.push(elem);
	
	//This is a vector space. There are 2 ways to consider vectors.
	//1) A set of values (each one is either 0 or 1). Similar to cartesian coordinates of 2D vectors
	//2) A "power of 2" (as defined in our field, not a regular decimal 2^n integer)
	//Each notation has pros and cons. 1st is efficient for addition (see below), second for multilications / inverses

	//Add 2 vectors : sum each pair of values. And 1+1 = 0. So, just compute XOR
	this.add = (a, b) => a^b;

	//Multiply 2 vectors: (a=2^A) * (b=2^B) = 2^(A+B) ==> Find A and B (using log table) and return 2^(A+B modulo mod)
	this.mul = (a,b) => a && b && this.exps[(this.logs[a] + this.logs[b]) % this.mod];
	
	//Inverse : given (n=2^N), find (q=2^Q) so that n.q = 2^(N+Q) = 1 (=2^0) ==> Q + N = 0 modulo mod
	this.inv = n => this.exps[this.mod - this.logs[n]];

	//Exp and log : use cache
	this.exp = n => this.exps[n];
	this.log = n => this.logs[n];
}
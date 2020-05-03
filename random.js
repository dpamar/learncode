function Random(mod) {
	this.mod = mod;
	this.buffer = [];
	for(var i=0; i<55; i++) this.buffer.push((100003 - 200003*i + 300007*i*i*i) % this.mod);
	
	this.getNext =function() {
		var next = (this.buffer[0] + this.buffer[31])%this.mod;
		this.buffer.push(next);
		return this.buffer.shift();
	}
}

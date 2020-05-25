function Color(hue, saturation, value) {
	this.h = hue;
	this.s = saturation;
	this.v = value;

	this.toRGB = () => {
		var c = this.v * this.s;
		var x = c * (1 - Math.abs((this.h/60)%2 - 1));
		var m = this.v - c;

		var rgb = [];
		switch(Math.floor(this.h/60)) {
			case 0: rgb = [c, x, 0]; break;
			case 1: rgb = [x, c, 0]; break;
			case 2: rgb = [0, c, x]; break;
			case 3: rgb = [0, x, c]; break;
			case 4: rgb = [x, 0, c]; break;
			case 5: rgb = [c, 0, x]; break;
		}
		return rgb.map(value => (value + m)*255);
	}
}

function ColorWheel(seed, saturationFunction, valueFunction) {

	this.colorCount = 0;
	this.hue = seed || 0;
	this.saturation = saturationFunction || (() => 1);
	this.value = valueFunction || (() => 1);

	this.goldenAngle = 180 * (3-Math.sqrt(5));

	this.getNext = () => {
		var c = new Color(this.hue, this.saturation(this.colorCount), this.value(this.colorCount));
		this.colorCount++;
		this.hue = (this.hue + this.goldenAngle) % 360;
		return c.toRGB();
	}

}

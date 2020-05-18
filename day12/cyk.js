function GrammarRule(source, target1, target2) {
	this.source = source;
	if(target1 && target1.match(/^\/.*\/$/)) {
		this.target1 = eval(target1);
		this.isRegex = true;
	} else {
		this.target1 = target1;
		this.isRegex = false;
	}
	this.target2 = target2;
	this.isTerminal = target2 == null;
}

function Grammar() {
	this.rules = [];
	this.terminalRules = [new GrammarRule("S", null, null)];

	this.addRule = (s, t1, t2) => (t2 == null ? this.terminalRules : this.rules).push(new GrammarRule(s, t1, t2));

	this.getRulesByTerminal = t => t ? this.terminalRules.filter(r => r.isRegex ? t.match(r.target1) : r.target1 == t) : [this.terminalRules[0]];
	this.getRulesByUnion = (set1, set2) => {
		var list1 = set1.flatMap(t1 => this.rules.filter(r => r.target1 == t1));
		return set2.flatMap(t2 => list1.filter(r => r.target2 == t2));
	}

	this.read = (terminals) => {
		//Init with terminals
		var stepCount = 1;
		var steps = [terminals.map(t => this.getRulesByTerminal(t))];
		while(stepCount < terminals.length) {
			var nextStep = [];
			for(var start = 0, end = stepCount; end < terminals.length; start++, end++){
				var union = []; 
				for(var middle = 0; middle < stepCount; middle++) {
					union.push(...this.getRulesByUnion(steps[middle][start].map(r => r.source), steps[stepCount-middle-1][middle+start+1].map(r=> r.source)));
				}
				nextStep.push(union);
			}
			steps.push(nextStep);
			stepCount++;
		}
		return steps;
	}
}

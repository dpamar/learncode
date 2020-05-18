function Operator(symbol, priority, leftAssociativity, paramsCount, fct) {
	this.symbol = symbol;
	this.priority = priority;
	this.leftAssociativity = leftAssociativity;
	this.parametersCount = paramsCount;
	this.evaluate = fct;
}

function OperatorLibrary() {
	this.operators = {};
	this.addOperator = (symbol, prio, asso, pCount, fct) => this.operators[symbol] = new Operator(symbol, prio, asso, pCount, fct);
	this.findOperator = op => this.operators[op];
	
	this.constants = {};
	this.addConstant = (name, value) => this.constants[name] = value;
	this.findConstant = c => this.constants[c];
}

function loadMaths(opLib) {
	opLib.addOperator("+", 1, true, 2, (a,b)=>a+b);
	opLib.addOperator("-", 1, true, 2, (a,b)=>a-b);
	opLib.addOperator("*", 2, true, 2, (a,b)=>a*b);
	opLib.addOperator("/", 2, true, 2, (a,b)=>a/b);
	opLib.addOperator("^", 3, false, 2, (a,b)=>a**b);
	opLib.addOperator("!", 4, false, 1, a=>{if(a <= 0) return 1; for(res = 1, i=1; i<=a; i++)res *= i; return res;});
	
	opLib.addConstant("pi", Math.PI);
	opLib.addConstant("e", Math.E);
}

function evaluate(tokens, opLibrary, rpn) {
	
	var applyOperator = () => {
		var op = opStack.shift();
		if(rpn) { outputStack.push(op.symbol); return; }
		var params = [];
		for(var i=0; i<op.parametersCount; i++) params.unshift(outputStack.pop());
		outputStack.push(op.evaluate(...params));
	}
	
	var opStack = [];
	var outputStack = [];
	
	for(var i =0; i<tokens.length; i++) {
		var token = tokens[i];
		var operator = null;
		var constant = null;
		
		if(token.match(/[0-9]+/)) {
			outputStack.push(parseInt(token));
			
		} else if(constant = opLibrary.findConstant(token)) {
			outputStack.push(constant);
			
		} else if (operator = opLibrary.findOperator(token)) {
			while(opStack[0] != null && opStack[0] != "("
				 && (opStack[0].priority > operator.priority
					|| opStack[0].priority == operator.priority && opStack[0].leftAssociativity)) {
				//Apply operator and push result
				applyOperator();
			}
			opStack.unshift(operator);
			
		} else if (token == "(") {
			opStack.unshift(token);
			
		} else if (token == ")") {
			while(opStack[0] != "(") applyOperator();
			opStack.shift();
		}
	}
	while(opStack.length) applyOperator();
	return outputStack;
}
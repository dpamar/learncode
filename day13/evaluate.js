function Operator(symbol, priority, leftAssociativity, paramsCount, fct) {
	this.name = symbol;
	this.priority = priority;
	this.leftAssociativity = leftAssociativity;
	this.paramsCount = paramsCount;
	this.execute = fct;
	this.type = "op";
}

function Fct(name, paramsCount, fct) {
	this.name = name;
	this.paramsCount = paramsCount;
	this.execute = fct;
	this.type = "fct";
}

function OperatorLibrary() {
	this.operators = {};
	this.addOperator = (symbol, prio, asso, pCount, fct) => this.operators[symbol] = new Operator(symbol, prio, asso, pCount, fct);
	this.findOperator = op => this.operators[op];
	
	this.constants = {};
	this.addConstant = (name, value) => this.constants[name] = value;
	this.findConstant = c => this.constants[c];

	this.functions = {};
	this.addFunction = (name, pCount, fct) => this.functions[name] = new Fct(name, pCount, fct);
	this.findFunction = n => this.functions[n];
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

	opLib.addFunction("sin", 1, Math.sin);
	opLib.addFunction("cos", 1, Math.cos);
	opLib.addFunction("tan", 1, Math.tan);
	opLib.addFunction("sqrt", 1, Math.sqrt);
	opLib.addFunction("max", 2, (a,b) => a < b ? b : a);
	opLib.addFunction("min", 2, (a,b) => a > b ? b : a);
}

function loadBool(opLib) {
	opLib.addOperator("<", 0, true, 2, (a,b) => a < b);
	opLib.addOperator(">", 0, true, 2, (a,b) => a > b);
	opLib.addOperator("=", 0, true, 2, (a,b) => a == b);
	opLib.addOperator("~", 0, true, 2, (a,b) => a != b);

	opLib.addConstant("true", true);
	opLib.addConstant("false", true);

	opLib.addFunction("not", 1, x=>!x);
}

function evaluate(tokens, opLibrary, rpn) {
	
	var applyOperator = () => {
		var op = opStack.shift();
		if(rpn) { outputStack.push(op.name); return; }
		var params = [];
		for(var i=0; i<op.paramsCount; i++) params.unshift(outputStack.pop());
		outputStack.push(op.execute(...params));
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
			
		} else if (operator = opLibrary.findFunction(token)) {
			opStack.unshift(operator);

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
			
		} else if (token == ")" || token == ",") {
			while(opStack[0] != "(") applyOperator();
			if(token == ",") continue;
			opStack.shift();
			if(opStack[0] && opStack[0].type == "fct") applyOperator();
		}
	}
	while(opStack.length) applyOperator();
	return outputStack;
}

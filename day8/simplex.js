function Constraint (coefficients, target, isEqual) {
	this.coefficients = coefficients;
	this.target = target;
	this.isEqual = isEqual;
}
//Str: multiple times (
//         [+ or - or nothing (+)]
//         [coefficient or nothing(1)]
//         [X or x]
//         [index from 1 to varCount]
//     )
//     [= or <=]
//     [target]
function parseConstraint (str, varCount) {
	var match1 = str.match(/^(( *[+-]? *[0-9]* *X[0-9]+)+) *(<=|=) *([+-]?[0-9]+) *$/i);
	if(match1 == null) return null;
	var equation = match1[1];
	var symbol = match1[3];
	var target = parseInt(match1[4]);
	
	var coefficients = [];
	for(var i=0; i<varCount; i++) coefficients.push(0);
	//Use replace instead of matchAll (IE / Safari support...)
	equation.replace(/ *([+-]?) *([0-9]*) *X([0-9]+)/gi, (m, sign, coeff, varname)=>{
		var c = parseInt(coeff || 1);
		if(sign == '-') c = -c;
		coefficients[parseInt(varname)-1] += c;
	});
	return new Constraint(coefficients, target, symbol == '=');
}


function Simplex(varCount) {

	this.variableCount = varCount;
	this.totalVariableCount = varCount;

	this.constraints = [];
	this.addConstraint = function(constr) { this.constraints.push(constr);	}
	
	this.objective = [];
	this.setObjective = function(coefficients) { this.objective = coefficients; }
	this.parseObjective = function(str) { 
		var match1 = str.match(/^ *Z *=( *[+-]? *[0-9]* *X[0-9]+)+ *$/i);
		if(match1 == null) return;

		var coefficients = [];
		for(var i=0; i<varCount; i++) coefficients.push(0);
		str.replace(/ *([+-]?) *([0-9]*) *X([0-9]+)/gi, (m, sign, coeff, varname)=>{
			var c = parseInt(coeff || 1);
			if(sign == '-') c = -c;
			coefficients[parseInt(varname)-1] += c;
		});
		this.setObjective(coefficients);
	}
	
	this.matrix = null;
	this.buildMatrix = function() {
		//Build matrix
		this.matrix = [];

		//1. Add slack variables (one per inequality)
		//   Get one 0 per slack variable
		var slackRow = this.constraints.filter(x => !x.isEqual).map(x => 0);
		this.totalVariableCount = this.variableCount + slackRow.length;
		
		//2. Add constraints :
		//   copy coefficients 
		//   add slack variables, set slack var to 1 if needed (inequality)
		//   add target
		var slackIndex = 0;
		this.constraints.map(constr => {
			var row = [...constr.coefficients, ...slackRow, constr.target];
			if(!constr.isEqual) row[this.variableCount + slackIndex++] = 1;
			this.matrix.push(row);
		});
		
		//3. Add objective function
		//   -1 * objective coefficients
		//   Slack zeros
		//   objective value (0)
		this.matrix.push([...this.objective.map(x => -x), ...slackRow, 0]);
	}
	
	this.findPivot = function() {
		//Find pivot column : min negative value from objective row
		var obj = this.matrix[this.constraints.length];
		var min = 0, pivotColIndex = -1;
		for(var i=0; i<this.totalVariableCount; i++) {
			if(obj[i] >= min) continue;
			min = obj[i];
			pivotColIndex = i;
		}

		//Min is 0 : no optimization possible, return false
		if(min == 0) return null;

		//Find pivot row : min positive ratio target / pivotCol
		var min = +1/0, pivotRowIndex = -1;
		for(var i=0; i<this.constraints.length; i++) {
			var cell = this.matrix[i][pivotColIndex];
			var target = this.matrix[i][this.totalVariableCount];
			if(cell == 0) continue;
			var ratio = target/cell;
			if(ratio < 0 || ratio == 0 && cell < 0) continue;
			if(ratio >= min) continue;
			min = ratio;
			pivotRowIndex = i;
		}
		return [pivotRowIndex, pivotColIndex];
	}
	
	this.nextStep = function() {
		
		//Get pivot
		var pivot = this.findPivot();
		if(pivot == null) return false;
		
		var pivotRowIndex = pivot[0];
		var pivotColIndex = pivot[1];
		
		//Pivot matrix
		//1. Normalize row
		var factor = this.matrix[pivotRowIndex][pivotColIndex];
		for(var i=0; i <= this.totalVariableCount; i++) {
			this.matrix[pivotRowIndex][i] /= factor;
		}
		
		//2. Update other rows
		for(var i=0; i <= this.constraints.length; i++) {
			if(i == pivotRowIndex) continue;
			var factor = this.matrix[i][pivotColIndex];
			for(var j=0; j <= this.totalVariableCount; j++) {
				this.matrix[i][j] -= factor * this.matrix[pivotRowIndex][j];
			}
		}
		return true;
	}
	
	this.getResults = function() {
		var base = [];
		for(var i=0; i < this.totalVariableCount; i++) {
			base.push(0);
			if(this.matrix[this.constraints.length][i] == 0) {
				for(var j=0; j<this.constraints.length; j++) {
					if(this.matrix[j][i] != 0) base[i] = this.matrix[j][this.totalVariableCount];
				}
			}
		}
		return base;
	}
	
	this.getOptimum = function() { return this.matrix[this.constraints.length][this.totalVariableCount];}
	
	this.run = function() {
		while(this.nextStep());
		return this.getResults();
	}
}
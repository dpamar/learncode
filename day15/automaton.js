function Automaton () {
	//state names
	this.stateNames = [];
	//transition symbols
	this.symbols = [];
	
	//Trash state name
	this.trashState = null;
	
	//state matrix : get targets from state N when reading symbol S
	this.matrix = null;
	
	//state / symbol maps : get index from name / symbol, fast
	this.stateMap  = {};
	this.symbolMap = {};
	
	//Initials and final states
	this.initials = [];
	this.finals   = [];

    /* Initialize graph */
	this.transitions = [];
	this.initMatrix = () => {
	//Init and fill matrix
		this.matrix = this.stateNames.map(st => this.symbols.map(s=>[]));
		this.transitions.map(tr => this.matrix[tr[0]][tr[1]].push(tr[2]));
	}
	
	//Add transition: "from" state (matrix rows), reading "symbol" symbol (column)
	//May be non deterministic automaton, hence multiple targets are possibles
	this.addTransition = (from, symbol, to) => {
		var symbolIndex = this.symbolMap[symbol];
		if(symbolIndex == null) {
			symbolIndex = this.symbolMap[symbol] = this.symbols.length;
			this.symbols.push(symbol);
		}
		this.transitions.push([this.getStateIndex(from), symbolIndex, this.getStateIndex(to)]);
	}
	
	//Set initial and final states
	this.setInitial = (state) => this.initials[this.getStateIndex(state)] = 1;
	this.setFinal   = (state) => this.finals  [this.getStateIndex(state)] = 1;
	this.getStateIndex = s => {
		var res = this.stateMap[s];
		if(res == null) {
			res = this.stateMap[s] = this.stateNames.length;
			this.stateNames.push(s);
			this.initials.push(0);
			this.finals.push(0);
		}
		return res;
	}

	/* Automaton determinism */
	
	//An automaton is deterministic if, for each "from" state and symbol read, there is at most one way to process this symbol
	//Another condition : at most one initial state.
	this.isDeterministic = () => {
		if(this.matrix == null) this.initMatrix();
		var alreadyInitial = false;
		for(var i=0; i<this.stateNames.length; i++) {
			if(this.initials[i]) {
				if(alreadyInitial) return false;
				alreadyInitial = true;
			}
			for(var j=0; j<this.symbols.length; j++)
				if(this.matrix[i][j].length > 1) return false;
		}
		return true;
	}
	
	this.makeDeterministic = () => {
		if(this.isDeterministic()) return;

		var newStates = [];
		var newMatrix = [];
		var newMap    = {};
		
		var newInitials = [];
		var newFinals   = [];

		//One element in queue : set of "real" states, merged into one
		var stateQueue   = [];

		//Start with initial states
		var firstInQueue = [];
		for(var i=0; i<this.stateNames.length; i++)if(this.initials[i]) firstInQueue.push(i);
		stateQueue.push(firstInQueue);
		var name = firstInQueue.join('#');
		newInitials.push(true);
		newStates.push(name);
		newMap[name] = 0;

		
		while(stateQueue.length) {
			var state = stateQueue.shift();
			//Pseudo state is final if at least one of the real states behind is final
			newFinals.push(state.filter(x => this.finals[x]).length > 0 ? 1 : 0);
			
			var matrixRow = [];
			for(var j=0; j<this.symbols.length; j++) {
				//Get target(s) from pseudo state, reading symbol j
				var targets = [];
				for(var i=0; i<this.stateNames.length; i++) targets.push(false);
				state.map(s => this.matrix[s][j].map(t => targets[t] = true));
				var nextInQueue = [];
				for(var i=0; i<this.stateNames.length; i++)if(targets[i]) nextInQueue.push(i);
				if(nextInQueue.length == 0) {
					matrixRow.push([]);
					continue;
				}
				var name = nextInQueue.join('#');
				var index = newStates.indexOf(name);
				if(index == -1) {
					stateQueue.push(nextInQueue);
					index = newMap[name] = newStates.length;
					newStates.push(name);
					newInitials.push(false);
				}
				matrixRow.push([index]);
			}
			newMatrix.push(matrixRow);
		}
		this.matrix = newMatrix;
		this.stateNames = newStates;
		this.stateMap = newMap;
		this.finals = newFinals;
		this.initials = newInitials;
	}
	
	/* Automaton completion */
	
	//An automaton is complete if, for each "from" state, any symbol can be read
	this.isComplete = () => {
		if(this.matrix == null) this.initMatrix();
		for(var i=0; i<this.stateNames.length; i++)
			for(var j=0; j<this.symbols.length; j++)
				if(this.matrix[i][j].length == 0) return false;
		return true;
	}
	
	//Make automaton complete : add a trash state if needed where all missing transitions go
	this.makeComplete = () => {
		if(this.isComplete()) return;
		
		//Find unique name for trash state
		this.trashState = "Trash";
		while(this.stateMap[this.trashState] != null) this.trashState += "_1";
		var trashStateIndex = this.stateNames.length;

		//Update matrix
		for(var i=0; i<this.stateNames.length; i++) {
			for(var j=0; j<this.symbols.length; j++) {
				if(this.matrix[i][j].length == 0) this.matrix[i][j].push(trashStateIndex);
			}
		}
		this.matrix.push(this.symbols.map(s => [trashStateIndex]));
		
		//Add trash state
		this.stateMap[this.trashState] = this.stateNames.length;
		this.stateNames.push(this.trashState);
		this.initials.push(false);
		this.finals.push(false);
	}
	
	
	//Minimize automaton
	
	this.minimize = () => {
		//Make automaton deterministic
		this.makeDeterministic();
		
		//Make automaton complete
		this.makeComplete();
		
		//First partition : terminals (finals) VS non-terminals (all the other ones)
		var currentPartition = [];
		for(var i=0; i<this.stateNames.length; i++) currentPartition.push(this.finals[i] ? 1 : 0);
		var partitionCount = this.finals.filter(x=>!x).length ? 2 : 1;
		//Applying Nerode equivalence
		while(true) {
			var newPartition = [];
			var newPartitionCount = this.stateNames.length;
			
			var nextMatrix = [];
			//For each "source/symbol" pair:
			//    Deterministic : no more than one value
			//    Complete : at least one value
			for(var i=0; i<this.stateNames.length; i++) {
				var newRow = [];
				for(var j=0; j<this.symbols.length; j++) newRow.push(currentPartition[this.matrix[i][j][0]]);
				nextMatrix.push(newRow);
			
				//Create new partition or group 
				newPartition.push(i);
				for(var k=0; k<i; k++) {
					if(newPartition[k] != k) continue; //This one is identical to at least one previous row (row #k'<k)
					//Try to goup with existing (sub)partition
					if(currentPartition[k] != currentPartition[i]) continue; // first condition : check that both are from same initial partition					
					//Second condition : identical row in matrix
					for(var identical = true, j=0; identical && j<this.symbols.length; j++) identical &= (nextMatrix[k][j] == newRow[j]);
					
					//Identical partition found : update partition and partitions count
					if(identical) {
						newPartition[i] = k;
						newPartitionCount--;
						break;
					}
				}
			}
			if(partitionCount == newPartitionCount) break;
			partitionCount = newPartitionCount;
			currentPartition = newPartition;
		}
		//currentPartition : new state names (needs some cleansing)
		//Now, recreate graph from these details
		
		//First, remove trash state
		var trashIndex = -1;
		if(this.trashState != null) {
			this.stateNames.pop();
			this.initials.pop();
			this.finals.pop();
			this.trashState = null;
			trashIndex = this.stateNames.length;
			currentPartition.pop();
		}
		
		
		//Then, rebuild initial and final states, and clean partition index (avoid gaps)
		var newInitials = [];
		var newFinals = [];
		var offset = 0;
		var isDuplicate = [];
		for(var i=0; i<currentPartition.length; i++) {
			currentPartition[i] -= offset;
			if(currentPartition[i] != i - offset) {
				// duplicate in partition
				offset++; 
				isDuplicate[i]         = true;
				newInitials[i-offset] |= this.initials[i];
				newFinals[i-offset]   |= this.finals[i];
			} else {
				isDuplicate[i] = false;
				newInitials.push(this.initials[i]);
				newFinals.push(this.finals[i]);
			}
		}
		this.initials = newInitials;
		this.finals = newFinals;

		//Finally, rebuild new state names and clean matrix
		this.stateNames = [];
		this.stateMap   = {};
		var newMatrix   = [];
		var stateCount  = 0;
		for(var i=0; i<currentPartition.length; i++) {
			if(isDuplicate[i]) continue; // Duplicate state: ignore
			
			//New state name and map
			var stName = `M${currentPartition[i]}`;
			this.stateNames.push(stName);
			this.stateMap[stName] = stateCount++;
			
			//New row : was pointing at X, now points at X's partition state - except if it was trash state
			var matrixRow = [];
			for(var j=0; j<this.symbols.length; j++) matrixRow.push(this.matrix[i][j][0] == trashIndex ? [] : [currentPartition[this.matrix[i][j][0]]]);
			newMatrix.push(matrixRow);
		}
		this.matrix = newMatrix;
		
	}
	
	this.toString = () => {
		if(this.matrix == null) this.initMatrix();
		var result = [];
		result.push(...this.initials.map((x,i) => x ? `() => ${this.stateNames[i]}` : '').filter(x=>x.length));
		result.push(...this.finals.map((x,i) => x ? `${this.stateNames[i]} => ()` : '').filter(x=>x.length));
		for(var i=0; i<this.stateNames.length; i++)
			for(var j=0; j<this.symbols.length; j++)
				for(var k = 0; k < this.matrix[i][j].length; k++)
					result.push(`${this.stateNames[i]} => ${this.symbols[j]} => ${this.stateNames[this.matrix[i][j][k]]}`);
		return result.join('\n');
	}

	//Get regular expression that matches automaton language
	this.toRegex = () => {
		if(this.matrix == null) this.initMatrix();

		//Get a different matrix : rows = from state, cols : to state, value : patterns (initialied with symbols, and there may be more than one pattern / symbol, or none)
		//No need to have a deterministic graph, but let's add a fake state "Start" linked to all initial nodes and another one "End" linked to terminals
		var mat = [];
		var startRow = [[]], endRow = [[]];
		for(var i=0; i<this.stateNames.length; i++) {
			if(this.initials[i]) startRow.push(['^']); else startRow.push([]);
			endRow.push([]);
		}
		startRow.push([]); endRow.push([]);
		mat.push(startRow);

		for(var i=0; i<this.stateNames.length; i++) {
			var matRow = [[], ...this.stateNames.map(st => [])];
			if(this.finals[i]) matRow.push(['$']); else matRow.push([]);
			for(var j=0; j<this.symbols.length; j++) this.matrix[i][j].map(target => matRow[target+1].push(this.symbols[j]));
			mat.push(matRow);
		}

		mat.push(endRow);

		//Reduction : remove each state, one by one, until one single state remains
		//Remove state N :
		// 1. for each state M, if N=>M has more than one pattern : replace by a single pattern "(pattern1|pattern2|...)". pAB is "pattern from A to B" if it exists
		// 2. if pNN exists, replace all existing pNM by (pNN)*pNM
		// 3. replace any pMN by multiples pMX, one for each existing pNX. A new attern from M to X is the global pattern P->N->X (or P->N->N....->N->X)
		// 4. State N can now be ignored or removed. Loop until only start states remains
		// Start from last state (End) and move to first (Start) : result is a string ^.....$
		
		for(var i = mat.length-1; i>=0; i--) {
			//Nth state (index i)
			var state = mat[i];
			
			//One single pattern (null if no pattern at all, the single pattern if already only one, or (pattern1|pattern2|...) otherwise)
			state = state.map(patterns => {
				if(patterns.length == 0) return null;
				if(patterns.length == 1) return patterns[0];
				return "(" + patterns.join('|') + ")";
			});


			//pNN is not null => update all pNX
			if(state[i] != null) state = state.map(pattern => pattern && (state[i] + "*" + pattern));

			//Update all pMN
			for(var j=0; j<i; j++) {
				if(mat[j][i].length == 0) continue;
				var newPattern = mat[j][i].length == 1 ? mat[j][i][0] : "(" + mat[j][i].join('|') + ")";
				state.map((pattern, index) => pattern && mat[j][index].push(newPattern + pattern));
			}
		}

		//now pStartEnd contains our regex
		var regexFinal = mat[0][mat.length-1];
		if(regexFinal.length == 0) return '';
		if(regexFinal.length == 1) return '/' + regexFinal[0] + '/';
		return '/^(' + regexFinal.map(x=>x.substr(1, x.length-2)).join('|') + ')$/';
	}
}

<html>
	<head>
		<title>Grammar parser</title>
		<script src="cyk.js"></script>
		<script>
var g;
function generateGrammar() {
	g = new Grammar();
	document.getElementById('grammar').value
		.split('\n')
		.map(r => {
			var m = r.replace(/\/\/.*/,'').match(/^([^ ]+?) ?=> ?([^ ]+)( ([^ ]+))? *$/);
			if(!m) return null;
			var source = m[1];
			var target1 = m[2];
			var target2 = m[4];
			g.addRule(source, target1, target2);
	});
	parseText();
}

function parseText() {
	var text = document.getElementById('text').value.match(/([a-zA-Z0-9]+|:=|[^ \n])/g).filter(x=>x.length != 0);
	var result = g.read(text);
	var valid = result[text.length-1][0].filter(x=>x.source == 'S').length != 0;
	document.getElementById('text').style.backgroundColor = valid ? 'greenyellow' : 'lightcoral';
}
		</script>
	</head>
	<body onload="generateGrammar()">
		<table>
			<tr>
				<td>
					Enter grammar rules CNF (S: start, nonterminal => terminal or nonterminal => nonterminal1 nonterminal2)
					<br/>
					<textarea id="grammar" onkeyup="generateGrammar();" style="width: 400px; height: 700px">//Quick&Dirty language
S => Instruction NextInstruction
S => Instruction InstructionSeparator
NextInstruction=> InstructionSeparator S
InstructionSeparator => ;

//Declare
Instruction => Declaration Label
Instruction => Declaration Labels
Labels => Label NextLabel
NextLabel => LabelSeparator Label
NextLabel => LabelSeparator Labels
LabelSeparator => ,
Declaration => var
Declaration => function

//Assign
Instruction => Assignee Value
Assignee => Label AssignSymbol
AssignSymbol => :=

//Call
Instruction => Label Parameters
Parameters => OpenParenthesis CloseParenthesis
Parameters => OpenParenthesis InsideParameters
InsideParameters => Value CloseParenthesis
InsideParameters => Value NextParameters
NextParameters => ParameterSeparator InsideParameters
OpenParenthesis => (
CloseParenthesis => )
ParameterSeparator => ,


//Values
Value => Value OpValue
OpValue => OpSymbol Value
Value => Label Parameters
OpSymbol => /[+*-]/

Label => /^[A-Za-z_][A-Za-z_0-9]+$/
Value => /^[1-9][0-9]*$/
Value => /^[A-Za-z_][A-Za-z_0-9]+$/</textarea>
				</td>
				<td>
					Enter text to read :
					<br/>
					<textarea id="text" style="width: 400px; height: 400px;" type="text" onkeyup="parseText()">var z1, z2;
function f1;

z1 := 1+200*3-4;

f1(1);

z2 :=  f1(z1, 1);</textarea>
					<br/>
				</td>
			</tr>
		</table>
	</body>
</html>

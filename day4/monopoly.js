function Monopoly() {
	this.markov = new Markov(120);
	this.addOne = function(from, to) {
		this.markov.setProbability(from, to, this.markov.getProbability(from, to)+1);
	}
	this.increaseProbability = function(from, to, increase) {
		this.markov.setProbability(from, to, this.markov.getProbability(from, to) + increase);
	}

	this.init = function() {
		for(var start=0; start<120; start++) {
			var dblCount = start % 3;
			var cell = (start - dblCount) / 3;

			for(var d1 = 1; d1 <=6; d1++) {
				for(var d2 = 1; d2 <= 6; d2++) {
					var target = (cell + d1 + d2)*3 % 120;
					if(d1 == d2) {
						// another double
						if(dblCount == 2) {
							//3rd one ==> go to jail
							this.addOne(start, 10 * 3);
						} else {
							//Another chance :)
							this.addOne(start, target + dblCount + 1);
						}
					} else {
						// no double : reset count
						this.addOne(start, target);
					}
				}
			}
		}
		//Divide by 36 to get probabilities
		for(var i=0; i<this.markov.getSize(); i++)
			for(var j=0; j<this.markov.getSize(); j++)
				this.markov.setProbability(i, j, this.markov.getProbability(i,j)/36);
			
		//Go to Jail cell
		for(var start=0; start<this.markov.getSize(); start++) {
			for(var doubleCount = 0; doubleCount<3;doubleCount ++) {
				var probability = this.markov.getProbability(start, 30*3 + doubleCount);
				this.markov.setProbability(start, 30*3 + doubleCount, 0);
				this.increaseProbability(start, 10*3, probability);
			}
		}

		//Handle Chance
		[7,22,36].map(chanceCell => {
			for(var doubleCount = 0; doubleCount < 2; doubleCount ++) {
				var target = chanceCell * 3 + doubleCount;
				for(var start = 0; start < this.markov.getSize(); start++) {
					var initialProbability = this.markov.getProbability(start, target);
					//Départ
					this.increaseProbability(start,  0*3 + doubleCount, initialProbability / 16);
					//Prison
					this.increaseProbability(start, 10*3 + doubleCount, initialProbability / 16);
					//Bd de la Villette
					this.increaseProbability(start, 11*3 + doubleCount, initialProbability / 16);
					//Gare de Lyon
					this.increaseProbability(start, 15*3 + doubleCount, initialProbability / 16);
					//Avenue Henri Martin
					this.increaseProbability(start, 24*3 + doubleCount, initialProbability / 16);
					//Rue de la paix
					this.increaseProbability(start, 39*3 + doubleCount, initialProbability / 16);
					//Reculez de trois cases
					this.increaseProbability(start, target-9, initialProbability / 16);
					//9 other cards
					this.markov.setProbability(start, target, initialProbability * 9/16);
				}
			}
		});
		
		//Handle Community Chest
		[2,17,33].map(chestCell => {
			for(var doubleCount = 0; doubleCount < 2; doubleCount ++) {
				var target = chestCell * 3 + doubleCount;
				for(var start = 0; start < this.markov.getSize(); start++) {
					var initialProbability = this.markov.getProbability(start, target);
					//Départ
					this.increaseProbability(start,  0*3 + doubleCount, initialProbability / 16);
					//Bd de la Belleville
					this.increaseProbability(start,  1*3 + doubleCount, initialProbability / 16);
					//Prison
					this.increaseProbability(start, 10*3 + doubleCount, initialProbability / 16);
					//13 other cards
					this.markov.setProbability(start, target, initialProbability * 13/16);
				}
			}
		});
		
	}
	this.run = function() {
		var convergence = this.markov.testConvergence(10000, 0.00001);
		var vecteur = [1];
		for(var i=1; i<this.markov.getSize(); i++) vecteur.push(0);
		return vProduct(convergence, vecteur);
	}
}

var names = [
	'Case D&eacute;part',
	'Boulevard de Belleville',
	'Caisse de commaut&eacute; #1',
	'Rue Lecourbe', 
	'Imp&ocirc;ts sur le revenu',
	'Gare Montparnasse',
	'Rue de Vaugirard',
	'Chance #1',
	'Rue de Courcelles',
	'Avenue de la R&eacute;publique',
	'Prison',
	'Boulevard de la Villette',
	"Compagnie de distribution d'&eacute;lectricit&eacute;",
	'Avenue de Neuilly',
	'Rue de Paradis',
	'Gare de Lyon',
	'Avenue Mozart',
	'Caisse de Communaut&eacute; #2',
	'Boulevard Saint-Michel',
	'Place Pigalle',
	'Parc Gratuit',
	'Avenue Matignon',
	'Chance #2',
	'Boulevard Malesherbes',
	'Avenue Henri-Martin',
	'Gare du Nord',
	'Faubourg Saint-Honor&eacute;',
	'Place de la Bourse',
	'Compagnie de distribution des eaux',
	'Rue La Fayette',
	'Allez en Prison',
	'Avenue de Breteuil',
	'Avenue Foch',
	'Caisse de Communaut&eacute; #3',
	'Boulevard des Capucines',
	'Gare Saint-Lazare',
	'Chance #3',
	'Avenue des Champs-&eacute;lys&eacute;es',
	'Taxe de Luxe',
	'Rue de la Paix'
];

var loyers = [
	    0,  200,    0,  400,    0, 2500,  600,    0,  600,  800,
	    0, 1000,    0, 1000, 1200, 2500, 1400,    0, 1400, 1600,
		0, 1800,    0, 1800, 2000, 2500, 2200, 2200,    0, 2400,
		0, 2600, 2600,    0, 2800, 2500,    0, 3500,    0, 5000
];

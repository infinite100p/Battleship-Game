var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	}
};

var model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,


	// list of ship objects, each containing a list of locations and list of hits
	/*
	ships: [ { locations: ["06", "16", "26"], hits: ["", "", ""] },
			 { locations: ["24", "34", "44"], hits: ["", "", ""] },
			 { locations: ["10", "11", "12"], hits: ["", "", ""] } ], */

	ships: [ { locations: [0, 0, 0], hits: ["", "", ""] },
			 { locations: [0, 0, 0], hits: ["", "", ""] },
			 { locations: [0, 0, 0], hits: ["", "", ""] } ],	


	/* generate a list of ships at random, non-overlapping locations
	   number of ships must equal numShips
	*/   	 
	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Ships array: ")
		console.log(this.ships);
	},

	// generate a ship positioned at random locations
	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);  // 0 is vertical, 1 is horizontal
		var row, col;

		// Generate starting location for ship based on direction

		/* If direction is horizontal, the first row can be anywhere on board
		   First column can be anywhere except the last column or second to last column */

		if (direction === 1) {
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		} else {
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);	
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
		} else {
			newShipLocations.push((row + i) + "" + col);
		}
	}

	return newShipLocations;	

		},

	// check if any locations in given ship collide with existing ships on the board
	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
				for (var j = 0; j < locations.length; j++) {
					if (ship.locations.indexOf(locations[j]) >= 0) {
			 			return true;
			} 
		}
	} 
		return false;
},


	/* Check if player's guess is a hit or miss - update accordingly
       Return true if hit, otherwise return false. If ship is sunk, update and notify user
    */
	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);

			if (ship.hits[index] === "hit") {
      			view.displayMessage("Oops, you already hit that location!");
      			return true;
      		} else if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");

				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage("You missed.");

		return false;
	},

	// check if ship is sunk
	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++) {
			if (ship.hits[i] !== "hit") {
				return false;
			}			 
		}
		return true; 
	}
};

var controller = {
	guesses: 0,


	/* Increase guess count by 1 if user has entered a valid guess input
	   If a hit was made and all ships were sunk, then return results #gameover
	*/
	processGuess: function(guess) {
		var loc = parseGuess(guess);		
		if (loc) {
			this.guesses++;
			console.log(this.guesses);
			if (this.isGameOver(guess)) {
				alert("You sank all my battleships in " + this.guesses + " guesses.");
				location.reload();
			}
		}
	},

	// check if game has ended
	isGameOver: function(guess) {
		var location = parseGuess(guess);
		var hit = model.fire(location);
		return model.shipsSunk === model.numShips;
	}
};


	/* Helper function to parse a guess from the user
	   Convert user's guess to two-digits and return in string form if valid; otherwise, return null
	*/
	function parseGuess(guess) {
		var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

		if (guess === null || guess.length !== 2){
			alert("Oops, please enter a letter and a number on the board.");
		} else {
			firstChar = guess.charAt(0);
			var row = alphabet.indexOf(firstChar.toUpperCase());
			var column = guess.charAt(1);

			if (isNaN(row) || isNaN(column)) {							// wouldn't isNaN(row) always return false? -1 is a number! so why check for that?
				alert("Oops, that isn't on the board.");
			} else if (row < 0 || row >= model.boardSize ||
					   column < 0 || column >= model.boardSize) {
				alert("Oops, that's off the board! Try again.")
			} else {
				return row + column;
			}
		}
		return null;
	}


// add click and key press handlers to the button and text field
function init() {
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;            			 		

	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress; 

	model.generateShipLocations();
}

// call init when page is fully loaded
window.onload = init;                               			  		

/* Retrieve player's guess from the form and get it to the controller */
function handleFireButton() {	
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGuess(guess);
	guessInput.value = "";
}

// If user hits enter key, button is clicked
function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");

	if(e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}

/*
function tests() {

model.fire("53");
model.fire("06");
model.fire("05");
model.fire("04");
model.fire("16");
model.fire("26");

console.log(controller.parseGuess("A0"));
console.log(controller.parseGuess("B6"));
console.log(controller.parseGuess("G3"));
console.log(controller.parseGuess("H0"));
console.log(controller.parseGuess("A7"));
console.log(controller.parseGuess("a5"));
console.log(controller.parseGuess("A@"));


controller.processGuess("A0");
controller.processGuess("A6");
controller.processGuess("B6");
controller.processGuess("C6");
controller.processGuess("C4");
controller.processGuess("D4");
controller.processGuess("E4");
controller.processGuess("B0");
controller.processGuess("B1");
controller.processGuess("B2");


};


tests();
*/


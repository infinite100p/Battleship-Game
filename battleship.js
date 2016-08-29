
/********************************* VIEW *********************************/

var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
		centerMsg("42%");
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

/********************************* MODEL *********************************/

var model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,


	// list of ship objects, each containing a list of locations and list of hits

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
		for (var i = 0; i < this.numShips; i++) {									// iterate through the ships on the board
			var ship = this.ships[i];
				for (var j = 0; j < locations.length; j++) {						// iterate through the locations of given ship
					if (ship.locations.indexOf(locations[j]) >= 0) {				// check if ship contains a location
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
      			centerMsg("33%");
      			return true;
      		} 

      		else if (index >= 0) {
				ship.hits[index] = "hit";
				//view.displayHit(guess);
				view.displayHit(guess);				
				view.displayMessage("HIT!");
			

				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					centerMsg("37%");
					this.shipsSunk++;
				}
				return true;
		}
	}
		view.displayMiss(guess);
		//view.displayMiss(this.getId());
		view.displayMessage("You missed.");

		return false;
},

/*
	// get id of the target element that is clicked on
	listenForBoardClicks: function() {
		var cell = document.getElementById('board');
		cell.addEventListener('click', handleBoardClick);
	},
	*/

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

/********************************* CONTROLLER *********************************/

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
				setTimeout(gameOver, 100);
				
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

/******************************* INITIALIZATION *******************************/

// add click and key press handlers to the button and text field
function init() {
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;            			 		

	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress; 

	//model.listenForBoardClicks();

	var board = document.getElementById("board");
	board.onclick = handleBoardClick;

	model.generateShipLocations();

}

// call init when page is fully loaded
window.onload = init; 

 /********************************* HELPER FUNCTIONS *********************************/

	/* Helper function to parse a guess from the user
	   Convert user's guess to two-digits and return in string form if valid; otherwise, return null
	   If user input is in valid 2-digit form, return the guess. otherwise, return null
	*/
	function parseGuess(guess) {
		var firstChar = guess.charAt(0);
		var board = document.getElementById("board");
		var alphabet = ["A", "B", "C", "D", "E", "F", "G"];
		var col = guess.charAt(1);
		
		if (!isNaN(firstChar) && withinBounds(guess)) {
			return guess;
		}		

		if (guess === null || guess.length !== 2){
			alert("Oops, please enter a letter and a number on the board.");
		} else {
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

// check that the given 2-digit string is within bounds on the board
function withinBounds(guess) {
	var firstChar = String(guess).charAt(0);
	var col = String(guess).charAt(1);

	return (firstChar >= 0 && firstChar < model.boardSize) &&
			  (col >= 0 && col < model.boardSize);
}	

                             		
/* Retrieve player's guess from the form and get it to the controller */
function handleFireButton() {	
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGuess(guess);
	guessInput.value = "";
}

// Retrieve id of cell clicked and get it to the controller */
function handleBoardClick(e) {
	var guess = e.target.id;
	controller.processGuess(guess);
}


// If user hits enter key, button is clicked
function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");

	if(e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}

/* Alert player on number of guesses & restart game when it ends */
function gameOver() {
	alert("You sank all my battleships in " + controller.guesses + " guesses.");
	location.reload();
}


/********************************* STYLING *********************************/

// center message in relation to the board
function centerMsg(amt) {
	messageArea.style.left = amt;
}

/********************************* TESTS *********************************/

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
console.log(controller.parseGuess("A2"));


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


console.log(parseGuess("56"));
console.log(parseGuess("g6"));
console.log(parseGuess("a2"));

console.log(withinBounds(66));
console.log(withinBounds(99));

console.log(model.getId());

}
*/

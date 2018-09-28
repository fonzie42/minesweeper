
const GAME_IDS = {
	BOARD: "gameSpace"
}

const GAME_CLASSES = {
	MINE: {
		DEFAULT: "field",
		EXPLODED:"field--exploded",
		SAFE:"field--safe",
		NUMBER_SAFE:"field__safeNumber",
		CONTENT: "field__content",
		IMAGE: "field__image"
	},

	BOARD: "gameSpace__board"
};

const GAME_PATHS = {
	BOMB: "images/bomb.svg"
}

const GAME_PROPERTIES ={
	STANDARD: {
		Y_LIMIT : 9,
		X_LIMIT : 9,
		MINES : 10,
		TIME: {
			minutes: 0,
			seconds: 10
		}
	}
}

class Field {
	constructor(fieldProperties){
		this.explode = () => {
			this.getIsMined() ? currentGame.bombThePlaceDown(this) : currentGame.fireNextRound(this.position);
		};
		this.position = {
			x: fieldProperties.positionX,
			y: fieldProperties.positionY
		};
		this.DOMContent = {};

		this.isMined = false;
		this.isExplored = false;
		this.minesAround = 0;
		this.DOM = this.createDOMElement();
	}

	getDOM(){

		return this.DOM;
	}

	getDOMContent(){

		return this.DOMContent;
	}

	getIsMined() {

		return this.isMined;
	}

	getMinesAround(){

		return this.minesAround;
	}

	getIsExplored(){

		return this.isExplored;
	}

	getPosition(){

		return this.position;
	}

	setMinesAround(minesAround){

		this.minesAround = this.minesAround >= 0 ? minesAround : -1;
	}

	setIsMined(isMined){

		this.isMined = isMined;
	}

	setIsExplored(isExplored){

		this.isExplored = isExplored;
	}

	setDOMContent(newContent){
		this.clearDOMContent();
		let newDOMContent = this.createDOMContent();
		newDOMContent.appendChild(newContent);
		this.DOM.appendChild(newDOMContent);
		this.DOMContent = newDOMContent;
	}

	clearDOMContent(){

		this.DOMContent.remove();
	}

	increaseMineAroundCounter(){
		if (this.getIsMined()){
			return ;
		} else {
			let currentMines = this.getMinesAround();
			this.setMinesAround(currentMines + 1);			
		}
	}

	mineTheField(){
		if(this.getIsMined()){
			return false;
		} else {
			this.setIsMined(true);
			this.setMinesAround(-1);
			return true;
		}
	}

	revealField(){
		if(this.getIsExplored()){
			return;
		}
		this.createFieldContent();

		this.DOM.removeEventListener('click', this.explode);

		this.setIsExplored(true);
		let isMined = this.getIsMined(); 
		isMined ? this.minedField() : this.safeField();
	}

	safeField(){
		let fieldDOM = this.getDOM();
		addStyle(fieldDOM, GAME_CLASSES.MINE.SAFE);

		let style = this.getStyleByMinesAround();
		addStyle(fieldDOM, style);
	}

	getStyleByMinesAround(){
		let mines = this.getMinesAround();
		return mines > 0 ? GAME_CLASSES.MINE.NUMBER_SAFE + "--" + mines : "";
	}

	minedField(){
		addStyle(this.getDOM(), GAME_CLASSES.MINE.EXPLODED);
	}

	createDOMElement(){
		let field = document.createElement("div");
		field.classList.add(GAME_CLASSES.MINE.DEFAULT);
		field.classList.add("confetti-effect");
		field.addEventListener('click', this.explode);
		field.addEventListener('contextmenu', this.setFlag.bind(this), false);

		let fieldContent = this.createDOMContent();
		field.appendChild(fieldContent);
		this.DOMContent = fieldContent;
		return field;
	}

	createDOMContent (){
		let fieldContent = document.createElement("div");

		return fieldContent;
	}

	setFlag(event){
		event.preventDefault();
			explode(this)();
			return false;
	}

	createFieldContent(){

		this.getIsMined() ? this.updateFieldWithBomb() : this.createMinesAroundText();
	}

	updateFieldWithBomb(){
		let bomb = this.createBombImage();
		this.setDOMContent(bomb);
	}

	createBombImage(){
		let image = document.createElement("img");
		image.src = GAME_PATHS.BOMB;
		image.classList.add(GAME_CLASSES.MINE.IMAGE);
		return image;
	}

	createMinesAroundText(){
		let text = this.getMinesAround() || "";
		this.updateTextContent(text);
	}

	updateTextContent(text){

		this.DOMContent.textContent = text;
	}

}

class Board {
	constructor (boardProperties){
		this.DOMGameBoard = this.createDOMGameSpace();
		this.minedFields = [];
		this.fieldCells = this.createFields();
		this.fieldCells = this.mineFields(this.fieldCells);
	}

	getFieldCells(){

		return this.fieldCells
	}

	getMinedFields(){
		return this.minedFields;
	}

	getCell(x,y){
		let outOfBorder = x < 0 || x >= GAME_PROPERTIES.STANDARD.X_LIMIT || y < 0 || y >= GAME_PROPERTIES.STANDARD.Y_LIMIT;
		if (outOfBorder){
			return null;
		} else {
			let cells = this.getFieldCells();
			return cells[y][x];	
		}
	}

	getDOMBoard(){
		return this.DOMGameBoard;
	}

	pushMinedField(field){
		this.minedFields.push(field);
	}

	createDOMGameSpace(){
		let main = document.getElementById(GAME_IDS.BOARD);
		let gameBoard = document.createElement("div");
		addStyle(gameBoard, GAME_CLASSES.BOARD);
		main.appendChild(gameBoard);
		return gameBoard;      
	}

	createFields(size){
		let cells = [];
		let domBoard = this.getDOMBoard();

		for (let y=0; y < GAME_PROPERTIES.STANDARD.Y_LIMIT; y++){
			cells.push([]);
			for (let x=0; x < GAME_PROPERTIES.STANDARD.X_LIMIT; x++){
				let field = new Field({positionX: x, positionY: y});
				cells[y].push(field);
				domBoard.appendChild(field.getDOM());
			}
		}
		return cells;
	}

	mineFields(fields){
		let minedFields = 0;
		while (minedFields < GAME_PROPERTIES.STANDARD.MINES){
			let x = Math.floor(Math.random() * GAME_PROPERTIES.STANDARD.X_LIMIT);
			let y = Math.floor(Math.random() * GAME_PROPERTIES.STANDARD.Y_LIMIT);

			if (fields[y][x].mineTheField()){
				minedFields++;
				this.setNeighboursWarnings(x,y,fields);
				this.pushMinedField(fields[y][x]);
			}			
		}
		return fields;
	}

	setNeighboursWarnings(x,y,fields){
		for (let i = -1; i < 2; i++){
			for (let j = -1; j < 2; j++){
				let neighbourX = x + i;
				let neighbourY = y + j;
				let cell = this.getCell(neighbourX, neighbourY);
				if (cell){
					fields[neighbourY][neighbourX].increaseMineAroundCounter();
				}
			}
		}
	}

	openAllAvailableFields(currentPosition){
		let x = currentPosition.x;
		let y = currentPosition.y;
		let cell = this.getCell(x,y);
		if( !cell || cell.getIsExplored() || cell.getIsMined() ){
			return 0;
		} else {
			cell.revealField();
			let openFields = 1;
 			if(!cell.getMinesAround()){
				openFields = openFields + this.openAllAvailableFields({x:x+1, y:y}); // north
				openFields = openFields + this.openAllAvailableFields({x:x-1, y:y}); // east
				openFields = openFields + this.openAllAvailableFields({x:x, y:y-1}); // south
				openFields = openFields + this.openAllAvailableFields({x:x, y:y+1}); // west
				openFields = openFields + this.openAllAvailableFields({x:x+1, y:y+1});
				openFields = openFields + this.openAllAvailableFields({x:x-1, y:y+1});
				openFields = openFields + this.openAllAvailableFields({x:x-1, y:y-1});
				openFields = openFields + this.openAllAvailableFields({x:x+1, y:y-1});
			}
			return openFields;
		}
	}

	cheatWithNoShameAndShowAllBombs(){
		let mines = this.getMinedFields();
		for (let bomb of mines){
			changeStyle(bomb.getDOM(), "green");
		}
	}
}

class Game {
	constructor(){
		this.remainingFields = 81;
		this.totalTimeInSeconds = GAME_PROPERTIES.STANDARD.TIME; 
		this.board = new Board();
		this.isGameOver = false;
		this.fieldAvailable = GAME_PROPERTIES.STANDARD.Y_LIMIT * GAME_PROPERTIES.STANDARD.X_LIMIT - GAME_PROPERTIES.STANDARD.MINES;
	}

	decreaseRemainingFields(openedFields){
		this.fieldAvailable = this.fieldAvailable - openedFields;
		if (this.fieldAvailable <= 0){
			this.setGameOver(true);
			console.log("you won!");
		}
	}

	getRemainingFields(){
	
		return this.remainingFields;
	}

	getGameBoard(){
	
		return this.board;
	}

	getIsGameOver(){
	
		return this.isGameOver;
	}

	setGameOver(IsGameOver){

		this.isGameOver = true;
	}

	fireNextRound(position){
		 let board = currentGame.getGameBoard(); 
		 let cell = board.getCell(position.x, position.y);

		 let openedFields = board.openAllAvailableFields(position);
		 this.decreaseRemainingFields(openedFields);

		 if (this.getIsGameOver()){
		 	this.endGame();
		 }
	}

	bombThePlaceDown(field){
	 	this.setGameOver(true);
	 	console.log("you lost :c");
		field.revealField();
		this.endGame();
	}

	clearDOMBoard(){
		let board = this.getGameBoard();
		board.getDOMBoard().remove();
	}

	endGame(){
		let board = this.getGameBoard();
		let mines = board.minedFields;
		for (let i = 0; i < 9; i++){
			for (let j = 0; j < 9; j++){
			currentGame.board.fieldCells[i][j].revealField();
			}
		}

		var classname = document.getElementById("newGame");
		changeStyle(classname, "pulsing-button");
	}

}

function addStyle(element, style){
	if(style == "") {return;}
	element.classList.add(style);
}

function changeStyle(element, newClass){

	element.classList.toggle(newClass);
}

function updateButtonStyle(){
	var classname = document.getElementsByClassName("confetti-effect");

    for (var i = 0; i < classname.length; i++) {
    	if (classname[i].classList.contains("pulsing-button")){
      changeStyle(classname[i], "pulsing-button");
    		
    	}
    }
}


let currentGame;
let remainingTime = {minutes: 0, seconds: 0};
let totalTime = {minutes: 0, seconds: 0};
let countDownHandler;
let timeCounterHandler;

function countDownTimer(){
	remainingTime = remainingTime.seconds === 0 ? decreaseAMinute(remainingTime) : decreaseASecond(remainingTime);
	let text = parseTimeStructureToText(remainingTime);
	document.getElementById("countdown").innerText = text;
}

function countUpTimer(){
	totalTime = increaseASecond(totalTime);
	let text = parseTimeStructureToText(totalTime);
	document.getElementById("totalTime").innerText = text;
}

function parseTimeStructureToText(timeStructure){
	let seconds = timeStructure.seconds < 10 ? "0" + timeStructure.seconds : timeStructure.seconds;
	let minutes = timeStructure.minutes < 10 ? "0" + timeStructure.minutes : timeStructure.minutes;
	return `${minutes}:${seconds}`;
}

function decreaseAMinute(timeStructure){
	if(timeStructure.minutes == 0){
		clearInterval(countDownHandler);
		return timeStructure;}
	--timeStructure.minutes;
	timeStructure.seconds = 59;
	return timeStructure;
}

function decreaseASecond(timeStructure){
	--timeStructure.seconds;
	return timeStructure;
}

function increaseASecond(timeStructure){
	timeStructure.seconds == 60 ? increaseAMinute(timeStructure) : ++timeStructure.seconds;
	return timeStructure;
}

function increaseAMinute(timeStructure){
	timeStructure.seconds = 0;
	++timeStructure.minutes;
	return timeStructure;
}




function newGame(){
	if(currentGame){currentGame.clearDOMBoard()};
	//clearInterval(dealWithTimers);
	currentGame = new Game();


	clearInterval(countDownHandler);
	clearInterval(timeCounterHandler);

	remainingTime = {minutes: 3, seconds: 30};
	totalTime = {minutes: 0, seconds: 0};

	countDownHandler = setInterval(countDownTimer, 1000);
	timeCounterHandler = setInterval(countUpTimer, 1000);

	updateButtonStyle();


}

(function initGame(){
	newGame();

	
	var classname = document.getElementsByClassName("confetti-effect");
	
	var animateButton = function(e) {

        e.target.classList.remove('animate')

        e.target.classList.add('animate');
        setTimeout(function(){
        e.target.classList.remove('animate');
        },300);
    };

    for (var i = 0; i < classname.length; i++) {
      classname[i].addEventListener('click', animateButton, false);
    }
    
}());




const GAME_IDS = {
	BOARD: "gameSpace"
}

const GAME_CLASSES = {
	MINE: {
		DEFAULT: "field",
		EXPLODED:"field--exploded",
		SAFE:"field--safe",
		NUMBER_SAFE:"field--safeNumber",
		NEAR:"field--nearMine",
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
		let style = this.getMinesAround() == 0 ? GAME_CLASSES.MINE.SAFE : GAME_CLASSES.MINE.NUMBER_SAFE;
		addStyle(this.getDOM(), style);
	}

	minedField(){
		addStyle(this.getDOM(), GAME_CLASSES.MINE.EXPLODED);
	}

	createDOMElement(){
		let field = document.createElement("div");
		field.classList.add(GAME_CLASSES.MINE.DEFAULT);
		field.classList.add("confetti-button");
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
		if(!cell || cell.getIsExplored() || cell.getIsMined()){
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
}

class Game {
	constructor(){
		this.remainingFields = 81;
		this.board = new Board();
		this.isGameOver = false;
	}

	decreaseRemainingFields(openedFields){
		
		this.openFields = this.openFields - openedFields;
		if (this.openFields <= 0){
			this.setGameOver(true);
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
		changeStyle(classname, "pulsingButton");
	}

}

function addStyle(element, style){

	element.classList.add(style);
}

function changeStyle(element, newClass){

	element.classList.toggle(newClass);
}

function newGame(){
	currentGame.clearDOMBoard();
	currentGame = new Game();
	updateButtonStyle();
}


function updateButtonStyle(){
	var classname = document.getElementsByClassName("confetti-button");

		    for (var i = 0; i < classname.length; i++) {
		    	if (classname[i].classList.contains("pulsingButton")){
		      changeStyle(classname[i], "pulsingButton");
		    		
		    	}
		    }
}


let currentGame;
(function initGame(){
	currentGame = new Game();
	var classname = document.getElementsByClassName("confetti-button");
	
	var animateButton = function(e) {

        e.preventDefault;
        //reset animation
        e.target.classList.remove('animate');

        e.target.classList.add('animate');
        setTimeout(function(){
        e.target.classList.remove('animate');
        },300);
    };

    for (var i = 0; i < classname.length; i++) {
      classname[i].addEventListener('click', animateButton, false);
    }
    
}());



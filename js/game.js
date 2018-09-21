
const GAME_IDS = {
	BOARD: "gameBoard"
}

const GAME_CLASSES = {
	MINE: {
		DEFAULT: "field",
		EXPLODED:"field--exploded",
		SAFE:"field--safe",
		NEAR:"field--nearMine",
		CONTENT: "field__content",
		IMAGE: "field__image",
		HIDDEN: "field__image--hidden"
	}
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

		this.explode = this.getExplode();
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

	getExplode(){
		return () => {
			this.getIsMined()? this.revealField() : gameBoard.openAllAvailableFields(this.getPosition());
		};
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
		this.DOM.appendChild(newContent);
		this.DOMContent = newContent;
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
		this.DOM.removeEventListener('click', this.explode);
		this.setIsExplored(true);
		let isMined = this.getIsMined(); 
		isMined ? this.minedField() : this.safeField();
	}

	safeField(){
		this.changeStyle(this.getDOM(), GAME_CLASSES.MINE.SAFE);
		this.changeStyle(this.getDOMContent(), GAME_CLASSES.MINE.CONTENT);
	}

	minedField(){
		this.changeStyle(this.getDOMContent(), GAME_CLASSES.MINE.HIDDEN);
		this.changeStyle(this.getDOM(), GAME_CLASSES.MINE.EXPLODED);
		// engGame();
	}

	changeStyle(element, newClass){

		element.classList.toggle(newClass);
	}

	createDOMElement(){
		let field = document.createElement("div");
		field.classList.add(GAME_CLASSES.MINE.DEFAULT);
		field.addEventListener('click', this.explode);
		field.addEventListener('contextmenu', this.setFlag.bind(this), false);

		let fieldContent = document.createElement("div");
		fieldContent.classList.add(GAME_CLASSES.MINE.CONTENT);
		field.appendChild(fieldContent);
		this.DOMContent = fieldContent;
		return field;
	}

	setFlag(event){
		event.preventDefault();
			this.explode();
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
		image.classList.add(GAME_CLASSES.MINE.HIDDEN);
		return image;
	}

	createMinesAroundText(){

		this.updateTextContent(this.getMinesAround());
	}

	updateTextContent(text){

		this.DOMContent.textContent = text;
	}

}

class Board {
	constructor (boardProperties){

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

	createFields(size){
		let cells = [];
		let domBoard = document.getElementById(GAME_IDS.BOARD);

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
					fields[neighbourY][neighbourX].createFieldContent();
				}
			}
		}
	}

	openAllAvailableFields(currentPosition){
		let x = currentPosition.x;
		let y = currentPosition.y;
		let cell = this.getCell(x,y);
		if(!cell || cell.getIsExplored() || cell.getIsMined()){
			return;
		} else {
			cell.revealField();
 			if(!cell.getMinesAround()){
				this.openAllAvailableFields({x:x+1, y:y}); // north
				this.openAllAvailableFields({x:x-1, y:y}); // east
				this.openAllAvailableFields({x:x, y:y-1}); // south
				this.openAllAvailableFields({x:x, y:y+1}); // west
			}
			return;
		}
		return;
	}
}

let gameBoard = new Board();
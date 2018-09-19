const GAME_CLASSES = {
	MINE: {
		DEFAULT: "field",
		EXPLODED:"field--exploded",
		SAFE:"field--safe",
		NEAR:"field--nearMine",
		CONTENT: "field__content"
	}
};

const GAME_IDS = {
	BOARD: "gameBoard"
}

class Field {
	constructor(fieldProperties){
		this.isMined = false;
		this.minesAround = 0;
		this.position = {
			x: fieldProperties.positionX,
			y: fieldProperties.positionY
		};
		this.isExplored = false;
		
		this.explode = () => {
			this.getIsMined()? this.revealField() : gameBoard.openAllAvailableFields(this.getPosition());
		}
		this.DOMContent = "";
		this.DOM = this.createDOMElement(fieldProperties);
	}

	getDOM(){
		return this.DOM;
	}

	getIsMined() {
		return this.isMined;
	}

	getMinesAround(){
		return this.minesAround;
	}

	setMinesAround(minesAround){
		this.minesAround = this.minesAround >= 0 ? minesAround : -1;
	}

	increaseMineAroundCounter(){
		if (!this.getIsMined()){
			let currentMines = this.getMinesAround();
			this.setMinesAround(currentMines + 1);			
		}
	}

	setIsMined(isMined){
		this.isMined = isMined;
	}


	setFieldToMined(){
		if(this.getIsMined()){
			return false;
		} else {
			this.setIsMined(true);
			this.setMinesAround(-1);
			return true;
		}
	}

	getIsExplored(){
		return this.isExplored;
	}

	setIsExplored(isExplored){
		this.isExplored = isExplored;
	}

	revealField(){
		let position = this.getPosition();
		this.DOM.removeEventListener('click', this.explode);
		this.setIsExplored(true);
		let isMined = this.getIsMined() 
		isMined ? this.minedField() : this.safeField();
	}

	safeField(){
		this.changeStyle(this.getDOM(), GAME_CLASSES.MINE.SAFE);
		this.changeStyle(this.DOMContent, GAME_CLASSES.MINE.CONTENT);
		console.log("oh yeah"); // debug
	}

	getPosition(){
		return this.position;
	}

	minedField(){
		this.changeStyle(this.getDOM(), GAME_CLASSES.MINE.EXPLODED);
		this.changeStyle(this.DOMContent, GAME_CLASSES.MINE.CONTENT);
		console.log("oh no!"); // debug
		// engGame();
	}

	changeStyle(element, newClass){
		element.classList.toggle(newClass);
	}

	createDOMElement(fieldProperties){
		let field = document.createElement("div");
		field.classList.add(GAME_CLASSES.MINE.DEFAULT);
		field.addEventListener('click', this.explode);

		let fieldContent = document.createElement("div");
		fieldContent.classList.add(GAME_CLASSES.MINE.CONTENT);
		field.appendChild(fieldContent);
		this.DOMContent = fieldContent;
		return field;
	}

	createFieldContent(){
		this.getIsMined() ? this.createBombImage() : this.createMinesAroundText();
	}

	createBombImage(){
		let image = document.createElement("img");
		image.src = "images/bomb.svg";
		image.classList.add("field--image");
		this.DOM.appendChild(image);
	}

	createMinesAroundText(){
		this.DOMContent.textContent = this.getMinesAround();
	}

}

class Board {
	constructor (boardProperties){
		this.fieldCells = this.mineTheField(this.createFields());
	}

	getFieldCells(){
		return this.fieldCells
	}

	getCell(x,y){
		let outOfBorder = x < 0 || x > 8 || y < 0 || y > 8;
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

		for (let j=0; j < 9; j++){
			cells.push([]);
			for (let i=0; i < 9; i++){
				let field = new Field({positionX: i, positionY: j});
				cells[j].push(field);
				domBoard.appendChild(field.getDOM());
			}
		}
		return cells;
	}

	mineTheField(fields){
		let minedFields = 0;
		while (minedFields < 10){
			let x = Math.floor(Math.random() * 9);
			let y = Math.floor(Math.random() * 9);

			if (fields[y][x].setFieldToMined()){
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
				if ((neighbourX >= 0 && neighbourX <= 8) && (neighbourY >= 0 && neighbourY <=8)){
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
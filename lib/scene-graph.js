//Node definition
class Node {
    constructor(){
        this.children = [];
        this.localMatrix = utils.identityMatrix();
        this.worldMatrix = utils.identityMatrix();
        this.parent = null;
    }

    setParent(parent) {
        // remove us from our parent
        if (this.parent) {
            var ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) {
                this.parent.children.splice(ndx, 1);
            }
        }
        // Add us to our new parent
        if (parent) {
            parent.children.push(this);
        }
        this.parent = parent;
    }

    updateWorldMatrix(matrix) {
        if (matrix) {
            // a matrix was passed in so do the math
            this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
        } else {
            // no matrix was passed in so just copy.
            utils.copy(this.localMatrix, this.worldMatrix);
        }

        // now process all the children
        var worldMatrix = this.worldMatrix;
        this.children.forEach(function(child) {
            child.updateWorldMatrix(worldMatrix);
        });
    }
}

/**
 * Represents the generic object in the game.
 */
class Piece {
    constructor(name){
        this.name = name;
        this.node = new Node();
        this.drawInfo = {
            name:                       name,
            programInfo:                program,
            // Locations
            positionAttributeLocation:  null,
            normalAttributeLocation:    null,
            uvLocation:                 null,
            matrixLocation:             null,
            textLocation:               null,
            normalMatrixPositionHandle: null,
            vertexArray:                null,
            vertexMatrixPositionHandle: null,
            eyePositionHandle:          null,
            // Model info
            vertices:                   null,
            normals:                    null,
            texCoord:                   null,
            indices:                    null,
            textureSrc:                 null,
            textureRef:                 [],
        }
    }
}

/**
 * Represents the disc of the Hanoi Tower.
 */
class Disc extends Piece {
    constructor(level) {
        super(level.toString());
        this.level = level;
        this.rod = null;
    }

    translate(dx, dy, dz){
        this.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(dx, dy, dz), this.node.localMatrix);
    }

    /**
     * Vertically translate the disc (upward).
     */
    float() {
        currentDiscX = startingRod==1 ? -dxRod : (startingRod==2 ? 0.0 : dxRod);
        this.node.setParent(this.rod.node);
        if(movingKey) {
            this.translate(0.0, floatingHeight, 0.0);
        } else {
            goingUp = true;
        }
    }

    /**
     * Vertically translate the disc (downward); updates game variables.
     */
    land() {
        if (movingMouse) {
            this.translate(-deltaX, 0.0, 0.0);
            deltaX = 0;
        }
        this.rod.removeDisc(this);
        getRod(currentRod).addDisc(this);
        if(movingKey) {
            this.translate(0.0, -floatingHeight, 0.0);
        } else {
            goingDown = true;
        }
        numberOfMoves++;
        document.getElementById('numberOfMoves').innerHTML = numberOfMoves.toString();
        if(numberOfMoves == allowedMoves && allowedMoves!=0){
            gameEnded = true;
        }
        if (endRod.length == maxLevel) {
            gameEnded = true;
            win = true;
        }
        if(gameEnded) {
            if(win) {
                document.getElementById('result').innerHTML = 'YOU WON';
                document.getElementById('end').style.borderColor = "green";
            } else {
                document.getElementById('result').innerHTML = 'YOU LOST';
                document.getElementById('end').style.borderColor = "red";
            }
            
            if(movingKey) {
                document.getElementById("end").style.visibility="visible";
            }
        }
    }

    /**
     * Change the parent of the node to graphically make the disc translate.
     */
    shift() {
        this.node.setParent(getRod(currentRod).node);
    }
}

/**
 * Represents the rod of the base.
 */
class Rod extends Piece {
    constructor(name) {
        super(name);
        this.drawInfo = null;
        this.discs = [];
        this.length = 0;
    }

    getHighestDisc(){
        return this.length>0 ? this.discs[this.length-1] : null;
    }

    /**
     * Check if the disc can be added to a rod.
     */
    canAddDisc(disc){
        if(this.length == 0){
            return true;
        }
        return disc.level >= this.discs[this.length-1].level;
    }

    /**
     * Add the disc to the rod.
     * @param {*} disc 
     */
    addDisc(disc){
        if(this.length == 0){
            disc.node.setParent(this.node);
        } else {
            disc.node.setParent(this.discs[this.length-1].node);
        }
        this.discs[this.length] = disc;
        this.length++;
        disc.rod = this;
    }

    /**
     * Remove the disc from the rod.
     * @param {*} disc 
     */
    removeDisc(disc){
        disc.node.setParent(null);
        this.discs[this.length-1] = null;
        this.length--;
        disc.rod = null;
    }
}

/**
 * Returns the rod corresponding to the passe integer.
 * @param {*} int 
 * @returns 
 */
function getRod(int){
    switch (int){
        case 1:
            return startRod;
        case 2:
            return middleRod;
        case 3:
            return endRod;
    }
}

/**
 * Initializes objects array with the base and its rods; then locally positions each disc in the right initial spot.
 */
function computeSceneGraph() {
    objects[0] = new Piece(baseName);
    objects[0].node.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase,dzBase); //move the base to the desired coordinates

    //initialize rod 1
    startRod = new Rod(startRodName);
    startRod.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(-dxRod, dyRod, 0.0), startRod.node.localMatrix);
    startRod.node.setParent(objects[0].node);

    //initialize rod 2
    middleRod = new Rod(middleRodName);
    middleRod.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(0.0, dyRod, 0.0), middleRod.node.localMatrix);
    middleRod.node.setParent(objects[0].node);

    //initialize rod 3
    endRod = new Rod(endRodName);
    endRod.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(dxRod, dyRod, 0.0), endRod.node.localMatrix);
    endRod.node.setParent(objects[0].node);

    if(!gameStarted){
        document.getElementById('numberOfMoves').innerHTML = numberOfMoves.toString();
    }

    for(let i=minLevel; i<=maxLevel; i++){ //discs starts from index 1
        objects[i] = new Disc(i);
        objects[i].translate(0.0, discThickness, 0.0);
        startRod.addDisc(objects[i]);
    }
}


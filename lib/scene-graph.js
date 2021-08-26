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

class Disc extends Piece {
    constructor(level) {
        super(level.toString());
        this.level = level;
        this.rod = null;
    }

    translate(dx, dy, dz){
        this.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(dx, dy, dz), this.node.localMatrix);
    }

    float() {
        this.node.setParent(this.rod.node);
        //this.translate(0.0, floatingHeight, 0.0);
        goingUp = true;
    }

    land() {
        if (moving) {
            this.translate(-deltaX, 0.0, 0.0);
            deltaX = 0;
        }
        this.rod.removeDisc(this);
        getRod(currentRod).addDisc(this);
        //this.translate(0.0, -floatingHeight, 0.0);
        //this.translate(0.0, -deltaY+stepY, 0.0);
        //deltaY = 0.0;
        goingDown = true;
        if (endRod.length == maxLevel) {
            gameEnded = true;
            document.getElementById("victory").style.visibility="visible";
            
        }

    }

    shift() {
        this.node.setParent(getRod(currentRod).node);//
        //TODO update texture
        this.canMove = getRod(currentRod).canAddDisc(this);
    }
}

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

    canAddDisc(disc){
        if(this.length == 0){
            return true;
        }
        return disc.level >= this.discs[this.length-1].level;
    }

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

    removeDisc(disc){
        disc.node.setParent(null);
        this.discs[this.length-1] = null;
        this.length--;
        disc.rod = null;
    }
}

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

function computeSceneGraph() {
    objects[0] = new Piece(baseName);
    objects[0].node.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase, dzBase);

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

    for(let i=minLevel; i<=maxLevel; i++){//discs starts from index 1
        objects[i] = new Disc(i);
        objects[i].translate(0.0, discThickness, 0.0);
        startRod.addDisc(objects[i]);
    }
}


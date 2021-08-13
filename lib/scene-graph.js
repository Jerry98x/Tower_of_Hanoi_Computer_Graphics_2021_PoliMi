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
        this.node= new Node();
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
            textureCoord:               null,
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
        this.height = level<5 ? discMinHeight : discMaxHeight;
        this.rod = null;
    }

    translate(dx, dy, dz){
        this.node.localMatrix = utils.multiplyMatrices(this.node.localMatrix, utils.MakeTranslateMatrix(dx, dy, dz));
    }

    float() {
        let actualHeight = this.node.worldMatrix[7];
        this.translate(0.0, floatingHeight-actualHeight, 0.0);
    }

    land(){//TODO fix heights
        let highestDisc = getRod(currentRod).getHighestDisc();
        let rodHeight = highestDisc==null ? 0.0 : highestDisc.node.worldMatrix[7];
        this.translate(0.0, rodHeight-floatingHeight, 0.0);
        this.rod.removeDisc(this);
        getRod(currentRod).addDisc(this);
        if(highestDisc != null) {
            this.node.setParent(highestDisc.node);
        } else {
            this.node.setParent(objects[0].node);
        }
    }

    shift(toRight) {
        let shiftVal = shiftingValue;
        if(!toRight) {
            shiftVal = -shiftVal;
        }
        this.translate(shiftVal, 0.0, 0.0);
        //TODO update texture
        this.canMove = this.rod.checkMoveDisc(getRod(currentRod));//TODO accordingly with texture
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

    checkMoveDisc(dest){
        if(this.length == 0){
            return false;
        }
        return dest.getHighestDisc()!=null ? dest.getHighestDisc().level < this.getHighestDisc().level : true;
    }

    addDisc(disc){
        this.discs[this.length] = disc;
        this.length++;
        disc.rod = this;
    }

    removeDisc(disc){
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
    cameraPositionNode = new Node();


    basePositionNode = new Node();
    basePositionNode.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase, dzBase);
    basePositionNode.setParent(cameraPositionNode);
    objects[0] = new Piece(baseName);
    objects[0].node.setParent(basePositionNode);

    //initialize rod 1
    startRod = new Rod(startRodName);
    startRod.node.setParent(objects[0].node);


        //initialize rod 2
    middleRod = new Rod(middleRodName);
    middleRod.node.setParent(objects[0].node);


        //initialize rod 3
    endRod = new Rod(endRodName);
    endRod.node.setParent(objects[0].node);

    let prevHeight = 0;
    let prevNode = startRod.node;
    for(let i=1; i<=maxLevel; i++){//discs starts from index 1
        objects[i] = new Disc(i);
        startRod.addDisc(objects[i]);
        objects[i].node.setParent(prevNode);
        prevHeight = objects[i].height;
        prevNode = objects[i].node;
    }
}

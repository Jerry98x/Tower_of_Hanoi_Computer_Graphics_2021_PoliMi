//Node definition
class Node {
    constructor(name){
        this.name = 'node'+name;
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
        this.node= new Node(name);
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
    constructor(level, thickness, startingHeight) {
        super(level.toString());
        this.level = level;
        this.actualHeight = startingHeight;
        this.originalHeight = startingHeight;
        this.thickness = thickness;
        this.rod = null;
    }

    translate(dx, dy, dz){
        this.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(dx, dy, dz), this.node.localMatrix);
    }

    float() {
        /*
        //let actualHeight = this.node.worldMatrix[7];
        this.translate(0.0, floatingHeight-this.actualHeight, 0.0);
        this.actualHeight = floatingHeight;

         */
        this.translate(0.0, floatingHeight-this.actualHeight, 0.0);
        this.actualHeight = floatingHeight;
    }

    land(){//TODO fix heights
        /*
        let highestDisc = getRod(currentRod).getHighestDisc();
        let rodHeight = highestDisc==null ? 0.0 : highestDisc.actualHeight+highestDisc.thickness/2;
        this.translate(0.0, -floatingHeight+rodHeight+this.thickness/2, 0.0);
        this.actualHeight = rodHeight+this.thickness/2;

         */
        this.rod.removeDisc(this);
        this.translate(-xPast, 0.0, 0.0);
        let highestDisc = getRod(currentRod).getHighestDisc();
        getRod(currentRod).addDisc(this);
        let rodHeight = highestDisc==null ? 0.0 : highestDisc.thickness;
        let totalHeight = rodHeight;
        this.translate(0.0, (-floatingHeight + totalHeight), 0.0);
        this.actualHeight = totalHeight;
    }

    shift(toRight) {
        this.translate(toRight ? shiftingValue : -shiftingValue, 0.0, 0.0);
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
        return dest.length>0 ? dest.getHighestDisc().level <= this.getHighestDisc().level : true;
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

function getDiscThickness(int) {
    switch (int){
        case 1:
            return 2.34;
        case 2:
            return 1.99;
        case 3:
            return 1.69;
        case 4:
            return 1.44;
        case 5:
        case 6:
            return 1.22;
        case 7:
            return 1.04;
    }
}

function computeSceneGraph() {
    cameraPositionNode = new Node('camera');


    basePositionNode = new Node('basepos');
    basePositionNode.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase, dzBase);
    basePositionNode.setParent(cameraPositionNode);
    objects[0] = new Piece(baseName);
    objects[0].node.setParent(basePositionNode);

    //initialize rod 1
    startRod = new Rod(startRodName);
    startRod.node.setParent(objects[0].node);


        //initialize rod 2
    middleRod = new Rod(middleRodName);
    middleRod.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(15.0, 0.0, 0.0), middleRod.node.localMatrix);
    middleRod.node.setParent(objects[0].node);


        //initialize rod 3
    endRod = new Rod(endRodName);
    endRod.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(30.0, 0.0, 0.0), endRod.node.localMatrix);
    endRod.node.setParent(objects[0].node);

    let startingHeight = 0;
    for(let i=1; i<=maxLevel; i++){//discs starts from index 1
        objects[i] = new Disc(i, getDiscThickness(i), startingHeight);
        startRod.addDisc(objects[i]);
        startingHeight += getDiscThickness(i);
    }
}

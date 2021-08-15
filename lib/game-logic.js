
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
        this.rod = null;
    }

    translate(dx, dy, dz){
        this.node.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(dx, dy, dz), this.node.localMatrix);
    }

    float() {
        this.node.setParent(this.rod.node);
        this.translate(0.0, floatingHeight, 0.0);
    }

    land(){
        this.rod.removeDisc(this);
        getRod(currentRod).addDisc(this);
        this.translate(0.0, -floatingHeight, 0.0);
        if(endRod.length == maxLevel){
            gameEnded = true;
        }
    }

    shift() {
        this.node.setParent(getRod(currentRod).node);//
        //TODO update texture
        this.canMove = this.rod.checkMoveDisc(getRod(currentRod));
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

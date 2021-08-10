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
    }
}

class Rod extends Piece {
    constructor(name) {
        super(name);
        this.drawInfo = null;
        this.discs = [];
    }

    getMaxDisc(){
        return this.discs.length>0 ? this.discs[this.discs.length-1] : null;
    }

    checkMoveDisc(dest){
        if(this.discs.length == 0){
            return false;
        }
        return dest.getMaxDisc()!=null ? dest.getMaxDisc().level < this.getMaxDisc().level : true;
    }

    moveDisc(dest) {
        let movingDisc = this.getMaxDisc();
        let destDisc = dest.getMaxDisc();
        movingDisc.rod = dest;
        movingDisc.level_below = destDisc==null ? 0 : destDisc.level;
        movingDisc.setNode(destDisc==null ? dest.rodNode : destDisc.node, destDisc==null ? 0 : destDisc.height);
        dest.discs[dest.discs.length] = movingDisc;
        this.discs[this.discs.length - 1] = null;
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
        startRod.discs[startRod.discs.length] = objects[i];
        objects[i].node.setParent(prevNode);
        prevHeight = objects[i].height;
        prevNode = objects[i].node;
    }
}

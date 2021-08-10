//Node definition
var Node = function() {
    this.children = [];
    this.localMatrix = utils.identityMatrix();
    this.worldMatrix = utils.identityMatrix();
};

Node.prototype.setParent = function(parent) {
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
};

Node.prototype.updateWorldMatrix = function(matrix) {
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
};

Node.prototype.setDrawInfo = function(name){
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
        modelSrc:                   null,
        vertices:                   null,
        normals:                    null,
        textureCoord:               null,
        indices:                    null,
        textureSrc:                 null,
        textureRef:                 [],
    }
}

var Piece = function(name){
    this.name = name;
    this.node = new Node();
    this.info = null;
}

var Disc = function(level){
    Piece.call(level.toString());
    this.info = {
        level: level,
        height: level<5 ? discMinHeight : discMaxHeight,
    }
}

var Rod = function (name){
    Piece.call(name);
    this.info = {
        discs: [],
    }
}
/*
var Disc = function(level, level_below){
    this.level = level;
    this.height = level<5 ? discMinHeight : discMaxHeight;
    this.rod = null;//TODO useful?
    this.level_below = level_below;//TODO useful?
    this.node = new Node();
    this.node.setDrawInfo(level.toString());
}

 */

Disc.prototype.setNode = function(nodeBelow, prevHeight){
    this.node.localMatrix = utils.MakeTranslateMatrix(0, prevHeight/2 + this.height/2, 0);
    this.node.setParent(nodeBelow);
}
/*
var Rod = function(name){
    this.rodNode = new Node();
    this.rodNode.setDrawInfo(name);
    this.discs = [];
}

 */

Rod.prototype.getMaxDisc = function (){
    return this.discs.length>0 ? this.discs[this.discs.length-1] : null;
}

Rod.prototype.checkMoveDisc = function(dest){
    if(this.discs.length == 0){
        return false;
    }
    return dest.getMaxDisc()!=null ? dest.getMaxDisc().level < this.getMaxDisc().level : true;
}

Rod.prototype.moveDisc = function(dest) {
    let movingDisc = this.getMaxDisc();
    let destDisc = dest.getMaxDisc();
    movingDisc.rod = dest;
    movingDisc.level_below = destDisc==null ? 0 : destDisc.level;
    movingDisc.setNode(destDisc==null ? dest.rodNode : destDisc.node, destDisc==null ? 0 : destDisc.height);
    dest.discs[dest.discs.length] = movingDisc;
    this.discs[this.discs.length - 1] = null;
}

function computeSceneGraph() {
    cameraPositionNode = new Node();

    basePositionNode = new Node();
    basePositionNode.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase, dzBase);

    basePositionNode.setParent(cameraPositionNode);
    baseNode = new Node();
    baseNode.setParent(basePositionNode);
    baseNode.setDrawInfo(baseName);
    //baseNode.drawInfo.modelSrc = ;//TODO add path
    objects[baseName] = baseNode;

    //initialize rod 1
    objects[startRodName] = new Rod(startRodName);
    objects[startRodName].rodNode.localMatrix = utils.MakeTranslateMatrix(dxBase-xOffsetRod, dyBase-yOffsetRod, dzBase);
    //objects[startRodName].rodNode.drawInfo.modelSrc = ;//TODO add path


        //initialize rod 2
    objects[middleRodName] = new Rod(middleRodName);
    objects[middleRodName].rodNode.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase-yOffsetRod, dzBase);
    //objects[middleRodName].rodNode.drawInfo.modelSrc = ;//TODO add path


        //initialize rod 3
    objects[endRodName] = new Rod(endRodName);
    objects[endRodName].rodNode.localMatrix = utils.MakeTranslateMatrix(dxBase+xOffsetRod, dyBase-yOffsetRod, dzBase);
    //objects[endRodName].rodNode.drawInfo.modelSrc = ;//TODO add path

    let prevHeight = 0;
    let prevNode = objects[startRodName].rodNode;
    for(let i=1; i<=maxLevel; i++){//discs starts from index 1
        let level_below = (i-1)<1 ? 0 : i-1;
        objects[i.toString()] = new Disc(i, level_below);
        objects[i.toString()].rod = objects[startRodName];
        objects[startRodName].discs[objects[startRodName].discs.length] = objects[i.toString()];
        objects[i.toString()].setNode(prevNode, prevHeight);
        objects[i.toString()].node.drawInfo.modelSrc = getDiscModelPath(i);//TODO dynamically create path to .obj
        prevHeight = objects[i.toString()].height;
        prevNode = objects[i.toString()].node;
    }
}

function getDiscModelPath(level){
    return '/models';
}
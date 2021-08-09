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

var Disc = function(level, level_below){
    this.level = level;
    this.height = level<5 ? discMinHeight : discMaxHeight;
    this.rod = null;//TODO useful?
    this.level_below = level_below;//TODO useful?
    this.node = null;
    this.modelSrc = null;//TODO use level to get path
}

Disc.prototype.setNode = function(nodeBelow, prevHeight){
    this.node.localMatrix = utils.MakeTranslateMatrix(0, prevHeight/2 + this.height/2, 0);
    this.node.setParent(nodeBelow);
}

var Rod = function(rodNode){
    this.rodNode = rodNode;
    this.discs = [];
}

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
    //TODO update movingDisc.positionNode with dest.coordinates
    movingDisc.setNode(destDisc==null ? dest.rodNode : destDisc.node, destDisc==null ? 0 : destDisc.height);
    dest.discs[dest.discs.length] = movingDisc;
    this.discs[this.discs.length - 1] = null;
}

function computeSceneGraph() {
    cameraPositionNode = new Node();

    basePositionNode = new Node();
    basePositionNode.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase, dzBase);

    basePositionNode.setParent(cameraPositionNode);
    baseNode.setParent(basePositionNode);

    //initialize rod 1
    rods[0].rodNode = new Rod(new Node());
    rods[0].rodNode.localMatrix = utils.MakeTranslateMatrix(dxBase-xOffsetRod, dyBase-yOffsetRod, dzBase);

    //initialize rod 2
    rods[1].rodNode = new Rod(new Node());
    rods[1].rodNode.localMatrix = utils.MakeTranslateMatrix(dxBase, dyBase-yOffsetRod, dzBase);

    //initialize rod 3
    rods[2].rodNode = new Rod(new Node());
    rods[2].rodNode.localMatrix = utils.MakeTranslateMatrix(dxBase+xOffsetRod, dyBase-yOffsetRod, dzBase);

    let prevHeight = 0;
    let prevNode = rods[0].rodNode;
    for(let i=1; i<=maxLevel; i++){//discs starts from index 1
        let level_below = (i-1)<1 ? 0 : i-1;
        discs[i] = new Disc(i, level_below);
        discs[i].rod = rods[0];
        rods[0].discs[rods[0].discs.length] = discs[i];
        discs[i].node = new Node();
        discs[i].setNode(prevNode, prevHeight);
        discs[i].modelSrc = getDiscModelPath(i);//TODO dynamically create path to .obj
        prevHeight = discs[i].height;
        prevNode = discs[i].node;
    }

}
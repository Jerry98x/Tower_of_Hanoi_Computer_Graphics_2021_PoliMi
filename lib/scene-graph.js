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

    for(let i=1; i<=maxLevel; i++){//discs starts from index 1
        objects[i] = new Disc(i);
        objects[i].translate(0.0, discThickness, 0.0);
        startRod.addDisc(objects[i]);
    }
}

/**
 * When the mouse is clicked, it makes a disk float from the clicked rod or land on it (if possible).
 * @param {*} event 
 */
function doMouseDown(event) {
    if(!gameEnded && gameStarted) {
        lastMouseX = event.clientX;
        if (!movingKey && !floating && !goingUp && !goingDown) { //no floating disc
            startingRod = getPointedRod(event);
            let rod = getRod(startingRod);
            if (startingRod != 0 && rod.length > 0) {
                movingMouse = true;
                floatingDisc = rod.discs[rod.length - 1];
                floatingDisc.float();
                floating = true;
                document.getElementById('allowed').innerHTML = okMsg;
                document.getElementById('allowedPane').style.visibility = 'visible';
            }
        } else if (!movingKey && floating && !goingUp && !goingDown) {
            currentRod = getPointedRod(event);
            if (currentRod != 0 && getRod(currentRod).canAddDisc(floatingDisc)) {
                floatingDisc.land();
                movingMouse = false;
                floating = false;
                document.getElementById('allowedPane').style.visibility = 'hidden';
            }
        }
    }
}

/**
 * Moves a floating disc (if available) accordingly to the cursor movement.
 * @param {*} event 
 */
function doMouseMove(event) {
    if(!gameEnded && gameStarted) {
        if (movingMouse && !movingKey && !goingUp && !goingDown) {
            let tmpRod = getPointedRod(event);
            var dx = mouseWorldX - currentDiscX;
            if (dx != 0 && floating) {
                floatingDisc.translate(dx, 0.0, 0.0);
                updateAllowed(tmpRod);
            }
            currentDiscX += dx;
            deltaX += dx;
        }
    }
}

/**
 * Update the on-screen message about the feasibility of a landing on the pointed rod.
 * @param {*} pointedRod 
 */
function updateAllowed(pointedRod){
    let allowedPane = document.getElementById('allowedPane');
    if(pointedRod != 0 && getRod(pointedRod).canAddDisc(floatingDisc)){
        allowedPane.style.visibility = 'visible';
        allowedPane.style.borderColor = 'green';
        document.getElementById('allowed').innerHTML = okMsg;
    } else if (pointedRod != 0) {
        allowedPane.style.visibility = 'visible';
        allowedPane.style.borderColor = 'red';
        document.getElementById('allowed').innerHTML = notOkMsg;
    } else {
        allowedPane.style.visibility = 'hidden';
    }
}

/**
 * Computes the projection on the X axis of the cursor.
 * @param {*} event 
 */
function updateMouseWorldX(event){
    var top = 0.0, left = 0.0;
    canvas = gl.canvas;
    while (canvas && canvas.tagName !== 'BODY') {
        top += canvas.offsetTop;
        left += canvas.offsetLeft;
        canvas = canvas.offsetParent;
    }
    var x = event.clientX - left;
    var y = event.clientY - top;

    //Compute the normalized device coordinates from the pixel coordinates of the canvas
    var normX = (2*x)/ gl.canvas.width - 1;
    var normY = 1 - (2*y) / gl.canvas.height;

    //Inversion of the transformation pipeline
    var projInv = utils.invertMatrix(perspectiveMatrix);
    var viewInv = utils.invertMatrix(viewMatrix);

    //Find the point (un)projected on the near plane, from clip space coords to eye coords
    //z = -1 makes it so the point is on the near plane
    //w = 1 is for the homogeneous coordinates in clip space
    var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);

    //This finds the direction of the ray in eye space
    //Formally, to calculate the direction you would do dir = point - eyePos but since we are in eye space eyePos = [0,0,0]
    //w = 0 is because this is not a point anymore but is considered as a direction
    var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];


    //We find the direction expressed in world coordinates by multiplying with the inverse of the view matrix
    var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
    var normalizedRayDir = utils.normalize(rayDir);
    //The ray starts from the camera in world coordinates
    var rayStartPoint = [cx, cy, cz];
    //We iterate on all the objects in the scene to check for collisions
    if(normalizedRayDir[2] != 0) {
        let t = (dzBase - rayStartPoint[2]) / normalizedRayDir[2];
        mouseWorldX = rayStartPoint[0] + t * normalizedRayDir[0];
    }
}

/**
 * Computes the index of the pointed rod.
 * @param {*} event 
 * @returns computed index or 0 if there's no valid rod.
 */
function getPointedRod(event) {
    updateMouseWorldX(event);
    if (-outerX < mouseWorldX && mouseWorldX < -innerX) {
        return 1;
    } else if (-innerX < mouseWorldX && mouseWorldX < innerX) {
        return 2;
    } else if (innerX < mouseWorldX && mouseWorldX < outerX) {
        return 3;
    }
    return 0;
}

/**
 * Updates the quaternion representing the rotation of the base object.
 * @param {*} rvx 
 * @param {*} rvy 
 * @param {*} rvz 
 * @returns the updated quaternion as a 4x4 matrix.
 */
function getRotatedMatrix(rvx, rvy, rvz) {
    var deltaq = Quaternion.fromEuler(utils.degToRad(rvz), utils.degToRad(rvx), utils.degToRad(rvy), order = 'ZXY');
    baseq = deltaq.mul(baseq);
    return baseq.toMatrix4();
}

/**
 * Allows the gameplay by using the keyboard; matches each usable key with the corresponding function.
 * @param {*} event 
 */
function keyFunctionDown(event) {
    switch (event.keyCode) {
        case 68://D
            //rotate object to the left
            if (!movingMouse && yRotation - step > -45) {
                yRotation -= step;
                objects[0].node.localMatrix = getRotatedMatrix(0.0, -step, 0.0);

            }
            break;
        case 65://A
            //rotate object to the righ
            if (!movingMouse && yRotation + step < 45) {
                yRotation += step;
                objects[0].node.localMatrix = getRotatedMatrix(0.0, step, 0.0);
            }
            break;
        case 87://W
            //zoom in
            if (!movingMouse && lookRadius - step > 10) {
                lookRadius -= step;
                cz -= step;
            }
            break;
        case 83://S
            //zoom out
            if (!movingMouse && lookRadius + step < 50) {
                lookRadius += step;
                cz += step;
            }
            break;
        case 49://1
            //select rod 1
            if (!gameEnded && gameStarted) {
                if (!movingMouse && !floating && startRod.length > 0) {
                    movingKey = true;
                    floating = true;
                    floatingDisc = startRod.getHighestDisc();
                    floatingDisc.float();
                    startingRod = 1;
                    currentRod = startingRod;
                    document.getElementById('allowed').innerHTML = okMsg;
                    document.getElementById('allowedPane').style.visibility = 'visible';
                }
            }
            break;
        case 50://2
            //select rod 2
            if (!gameEnded && gameStarted) {
                if (!movingMouse && !floating && middleRod.length > 0) {
                    movingKey = true;
                    floating = true;
                    floatingDisc = middleRod.getHighestDisc();
                    floatingDisc.float();
                    startingRod = 2;
                    currentRod = startingRod;
                    document.getElementById('allowed').innerHTML = okMsg;
                    document.getElementById('allowedPane').style.visibility = 'visible';
                }
            }
            break;
        case 51://3
            //select rod 3
            if (!gameEnded && gameStarted) {
                if (!movingMouse && !floating && endRod.length > 0) {
                    movingKey = true;
                    floating = true;
                    floatingDisc = endRod.getHighestDisc();
                    floatingDisc.float();
                    startingRod = 3;
                    currentRod = startingRod;
                    document.getElementById('allowed').innerHTML = okMsg;
                    document.getElementById('allowedPane').style.visibility = 'visible';
                }
            }
            break;
        case 37: //arrow left
            //shift left
            if (!gameEnded && gameStarted) {
                if (!movingMouse && floating && currentRod != 1) {
                    currentRod--;
                    floatingDisc.shift();
                    updateAllowed(currentRod);
                }
            }
            break;
        case 39: //arrow right
            //shift right
            if (!gameEnded && gameStarted) {
                if (!movingMouse && floating && currentRod != 3) {
                    currentRod++;
                    floatingDisc.shift();
                    updateAllowed(currentRod);
                }
            }
            break;
        case 13: //enter
            //accept rod
            if (!gameEnded && gameStarted) {
                if (!movingMouse && floating && getRod(currentRod).canAddDisc(floatingDisc)) {
                    floatingDisc.land();
                    startingRod = currentRod;
                    movingKey = false;
                    floating = false;
                    document.getElementById('allowedPane').style.visibility = 'hidden';
                }
            }
            event.preventDefault();
            break;
    }
}

function computeModelData() {
    for(let i=0; i<objects.length; i++){
        objects[i].drawInfo.vertices = models[i].vertices;
        objects[i].drawInfo.indices = models[i].indices;
        objects[i].drawInfo.normals = models[i].vertexNormals;
        objects[i].drawInfo.texCoord = models[i].textures;
    }
}

/**
 * Creates VBOs and VAOs.
 * @param {*} object 
 * @returns 
 */
function createBuffers(object) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Vertices
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.drawInfo.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(object.drawInfo.positionAttributeLocation);
    gl.vertexAttribPointer(object.drawInfo.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // Normals
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.drawInfo.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(object.drawInfo.normalAttributeLocation);
    gl.vertexAttribPointer(object.drawInfo.normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // Textures Coordinates
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.drawInfo.texCoord), gl.STATIC_DRAW);
    gl.vertexAttribPointer(object.drawInfo.uvLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(object.drawInfo.uvLocation);

    // Indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.drawInfo.indices), gl.STATIC_DRAW);
    return vao;
}

async function serializeModel() {
    for(let i=0; i<modelsSrc.length; i++) {
        modelsSerialized[i] = await utils.get_objstr(modelsSrc[i]);
    }
}

function getModel() {
    for(let i=0; i<modelsSerialized.length; i++) {
        models[i] = new OBJ.Mesh(modelsSerialized[i]);
    }
}

var main = function (){

    computeSceneGraph();

    window.addEventListener("mousedown", doMouseDown, false);
    window.addEventListener("mousemove", doMouseMove, false);
    window.addEventListener("keydown", keyFunctionDown, false);

    //pair the position variables of the shaders with the js variables
    objects.forEach(function (object) {
        gl.useProgram(object.drawInfo.programInfo);
        object.drawInfo.eyePositionHandle = gl.getUniformLocation(object.drawInfo.programInfo, 'eyePosition');
        object.drawInfo.positionAttributeLocation = gl.getAttribLocation(object.drawInfo.programInfo, "inPosition");
        object.drawInfo.normalAttributeLocation = gl.getAttribLocation(object.drawInfo.programInfo, "inNormal");
        object.drawInfo.uvLocation = gl.getAttribLocation(object.drawInfo.programInfo, "a_uv");
        object.drawInfo.matrixLocation = gl.getUniformLocation(object.drawInfo.programInfo, "matrix");
        object.drawInfo.textLocation = gl.getUniformLocation(object.drawInfo.programInfo, "sampler");
        object.drawInfo.normalMatrixPositionHandle = gl.getUniformLocation(object.drawInfo.programInfo, 'nMatrix');
        object.drawInfo.vertexMatrixPositionHandle = gl.getUniformLocation(object.drawInfo.programInfo, 'pMatrix');
    });

    computeModelData();

    //create buffers
    objects.forEach(function (object) {
        object.drawInfo.vertexArray = createBuffers(object);
        gl.bindVertexArray(null);
    });

    //pair the lights variables of the shaders with the js variables
    objects.forEach(function (object) {
        gl.useProgram(object.drawInfo.programInfo);

        materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
        lightPositionGeneralHandle = gl.getUniformLocation(program, 'lightPositionGeneral');
        lightColorHandleGeneral = gl.getUniformLocation(program, 'lightColorGeneral');

        lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
        lightColorHandleDir = gl.getUniformLocation(program, 'lightColor');

        lightPosLocation = gl.getUniformLocation(program, 'LAPos');
        lightTargetLocation = gl.getUniformLocation(program, "LATarget");
        lightDecayLocation = gl.getUniformLocation(program, "LADecay");
        lightColorHandlePoint = gl.getUniformLocation(program, 'LAlightColor');

        ambientLightColorHandle = gl.getUniformLocation(program, 'ambientLightColor');
    });


    loadTextures();

    //
    // Main render loop
    //
    requestAnimationFrame(drawScene); //creates animation frame

    //populate the scene
    function drawScene() {


        //animations for discs (rising and landing)
        if(goingUp) {
            if (deltaY+stepY >= floatingHeight) {
                floatingDisc.translate(0.0, stepY, 0.0);
                deltaY = floatingHeight;
                goingUp = false;
            } else {
                floatingDisc.translate(0.0, stepY, 0.0);
                deltaY += stepY;
            }
        }
        if(goingDown){
            if (deltaY-stepY <= 0.0) {
                floatingDisc.translate(0.0, -stepY, 0.0);
                deltaY = 0.0;
                goingDown = false;
                if(gameEnded) {
                    document.getElementById("end").style.visibility="visible";
                }
            } else {
                floatingDisc.translate(0.0, -stepY, 0.0);
                deltaY -= stepY;
            }
        }

        // Clear
        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);


        // Compute the perspective matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        perspectiveMatrix = utils.MakePerspective(90.0, aspect, 0.1, 100.0);


        // update WV matrix
        var cameraPosition = [cx, cy, cz];
        var target = [0.0, eyeHeight, 0.0];
        var up = [0.0, 1.0, 0.0];
        var cameraMatrix = utils.LookAt(cameraPosition, target, up);
        var viewMatrix = utils.invertMatrix(cameraMatrix);


        //compute light direction (for directional light)
        directionalLight = [Math.cos(utils.degToRad(dirLightTheta)) * Math.cos(utils.degToRad(dirLightPhi)), Math.sin(utils.degToRad(dirLightTheta)), Math.cos(utils.degToRad(dirLightTheta)) * Math.sin(utils.degToRad(dirLightPhi))];        


        // Update all world matrices in the scene graph
        objects[0].node.updateWorldMatrix();

        // Compute all the matrices for rendering
        objects.forEach(function(object) {

            gl.useProgram(object.drawInfo.programInfo);

            var eyePos = [cx, cy, cz];

            var worldViewMatrix = utils.multiplyMatrices(viewMatrix, object.node.worldMatrix);
            projMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldViewMatrix));

            //Transform from World Space to Camera Space
            var lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix)); //direct
            directionalLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4((lightDirMatrix)), directionalLight);    //direct

            gl.uniformMatrix4fv(object.drawInfo.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(worldViewMatrix)); 
            lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);    //point

            generalLightPosTransformed = utils.multiplyMatrixVector(viewMatrix, positionLightGeneral);
            

            gl.uniformMatrix4fv(object.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projMatrix));
            gl.uniformMatrix4fv(object.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

            gl.uniform3fv(object.drawInfo.eyePositionHandle, eyePos);



            // Shaders for lights
            gl.uniform3fv(materialDiffColorHandle, materialDiffColor);

            gl.uniform3fv(lightColorHandleGeneral, lightColorGeneral); //general
            gl.uniform3fv(lightPositionGeneralHandle, generalLightPosTransformed.slice(0,3));  //general


            //direct
            if(document.getElementById("directBox").checked) {
                gl.uniform3fv(lightColorHandleDir, directionalLightColor);
                gl.uniform3fv(lightDirectionHandle, directionalLightTransformed);
            }
            else {
                gl.uniform3fv(lightColorHandleDir, [0.0, 0.0, 0.0]);
                gl.uniform3fv(lightDirectionHandle, [0.0, 0.0, 0.0]);
            }


            //point
            if(document.getElementById("pointBox").checked) {
                gl.uniform3fv(lightColorHandlePoint, pointLightColor);
                gl.uniform3fv(lightPosLocation, lightPosTransformed.slice(0,3));
                gl.uniform1f(lightTargetLocation,  lightTarget);
                gl.uniform1f(lightDecayLocation,  lightDecay);
            }
            else {
                gl.uniform3fv(lightColorHandlePoint, [0.0, 0.0, 0.0]);
                gl.uniform3fv(lightPosLocation, [0.0, 0.0, 0.0]);
                gl.uniform1f(lightTargetLocation, 0);
                gl.uniform1f(lightDecayLocation, 0)
            }
            

            //constant ambient
            if(document.getElementById("ambientBox").checked) {
                gl.uniform3fv(ambientLightColorHandle, ambientLightColor);
            }
            else {
                gl.uniform3fv(ambientLightColorHandle, [0.0, 0.0, 0.0]);
            }


            // Render the Texture

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, object.drawInfo.textureRef[0]);
            gl.uniform1i(object.drawInfo.textLocation, 0);

            gl.bindVertexArray(object.drawInfo.vertexArray);

            gl.drawElements(gl.TRIANGLES, object.drawInfo.indices.length, gl.UNSIGNED_SHORT, 0);

        });

        window.requestAnimationFrame(drawScene);
    }

    window.requestAnimationFrame(drawScene);
}

var init = async function() {
    elevation = 90.0;
    angle = 90.0;
    lookRadius = 30.0;
    gameEnded = false;
    win = false;
    movingMouse = false;
    movingKey = false;
    floating = false;
    baseq = new Quaternion(1, 0, 0, 0);
    yRotation = 0;
    cz = 40;
    startingRod = 1;
    currentRod = 1;
    deltaX = 0;
    deltaY = 0;
    numberOfMoves = 0;
    document.getElementById('numberOfMoves').innerHTML = numberOfMoves.toString();
    allowedMoves = document.getElementById('allowedMoves').value;
    maxLevel = document.getElementById('numberOfDiscs').value;

    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";

    // Init canvas and gl
    canvas = document.getElementById("canvas");
    gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('Your browser does not support WebGL 2.0');
    }

    //
    // General setup
    //
    //utils.resizeCanvasToPercentage(gl.canvas, 0.75, 0.95);

    utils.resizeCanvasDynamicHor(gl.canvas, document.getElementById('options').style.width, 0.95, 64)

    // var optionsColumn = document.getElementById("options");
    // utils.resizeElementToPercentageStyle(optionsColumn, 0.25, 0.05);


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //
    // Create shaders & program
    //
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });


    //
    // Load models
    //
    await serializeModel();
    getModel();

    main();
}

function start() {
    document.getElementById("end").style.visibility="hidden";

    gameStarted = true;
    elevation = 90.0;
    angle = 90.0;
    lookRadius = 30.0;
    gameEnded = false;
    win = false;
    movingMouse = false;
    movingKey = false;
    floating = false;
    baseq = new Quaternion(1, 0, 0, 0);
    yRotation = 0;
    cz = 40;
    startingRod = 1;
    currentRod = 1;
    deltaX = 0;
    deltaY = 0;
    numberOfMoves = 0;
    document.getElementById('numberOfMoves').innerHTML = numberOfMoves.toString();
    allowedMoves = document.getElementById('allowedMoves').value;
    maxLevel = document.getElementById('numberOfDiscs').value;
    objects = [];
    models = [];
    modelsSerialized = [];


    init();
}

/**
 * Sets the minimum of necessary moves to win with a fixed number of discs.
 */
function setMinMoves(){
    maxLevel = document.getElementById('numberOfDiscs').value;
    let minMoves = 0;
    for(let i=1; i<=maxLevel; i++){
        minMoves = 2*minMoves + 1;
    }
    document.getElementById('allowedMoves').value = minMoves;
}

// function resizeOptionsColum(opt) {
//     const expandFullScreenOpt = () => {
//         opt.width = window.innerWidth;
//         opt.height = window.innerHeight;
          
//       };
//       expandFullScreenOpt();
//       window.addEventListener('resize', expandFullScreenOpt);
// }

window.onload = init;

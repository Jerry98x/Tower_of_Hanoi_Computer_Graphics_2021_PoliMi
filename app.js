var gl;
var baseDir;
var shaderDir;
var program;


var positionLight = [-100.0, -900.0, -100.0];
var spotLightColorGeneral = [1.0, 1.0, 1.0];
var ambientLightColor = [0.2, 0.2, 0.2];


//direct
var directionalLightColor = [0.1, 1.0, 1.0];
var lightDirectionHandle;
var directionalLightTransformed;
var lightColorHandleDir;

//point
var pointLightColor = [1.0, 1.0, 1.0];
var lightPos = [0.0, 15.0, 20.0, 1.0];
var lightPosTransformed;
var lightTarget = 50;
var lightDecay = 2;
//var vertexMatrixPositionHandle = gl.getUniformLocation(program, 'pMatrix');
var lightPosLocation;
var lightTargetLocation;
var lightDecayLocation;
var lightColorHandlePoint;


function doMouseDown(event) {
    if(!gameEnded && gameStarted) {
        lastMouseX = event.clientX;
        if (!movingKey && !floating && !goingUp && !goingDown) {
            startingRod = getPointedRod(event);
            if (startingRod != 0) {
                movingMouse = true;
                let rod = getRod(startingRod);
                floatingDisc = rod.discs[rod.length - 1];
                floatingDisc.float();
                floating = true;
            }
            //console.log(floatingDisc.node.localMatrix);
        } else if (!movingKey && floating && !goingUp && !goingDown) {
            currentRod = getPointedRod(event);
            if (currentRod != 0 && getRod(currentRod).canAddDisc(floatingDisc)) {
                floatingDisc.land();
                movingMouse = false;
                floating = false;
            }
            //console.log(floatingDisc.node.localMatrix);
        }
    }
}

function doMouseMove(event) {
    if(!gameEnded && gameStarted) {
        if (movingMouse && !movingKey && !goingUp && !goingDown) {
            updateMouseWorldX(event);
            var dx = mouseWorldX - currentDiscX;
            if (dx != 0) {
                floatingDisc.translate(dx, 0.0, 0.0);
            }
            currentDiscX += dx;
            deltaX += dx;
        }
    }
}

function updateMouseWorldX(event){
    //This is a way of calculating the coordinates of the click in the canvas taking into account its possible displacement in the page
    var top = 0.0, left = 0.0;
    canvas = gl.canvas;
    while (canvas && canvas.tagName !== 'BODY') {
        top += canvas.offsetTop;
        left += canvas.offsetLeft;
        canvas = canvas.offsetParent;
    }
    var x = event.clientX - left;
    var y = event.clientY - top;

    //Here we calculate the normalised device coordinates from the pixel coordinates of the canvas
    var normX = (2*x)/ gl.canvas.width - 1;
    var normY = 1 - (2*y) / gl.canvas.height;

    //We need to go through the transformation pipeline in the inverse order so we invert the matrices
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
    var normalisedRayDir = utils.normalize(rayDir);
    //The ray starts from the camera in world coordinates
    var rayStartPoint = [cx, cy, cz];
    //We iterate on all the objects in the scene to check for collisions
    if(normalisedRayDir[2] != 0) {
        let t = (dzBase - rayStartPoint[2]) / normalisedRayDir[2];
        mouseWorldX = rayStartPoint[0] + t * normalisedRayDir[0];
    }
}

function getPointedRod(event) {
    updateMouseWorldX(event);
    if (x11 < mouseWorldX && mouseWorldX < x12) {
        return 1;
    } else if (x21 < mouseWorldX && mouseWorldX < x22) {
        return 2;
    } else if (x31 < mouseWorldX && mouseWorldX < x32) {
        return 3;
    }
    return 0;
}

function getRotatedMatrix(rvx, rvy, rvz) {

    var deltaq = Quaternion.fromEuler(utils.degToRad(rvz), utils.degToRad(rvx), utils.degToRad(rvy), order = 'ZXY');

    baseq = deltaq.mul(baseq);

    return baseq.toMatrix4();
}

function keyFunctionDown(event) {
    switch (event.keyCode) {
        case 68://D
            //move camera to the right
            if (!movingMouse && yRotation - step > -45) {
                yRotation -= step;
                objects[0].node.localMatrix = getRotatedMatrix(0.0, -step, 0.0);

            }
            break;
        case 65://A
            //move camera to the left
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
            //rod 1
            if (!gameEnded && gameStarted) {
                if (!movingMouse && !floating && startRod.length > 0) {
                    movingKey = true;
                    floating = true;
                    floatingDisc = startRod.getHighestDisc();
                    floatingDisc.float();
                    startingRod = 1;
                    currentRod = startingRod;
                }
            }
            break;
        case 50://2
            //rod 2
            if (!gameEnded && gameStarted) {
                if (!movingMouse && !floating && middleRod.length > 0) {
                    movingKey = true;
                    floating = true;
                    floatingDisc = middleRod.getHighestDisc();
                    floatingDisc.float();
                    startingRod = 2;
                    currentRod = startingRod;
                }
            }
            break;
        case 51://3
            //rod 3
            if (!gameEnded && gameStarted) {
                if (!movingMouse && !floating && endRod.length > 0) {
                    movingKey = true;
                    floating = true;
                    floatingDisc = endRod.getHighestDisc();
                    floatingDisc.float();
                    startingRod = 3;
                    currentRod = startingRod;
                }
            }
            break;
        case 37:
            //shift left
            if (!gameEnded && gameStarted) {
                if (!movingMouse && floating && currentRod != 1) {
                    currentRod--;
                    floatingDisc.shift();
                    //TODO update texture
                }
            }
            break;
        case 39:
            //shift right
            if (!gameEnded && gameStarted) {
                if (!movingMouse && floating && currentRod != 3) {
                    currentRod++;
                    floatingDisc.shift();
                    //TODO update texture
                }
            }
            break;
        case 13:
            //accept rod
            if (!gameEnded && gameStarted) {
                if (!movingMouse && floating && getRod(currentRod).canAddDisc(floatingDisc)) {
                    floatingDisc.land();
                    startingRod = currentRod;
                    movingKey = false;
                    floating = false;
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

    objects.forEach(function (object) {
        object.drawInfo.vertexArray = createBuffers(object);
        // End binding sequence
        gl.bindVertexArray(null);
    });

    objects.forEach(function (object) {
        gl.useProgram(object.drawInfo.programInfo);
        // Shaders for direct light for room and scenary
        materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
        lightPositionHandle = gl.getUniformLocation(program, 'lightPosition');
        lightColorHandleSpot = gl.getUniformLocation(program, 'lightColorSpot');

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
    requestAnimationFrame(drawScene);

    function drawScene() {

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

        //added
        // update WV matrix
        var cameraPosition = [cx, cy, cz];
        var target = [0.0, eyeHeight, 0.0];
        var up = [0.0, 1.0, 0.0];
        var cameraMatrix = utils.LookAt(cameraPosition, target, up);
        var viewMatrix = utils.invertMatrix(cameraMatrix);

        lz = lightRadius * Math.cos(utils.degToRad(-lightAngle)) * Math.cos(utils.degToRad(-lightElevation));
        lx = lightRadius * Math.sin(utils.degToRad(-lightAngle)) * Math.cos(utils.degToRad(-lightElevation));
        ly = lightRadius * Math.sin(utils.degToRad(-lightElevation));
        var directionalLight = [lz, ly, lx];

        // Update all world matrices in the scene graph
        objects[0].node.updateWorldMatrix();

        // Compute all the matrices for rendering
        objects.forEach(function(object) {

            gl.useProgram(object.drawInfo.programInfo);

            var eyePos = [cx, cy, cz];

            var worldViewMatrix = utils.multiplyMatrices(viewMatrix, object.node.worldMatrix);
            var projMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldViewMatrix));

            //Transform from World Space to Camera Space
            var lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix)); //direct
            directionalLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4((lightDirMatrix)), directionalLight);    //direct

            lightPosTransformed = utils.multiplyMatrixVector(viewMatrix, lightPos);    //point

            gl.uniformMatrix4fv(object.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projMatrix));
            gl.uniformMatrix4fv(object.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
            gl.uniformMatrix4fv(object.drawInfo.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(worldViewMatrix));
            // gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(worldViewMatrix));
            gl.uniform3fv(object.drawInfo.eyePositionHandle, eyePos);

            //gl.uniform3fv(lightPosLocation, lightPosTransformed.slice(0,3));    //point


            // Shaders for lights
            gl.uniform3fv(materialDiffColorHandle, [1.0, 1.0, 1.0]);

            gl.uniform3fv(lightColorHandleSpot, spotLightColorGeneral); //general spot
            gl.uniform3fv(lightPositionHandle, positionLight);  //general spot

            // gl.uniform3fv(lightColorHandleDir, directionalLightColor);  //direct
            // gl.uniform3fv(lightDirectionHandle, directionalLightTransformed);    //direct

            // gl.uniform3fv(lightColorHandlePoint, pointLightColor);    //point
            // gl.uniform1f(lightTargetLocation,  lightTarget);    //point
            // gl.uniform1f(lightDecayLocation,  lightDecay);    //point


            // gl.uniform3fv(ambientLightColorHandle, ambientLightColor);  //constant ambient




            // Render the Texture

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, object.drawInfo.textureRef[0]);
            gl.uniform1i(object.drawInfo.textLocation, 0);
            //------------------------------

            gl.bindVertexArray(object.drawInfo.vertexArray);

            gl.drawElements(gl.TRIANGLES, object.drawInfo.indices.length, gl.UNSIGNED_SHORT, 0);

        });

        //------------------------------------

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
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.canvas.width *= 0.75;
    gl.canvas.height *= 0.95;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //
    // Create shaders & program
    //
    // Program for room and scenary
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


    // Initialize lights
    //initiLight();

    main();
}

function start() {
    document.getElementById("directBox").checked="";
    document.getElementById("pointBox").checked="";
    document.getElementById("ambientBox").checked="";

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
    allowedMoves = document.getElementById('allowedMoves').value;
    maxLevel = document.getElementById('numberOfDiscs').value;
    objects = [];
    models = [];
    modelsSerialized = [];


    init();
}

function setMinMoves(){
    maxLevel = document.getElementById('numberOfDiscs').value;
    let minMoves = 0;
    for(let i=1; i<=maxLevel; i++){
        minMoves = 2*minMoves + 1;
    }
    document.getElementById('allowedMoves').value = minMoves;
}

window.onload = init;

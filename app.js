var gl;
var baseDir;
var shaderDir;
var program;

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
    mouseState = true;
}
function doMouseUp(event) {
    lastMouseX = -100;
    lastMouseY = -100;
    mouseState = false;
}
function doMouseMove(event) {
    if(mouseState) {
        var dx = event.pageX - lastMouseX;
        var dy = lastMouseY - event.pageY;
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;

        if((dx != 0) || (dy != 0)) {
            angle = angle + 0.5 * dx;
            elevation = elevation + 0.5 * dy;
        }
    }
}
function doMouseWheel(event) {
    var nLookRadius = lookRadius + event.wheelDelta/1000.0;
    if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
        lookRadius = nLookRadius;
    }
}

function computeModelData(object) {
    object.drawInfo.vertices = models[object.drawInfo.name].vertices;
    object.drawInfo.indices = models[object.drawInfo.name].indices;
    object.drawInfo.normals = models[object.drawInfo.name].vertexNormals;
    object.drawInfo.texCoord = models[object.drawInfo.name].textures;
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
    for(let i=0; i<modelsSerialized.length; i++){
        if(i==0){
            models[baseName] = new OBJ.Mesh(modelsSerialized[0]);
        } else {
            models[i.toString()] = new OBJ.Mesh(modelsSerialized[i]);
        }
    }
}

var main = function (){

    var positionLight = [-100.0, 900.0, -100.0];
    var pointLightColor = [1.0, 1.0, 0.98];

    computeSceneGraph();

    window.addEventListener("mousedown", doMouseDown, false);
    window.addEventListener("mouseup", doMouseUp, false);
    window.addEventListener("mousemove", doMouseMove, false);
    window.addEventListener("mousewheel", doMouseWheel, false);

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

    objects.forEach(function(object) {

        computeModelData(object);
    });

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
        lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    });

    //
    // Main render loop
    //
    requestAnimationFrame(drawScene);

    function drawScene() {

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
        cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
        cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
        cy = lookRadius * Math.sin(utils.degToRad(-elevation));
        var directionalLight = [cz, cy, cx];
        viewMatrix = utils.MakeView(cx, cy, cz, -elevation, -angle);


        var directionalLightColor = [0.1, 1.0, 1.0];

        var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
        var lightColorHandle = gl.getUniformLocation(program, 'lightColor');

        // Update all world matrices in the scene graph
        cameraPositionNode.updateWorldMatrix();

        /*
        // Save interactable objects positions [x, y, z, r]
        var count = 0;
        objects.forEach(function(object){
            if (object.drawInfo.name.includes('boat')) {
                interactableObjects[count] = [[object.node.worldMatrix[3], object.node.worldMatrix[7], object.node.worldMatrix[11]], 500];
                count++;
            }
        });

         */

        // Compute all the matrices for rendering
        objects.forEach(function(object) {

            gl.useProgram(object.drawInfo.programInfo);

            var eyePos = [cx, cy, cz];

            var worldViewMatrix = utils.multiplyMatrices(viewMatrix, object.node.worldMatrix);
            var projMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldViewMatrix));

            //Transform from World Space to Camera Space
            var lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));
            var directionalLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4((lightDirMatrix)), directionalLight);

            gl.uniformMatrix4fv(object.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projMatrix));
            gl.uniformMatrix4fv(object.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
            gl.uniformMatrix4fv(object.drawInfo.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(worldViewMatrix));
            gl.uniform3fv(object.drawInfo.eyePositionHandle, eyePos);


            // Shaders for point light for room and scenary
            gl.uniform3fv(materialDiffColorHandle, [1.0, 1.0, 1.0]);
            gl.uniform3fv(lightColorHandle, directionalLightColor);
            gl.uniform3fv(lightDirectionHandle, directionalLightTransformed);


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

window.onload = init;

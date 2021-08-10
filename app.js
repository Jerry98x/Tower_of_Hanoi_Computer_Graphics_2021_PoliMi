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
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
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

async function serializeModel(object) {
    modelsSerialized[object.drawInfo.name] = await utils.get_objstr(object.drawInfo.modelSrc);
}

function getModel(object) {
    models[object.drawInfo.name] = new OBJ.Mesh(modelsSerialized[object.drawInfo.name]);
}

var main = function (){

    var positionLight = [-100.0, 900.0, -100.0];
    var pointLightColor = [1.0, 1.0, 0.98];

    computeSceneGraph();

    objects.forEach(function (object) {
        console.log(object);
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
        perspectiveMatrix = utils.MakePerspective(60.0, aspect, 1, 5000.0);

        //added
        // update WV matrix
        cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
        cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
        cy = lookRadius * Math.sin(utils.degToRad(-elevation));
        viewMatrix = utils.MakeView(cx, cy, cz, -elevation, -angle);


        // Update all world matrices in the scene graph
        cameraPositionNode.updateWorldMatrix();

        /*
        // Save interactable objects positions [x, y, z, r]
        var count = 0;
        objects.forEach(function(object){
            if (object.drawInfo.name.includes('boat')) {
                interactableObjects[count] = [[object.worldMatrix[3], object.worldMatrix[7], object.worldMatrix[11]], 500];
                count++;
            }
        });

         */

        // Compute all the matrices for rendering
        objects.forEach(function(object) {

            gl.useProgram(object.drawInfo.programInfo);

            var eyePos = [cx, cy, cz];

            var projMatrix = utils.multiplyMatrices(viewMatrix, object.worldMatrix);
            projMatrix = utils.multiplyMatrices(perspectiveMatrix, projMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(object.worldMatrix));
            gl.uniformMatrix4fv(object.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projMatrix));
            gl.uniformMatrix4fv(object.drawInfo.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
            gl.uniformMatrix4fv(object.drawInfo.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(object.worldMatrix));
            gl.uniform3fv(object.drawInfo.eyePositionHandle, eyePos);


            // Shaders for point light for room and scenary
            gl.uniform3fv(materialDiffColorHandle, [1.0, 1.0, 1.0]);
            gl.uniform3fv(lightColorHandle, pointLightColor);
            gl.uniform3fv(lightPositionHandle, positionLight);


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
    objects.forEach(serializeModel);
    objects.forEach(getModel);

    // Initialize lights
    //initiLight();

    main();
}

window.onload = init;

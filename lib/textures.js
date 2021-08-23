function loadTextures() {
    new Promise((resolve) => {
        var hanoiTextureImage = new Image();
        hanoiTextureImage.src = baseDir + baseTextureSrc;
        hanoiTextureImage.onload = function () {

            var hanoiTexture = gl.createTexture();
            //gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, hanoiTexture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hanoiTextureImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);

            objects[0].drawInfo.textureRef.push(hanoiTexture);
            resolve();
        };
    }).then(() => {
        return new Promise((resolve) => {
            var disc1TextureImage = new Image();
            disc1TextureImage.src = baseDir + baseTextureSrc;
            disc1TextureImage.onload = function () {
    
                var disc1Texture = gl.createTexture();
                //gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, disc1Texture);
    
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, disc1TextureImage);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
    
                objects[1].drawInfo.textureRef.push(disc1Texture);
                objects[2].drawInfo.textureRef.push(disc1Texture);
                objects[3].drawInfo.textureRef.push(disc1Texture);
                objects[4].drawInfo.textureRef.push(disc1Texture);
                objects[5].drawInfo.textureRef.push(disc1Texture);
                objects[6].drawInfo.textureRef.push(disc1Texture);
                objects[7].drawInfo.textureRef.push(disc1Texture);
                resolve();
            };
        });
    }).then(() => {
        gl.bindTexture(gl.TEXTURE_2D, null);
    });
}
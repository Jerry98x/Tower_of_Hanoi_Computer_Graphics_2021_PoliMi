function loadTextures() {
    new Promise((resolve) => {
        var hanoiTextureImage = new Image();
        hanoiTextureImage.src = baseDir + baseTextureSrc;
        hanoiTextureImage.onload = function () {

            var hanoiTexture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
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
            var discTextureImage = new Image();
            discTextureImage.src = baseDir + baseTextureSrc;
            discTextureImage.onload = function () {
    
                var discTexture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, discTexture);
    
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, discTextureImage);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);

                for(let i=minLevel; i<=maxLevel; i++) {
                    objects[i].drawInfo.textureRef.push(discTexture);
                }
                resolve();
            };
        });
    }).then(() => {
        gl.bindTexture(gl.TEXTURE_2D, null);
    });
}

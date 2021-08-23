function loadTextures() {
    new Promise((resolve) => {
        var hanoiTextureImage = new Image();
        hanoiTextureImage.src = baseTextureSrc;
        hanoiTextureImage.onload = function () {

            var hanoiTexture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, hanoiTexture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hanoiTextureImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);

            basePositionNode.drawInfo.textureRef.push(hanoiTexture);
            resolve();
        };
    }).then(() => {
        gl.bindTexture(gl.TEXTURE_2D, null);
    });
}
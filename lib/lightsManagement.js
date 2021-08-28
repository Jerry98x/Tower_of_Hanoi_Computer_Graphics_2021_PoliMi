function checkboxChanged(checkboxElement) {
    if(checkboxElement.checked) {
        addLightToScene(checkboxElement);
    }
    else {
        removeLightFromScene(checkboxElement);
    }
}


function addLightToScene(checkboxElement) {
    objects.forEach(function() {
        switch(checkboxElement.id) {
            case "directBox":
                gl.uniform3fv(lightColorHandleDir, directionalLightColor);
                gl.uniform3fv(lightDirectionHandle, directionalLightTransformed);
                break;
            case "pointBox":
                gl.uniform3fv(lightColorHandlePoint, pointLightColor);
                gl.uniform3fv(lightPosLocation, lightPosTransformed.slice(0,3));
                gl.uniform1f(lightTargetLocation, lightTarget);
                gl.uniform1f(lightDecayLocation, lightDecay)
                break;
            case "ambientBox":
                gl.uniform3fv(ambientLightColorHandle, ambientLightColor);
                break;
            default:
                break;
        }
    });
}


function removeLightFromScene(checkboxElement) {
    objects.forEach(function() {
        switch(checkboxElement.id) {
            case "directBox":
                gl.uniform3fv(lightColorHandleDir, [0.0, 0.0, 0.0]);
                gl.uniform3fv(lightDirectionHandle, [0.0, 0.0, 0.0]);
                break;
            case "pointBox":
                gl.uniform3fv(lightColorHandlePoint, [0.0, 0.0, 0.0]);
                gl.uniform3fv(lightPosLocation, [0.0, 0.0, 0.0]);
                gl.uniform1f(lightTargetLocation, 0);
                gl.uniform1f(lightDecayLocation, 0)
                break;
            case "ambientBox":
                gl.uniform3fv(ambientLightColorHandle, [0.0, 0.0, 0.0]);
                break;
            default:
                break;
        }
    });
}
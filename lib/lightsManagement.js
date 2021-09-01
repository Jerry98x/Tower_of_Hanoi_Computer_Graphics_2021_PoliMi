/**
 * Checks if the checkbox HTML element is checked and call the right function to add or remove customization of lights.
 * @param {*} checkboxElement 
 */
function checkboxChanged(checkboxElement) {
    if(checkboxElement.checked) {
        addLightCustomization(checkboxElement);
    }
    else {
        removeLightCustomization(checkboxElement);
    }
}


/**
 * Dynamically adds the HTML sections to customize lights.
 * @param {*} checkboxElement 
 */
function addLightCustomization(checkboxElement) {
    
    switch(checkboxElement.id) {
        case "directBox":
            var directionalCustom = document.getElementById("directional_custom");

            directionalCustom.innerHTML += dCustom;

            document.getElementById("theta_rot_dir").value = dirLightTheta;
            document.getElementById("phi_rot_dir").value = dirLightPhi;

            break;
        case "pointBox":
            var pointCustom = document.getElementById("point_custom");

            pointCustom.innerHTML += pCustom;

            document.getElementById("x_tras_point").value = lightPos[0];
            document.getElementById("y_tras_point").value = lightPos[1];
            document.getElementById("z_tras_point").value = lightPos[2];
            document.getElementById("decay").value = lightDecay;
            document.getElementById("targ_dist").value = lightTarget;

            break;
        case "ambientBox":
            break;
        default:
            break;
    }
}

/**
 * Dynamically removes the HTML sections to customize lights.
 * @param {*} checkboxElement 
 */
function removeLightCustomization(checkboxElement) {

    switch(checkboxElement.id) {
        case "directBox":
            document.getElementById("directional_custom").innerHTML = '';
            break;
        case "pointBox":
            document.getElementById("point_custom").innerHTML = '';
            break;
        case "ambientBox":
            break;
        default:
            break;
    }
}

/**
 * Changes the directional light parameters and makes it visible in the world.
 * @param {*} slider 
 */
function dynamicDirectLightChange(slider) {

    switch(slider.id) {
        case "theta_rot_dir":
            dirLightTheta = slider.value;
            break;
        case "phi_rot_dir":
            dirLightPhi = slider.value;
            break;
        default:
            break;
    }

    objects.forEach(function() {
        gl.uniform3fv(lightColorHandleDir, directionalLightColor);
        gl.uniform3fv(lightDirectionHandle, directionalLightTransformed);
    });
    
}

/**
 * Changes the point light parameters and makes it visible in the world.
 * @param {*} slider 
 */
function dynamicPointLightChange(slider) {

        switch(slider.id) {
            case "x_tras_point":
                lightPos[0] = slider.value;
                break;
            case "y_tras_point":
                lightPos[1] = slider.value;
                break;
            case "z_tras_point":
                lightPos[2] = slider.value;
                break;
            case "decay":
                lightDecay = slider.value;
                break;
            case "targ_dist":
                lightTarget = slider.value;
                break;
            default:
                break;
        
        }
        
        objects.forEach(function() {
            gl.uniform3fv(lightColorHandlePoint, pointLightColor);
            gl.uniform3fv(lightPosLocation, lightPosTransformed.slice(0,3));
            gl.uniform1f(lightTargetLocation, lightTarget);
            gl.uniform1f(lightDecayLocation, lightDecay);
        });

}

/**
 * Dynamically resets all the lights to the initial state and removes the customization HTML.
 * @param {*} checkboxElement 
 */
function resetLightCustomization() {

    let dBox = document.getElementById("directBox");
    let pBox = document.getElementById("pointBox");
    let aBox = document.getElementById("ambientBox");
    
    if(!dBox.checked) {
        addLightCustomization(dBox);
    }
    if(!pBox.checked) {
        addLightCustomization(pBox);
    }
    if(!aBox.checked) {
        addLightCustomization(aBox);
    }


    document.getElementById("theta_rot_dir").value = initialDirLightTheta;
    document.getElementById("phi_rot_dir").value = initialDirLightPhi;
    document.getElementById("x_tras_point").value = initialLightPos[0];
    document.getElementById("y_tras_point").value = initialLightPos[1];
    document.getElementById("z_tras_point").value = initialLightPos[2];
    document.getElementById("decay").value = initialLightDecay;
    document.getElementById("targ_dist").value = initialLightTarget;


    dirLightTheta = document.getElementById("theta_rot_dir").value;
    dirLightPhi = document.getElementById("phi_rot_dir").value;
    lightPos[0] = document.getElementById("x_tras_point").value;
    lightPos[1] = document.getElementById("y_tras_point").value;
    lightPos[2] = document.getElementById("z_tras_point").value;
    lightDecay = document.getElementById("decay").value;
    lightTarget = document.getElementById("targ_dist").value;


    removeLightCustomization(dBox);
    dBox.checked = "";
    removeLightCustomization(pBox);
    pBox.checked = "";
    removeLightCustomization(aBox);
    aBox.checked = "";

}

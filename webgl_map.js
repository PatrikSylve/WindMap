
// init function to be run in map webgl-layer. It should be supplied with GLSL-shaders and the map-object and gl-obj
function init(map, gl, fsSource, vsSource) {
    var program = createShaderProgram(gl, fsSource, vsSource); 
    
}


// create shader programs 
function createShaderProgram(gl, fsSource, vsSource){
    var vs = gl.createShader(gl.VERTEX_SHADER); 
    var fs = gl.createShader(gl.FRAGMENT_SHADER); 
    var program; 

    gl.shaderSource(vs, vsSource); 
    gl.shaderSource(fs, fsSource); 

    gl.compileShader(vs);
    gl.compileShader(fs); 

    if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.log("Error compiling fragment shader: " + getShaderInfoLog(fs));
    }
    if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.log("Error compiling vertex shader: " + getShaderInfoLog(fs));
    }

    program = gl.createProgram(); 
    gl.attachShader(program, fs); 
    gl.attachShader(program, vs); 
    gl.linkProgram(program); 
    return program; 
}





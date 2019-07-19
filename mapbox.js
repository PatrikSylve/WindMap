
var imgCoord = new Image();
//img.src="coordRandom.png";
imgCoord.src="textures/coordRandom.png";
var imgCoord2 = new Image();
//img.src="coordRandom.png";
imgCoord2.src="textures/coordRandom.png";
var imgWind = new Image();
imgWind.src = "textures/windRandom.png"; 
imgCoord.onload = function () {
  imgWind.onload = function() {
  initMap([imgCoord,imgWind, imgCoord2])
  }
}

function initMap(textures){

  // create bounding box covering Sweden 
  var bbox = new mapboxgl.LngLatBounds( 
      new mapboxgl.LngLat(-17.9397, 53.8002),
      new mapboxgl.LngLat(47.9876, 70.7661),
  );
    
    mapboxgl.accessToken = 'pk.eyJ1IjoicGF0YWxhdGEiLCJhIjoiY2p3dDMzY2gyMDFiZjQ4cXNsaHhuYjlqbCJ9.7uoXoKVJazB2MhNLxvaJjQ';
    var map = new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/mapbox/streets-v11', 
        center: [18, 60], // center position [lng, lat]
        zoom: 2
    });

    // set darkmode style
    map.setStyle('mapbox://styles/mapbox/dark-v10');
    // set maximum bounding box to only cover sweden 
    //map.setMaxBounds(bbox); 
  
    map.on('load', function() {
      // add custom layer from class PointLayer
        map.addLayer(new PointLayer(textures));
    });
   

}


// convert coordinates to MercatorCoordinates (EPSG:3857 converted in range 0-1)
function convertCoordinates(long, lati) {
  return mapboxgl.MercatorCoordinate.fromLngLat({ lng: long, lat:lati });
}


// class for webgl point layer
class PointLayer {
  constructor(textures) {
      this.id = 'point-layer';
      this.type = 'custom';
      this.renderingMode = '2d';
      this.textures = textures;  
      this.particleRes = 512;
  }

  onAdd(map, gl) {

      const vertexSource = `
      precision mediump float;

      attribute float a_index;

      uniform sampler2D u_particles;
      uniform sampler2D u_wind;   
      uniform float u_particles_res;
      uniform mat4 u_matrix;

      const float BASE = 255.0;
      const float OFFSET = BASE * BASE / 2.0;
      const float PI = 3.1415926535897932384626433832795;
      const float scale = 18.0;

      varying vec4 v_color; 

      float decode(vec2 channels) {
        return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
      }

      vec2 encode(float value) {
      value = value * 18.0 + OFFSET;
      float x = mod(value, BASE);
      float y = floor(value / BASE);
      return vec2(x, y) / BASE;
      }


      vec2 project(vec2 coordinates){
        float x = (coordinates.x+180.0)/360.0;
        float y = (180.0 - (180.0 / PI * log(tan(PI / 4.0 + coordinates.y * PI / 360.0)))) / 360.0;
        return vec2(x,y); 
      }

      void main() {
        vec4 color = texture2D(u_particles, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));

      // pass wind data to fragment
      vec4 w_tex =  texture2D(u_wind, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));
      v_color = w_tex;

      // get velocity 
      vec2 velocity = vec2(v_color.xy/255.0);
    
        
       // decode coordtexture pixels
        float decoded_x = decode(color.xy); 
        float decoded_y = decode(color.zw); 

      

        //convert coordinates to mercator range [0-1]
        vec2 projected_pos = project(vec2(decoded_x,decoded_y));

        gl_PointSize = 2.0;
        gl_Position = u_matrix*vec4(projected_pos+velocity, 0, 1);
    }`;

    const fragmentSource = `
    precision mediump float;
    
    varying vec4 v_color;

    void main() { 
      gl_FragColor = v_color;
    }`;

    var quadVert = `
    precision mediump float;

    attribute vec2 a_pos;

    varying vec2 v_tex_pos;

    void main() {
      v_tex_pos = a_pos;
      gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);
    }
`;
var quadFrag = 
`
  precision mediump float;

  uniform sampler2D u_particles;

  varying vec2 v_tex_pos; 

  const float BASE = 255.0;
  const float OFFSET = BASE * BASE / 2.0;
  const float scale = 18.0;
  const float speed = 0.0001; 

  float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
  }

  vec2 encode(float value) {
    value = value * 18.0 + OFFSET;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
  }

  void main() {
    vec4 color = texture2D(u_particles, v_tex_pos);

    float decoded_x = decode(color.xy) + 1.0*speed; 
    float decoded_y = decode(color.zw) + 1.0*speed; 

    vec2 encoded_x = encode(decoded_x); 
    vec2 encoded_y = encode(decoded_y); 
    gl_FragColor = vec4(encoded_x, encoded_y);
  }
`;

      var indexCoord = []; 
      for (var i = 0; i < 512*512; i++){
        indexCoord[i] = i; 
      }

      // init shaders 
      this.program = initShaders(gl, vertexSource, fragmentSource); 
      this.quadProgram = initShaders(gl, quadVert, quadFrag); 
      this.aPos = gl.getAttribLocation(this.program, "a_index");

      this.buffer = createBuffer(gl, new Float32Array(indexCoord));
      this.quadBuffer = createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])); 

      this.textures = genTexture(gl, this.textures);
      this.stateTexture = this.textures[2];
      this.tempT = createStateTexture(gl, 512,512); 

      // Create and bind the framebuffer
      this.fb = gl.createFramebuffer();
     
  }

  render(gl, matrix) {
    setTimeout(() => {
      this.renderScreen(gl, matrix);
    }, 1000);

  }

  renderScreen(gl, matrix){
      // render to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.useProgram(this.program);
      var u_image0Location = gl.getUniformLocation(this.program, "u_particles");
      var u_image1Location = gl.getUniformLocation(this.program, "u_wind");

      gl.uniform1i(u_image0Location, 1);  
      gl.uniform1i(u_image1Location, 2);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.enableVertexAttribArray(this.aPos);
      gl.vertexAttribPointer(this.aPos, 1, gl.FLOAT, false, 0, 0);
      gl.useProgram(this.program);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_particles_res"), this.particleRes);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_velocity"), this.velocity);

      gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
      gl.drawArrays(gl.POINTS, 0, 512*512); // nbr of points
      setTimeout(() => {
        this.updateTexture(gl, matrix);
      }, 1000);
  }

  updateTexture(gl, matrix) {
   //gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
  //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.stateTexture, 0);
    bindFramebuffer(gl, this.fb, this.stateTexture); 
    gl.viewport(0, 0, 512, 512);

    gl.useProgram(this.quadProgram); 
    var u_image0Location = gl.getUniformLocation(this.quadProgram, "u_particles");
    //var u_image1Location = gl.getUniformLocation(this.program, "u_wind");

    gl.uniform1i(u_image0Location, 0);  
    //gl.uniform1i(u_image1Location, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // bind texture to temp text to avoid conflict while drawing
    /*
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tempT, 0);
*/
/*
    var tmp = this.textures[0]; 
    this.textures[0] = this.stateTexture; 
    this.stateTexture = tmp;
*/
var tmp = this.stateTexture; 
    this.stateTexture = this.textures[0]; 
    this.textures[0] = tmp;

    setTimeout(() => {
      this.renderScreen(gl, matrix);
    }, 1000);

  }
}



function genTexture(gl, image){
  var textures = []
  for (var i = 0; i < 3; i++) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[i]);
    textures.push(texture); 
  }
  return textures; 
}

function initShaders(gl, vertexSource, fragmentSource){
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program; 
}

 
function bindFramebuffer(gl, framebuffer, texture) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  if (texture) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }
}

function createBuffer(gl, data){
  var buffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer; 
}

function createStateTexture(gl, width, height){
  const targetTextureWidth = width;
  const targetTextureHeight = height;
  var targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
   
  
  
    const data = new Uint8Array(512 * 512 * 4);
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  gl.bindTexture(gl.TEXTURE_2D, null);

  return targetTexture; 
}

/*
class Particles {
  constructor(numParticles, gl){
    this.numParticles =  numParticles; 
    this.gl = gl;
  }
}

*/



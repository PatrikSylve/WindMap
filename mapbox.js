
 // Load textures and init map
 mapboxgl.accessToken = 'pk.eyJ1IjoicGF0YWxhdGEiLCJhIjoiY2p3dDMzY2gyMDFiZjQ4cXNsaHhuYjlqbCJ9.7uoXoKVJazB2MhNLxvaJjQ';

 var map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/dark-v10', 
    center: [18, 60], // center position [lng, lat]
    zoom: 2
});

var windlayer = null; 

 var imgCoord = new Image();
 imgCoord.src="textures/acoordRandom.png";
 var imgCoord2 = new Image();
 imgCoord2.src="textures/acoordRandom.png";
 var imgWind = new Image();
 imgWind.src = "textures/windtexture.png"; 
 imgCoord.onload = function () {
   imgWind.onload = function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicGF0YWxhdGEiLCJhIjoiY2p3dDMzY2gyMDFiZjQ4cXNsaHhuYjlqbCJ9.7uoXoKVJazB2MhNLxvaJjQ';

     map.on('load', function() { 
         windlayer = new PointLayer([imgCoord,imgWind, imgCoord2], map);
         map.addLayer(windlayer);
         
     });
   }
 }
 

 function setParticleSpeed() {
    let speed = document.getElementById("particlespeed").value; 
    speed = speed * 0.0000001;
    windlayer.paricleSpeed = speed; 
}

function setDropFreq() {
    windlayer.dropFreq = document.getElementById("dropfreq").value*0.0001; 
}

function setParticleSize() {
    windlayer.particleSize = document.getElementById("particlesize").value; 
}

function setParticle() {
    windlayer.particleRes =   document.getElementById("particlenbr").value; 
    windlayer.updateParticleNbr = 1; 
    document.getElementById("number").innerHTML = windlayer.particleRes*windlayer.particleRes;
}



// Wind layer object 

class PointLayer {
    constructor(textures, map) {
        this.id = 'point-layer';
        this.type = 'custom';
        this.renderingMode = '2d';
        this.textures = textures;  

        // initial particle-values
        this.particleRes = 512;
        this.map = map; 
        this.particleNbr = this.particleRes*this.particleRes; 
        this.paricleSpeed = 0.0001; 
        this.particleSize = 1.0;
        this.updateParticleNbr = 0; 
        this.dropFreq = 0.001; 
        // temp wind max and min
        this.xmin = -19.38;
        this.xmax=  25.56;
        this.ymin =  -21.19;
        this.ymax = 22.77;
        this.updateParticleNbr = 1; 
    }

    onAdd(map,gl) {

        const drawVert = `
        precision mediump float;
  
        attribute float a_index;
  
        uniform sampler2D u_particles;
        uniform sampler2D u_wind;   
        uniform float u_particles_res;
        uniform float u_velocity; 
        uniform mat4 u_matrix;
        uniform float u_particle_size; 
  
  
        const float BASE = 255.0;
        const float OFFSET = BASE * BASE / 2.0;
        const float PI = 3.1415926535897932384626433832795;
        const float scale = 18.0;
  
        varying vec4 v_color; 
        varying vec2 v_pos; 
  
        float decode(vec2 channels) {
          return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
        }
  
        vec2 encode(float value) {
            value = value * 18.0 + OFFSET;
            float x = mod(value, BASE);
            float y = floor(value / BASE);
            return vec2(x, y) / BASE;
        }
  
        // Transform to coordinate to sweden
        vec2 toSweden(vec2 coord) {
          float minx = 0.50665222121;
          float miny= 0.3291;
          float maxx = 0.5792222222222222;
          float maxy = 0.2100937745177285;
          return vec2((maxx-minx) * (coord.x-1.0)+maxx, (maxy-miny)*(coord.y-1.0)+maxy);
        }
  
        
  
        void main() {
          vec4 color = texture2D(u_particles, vec2(fract(a_index / u_particles_res),
                                  floor(a_index / u_particles_res) / u_particles_res));
  
          vec2 particle_pos = vec2(color.r / 255.0 + color.b, color.g / 255.0 + color.a);
  
          v_pos = particle_pos; 
  
          // pass wind data to fragment
          vec4 w_tex =  texture2D(u_wind, vec2(fract(a_index / u_particles_res),
                                  floor(a_index / u_particles_res) / u_particles_res));
          v_color = w_tex;
  
          // decode coordtexture pixels
          float decoded_x = decode(color.xy); 
          float decoded_y = decode(color.zw); 
  
          vec2 finalPos = toSweden(vec2(particle_pos.x, particle_pos.y));
  
          gl_PointSize = u_particle_size;
          gl_Position = u_matrix*vec4(finalPos.x,finalPos.y, 0.0,1.0); 
        }`;
  
      const drawFrag = `
      precision mediump float;
  
      uniform sampler2D u_wind;
      uniform vec2 u_wind_min;
      uniform vec2 u_wind_max;
      
      varying vec4 v_color;
      varying vec2 v_pos; 
      
  
      void main() { 
        vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, v_pos).rg);
        float speed_t = length(velocity) / length(u_wind_max);
  
        
        
        vec4 c1 = vec4(69.0/255.0, 117.0/255.0, 180.0/255.0, 1.0); 
        vec4 c2 = vec4(116.0/255.0, 173.0/255.0, 209.0/255.0, 1.0); 
        vec4 c3 = vec4(224.0/255.0, 243.0/255.0, 248.0/255.0, 1.0); 
        vec4 c4 = vec4(254.0/255.0, 224.0/255.0, 144.0/255.0, 1.0); 
        vec4 c5 = vec4(244.0/255.0, 109.0/255.0, 67.0/255.0, 1.0); 
        vec4 c6 = vec4(215.0/255.0, 48.0/255.0, 39.0/255.0, 1.0); 
       
        vec4 color = c1; 
       
        if (speed_t > 0.1) {
          color = c2; 
       }
        if (speed_t > 0.2) {
          color = c3; 
       }
        if (speed_t > 0.3) {
          color = c4; 
       }
  
        if (speed_t > 0.4) {
          color = c5; 
       }
        if (speed_t > 0.5) {
           color = c6; 
        }

        gl_FragColor = color; 
      }`;
  
      var updateVert = `
      precision mediump float;
  
      attribute vec2 a_pos;
  
      varying vec2 v_tex_pos;
  
      void main() {
        v_tex_pos = a_pos;
        gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);
      }
  `;
  var updateFrag = 
  `
    precision mediump float;
  
    uniform sampler2D u_particles;
    uniform sampler2D u_wind;
  
    uniform vec2 u_wind_res;
    uniform vec2 u_wind_min;
    uniform vec2 u_wind_max;
    uniform vec2 u_random; 
    uniform float u_speed; 
    uniform float u_drop_frequency; 
  
  
    varying vec2 v_tex_pos; 
  
    const float BASE = 255.0;
    const float OFFSET = BASE * BASE / 2.0;
    const float scale = 18.0;
    const float speed = 0.01; 
  
  
    vec2 lookup_wind(const vec2 uv) {
     
      vec2 px = 1.0 / u_wind_res;
  
      //interpolate wind speeds
      vec2 p_uleft = vec2(-1.0, 1.0) / u_wind_res;
      vec2 p_dleft = vec2(-1.0, -1.0) / u_wind_res;
      vec2 p_uright = vec2(1.0, 1.0) / u_wind_res;
      vec2 p_dright = vec2(1.0, 1.0) / u_wind_res;
  
      vec2 vertex_coord = floor(uv* u_wind_res) * px;
  
      vec2 uleft = texture2D(u_wind, vertex_coord ).rg;
      vec2 uright = texture2D(u_wind, vertex_coord + p_uright).rg;
      vec2 dleft = texture2D(u_wind, vertex_coord + p_dleft).rg;
      vec2 dright = texture2D(u_wind, vertex_coord + p_dright).rg;
  
      vec2 f = fract(uv * u_wind_res);
  
     return mix(mix(uleft, uright, f.x), mix(dleft, dright, f.x), f.y);
  
  } 
    
  
    float decode(vec2 channels) {
      return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
    }
  
    vec2 encode(float value) {
      value = value * 18.0 + OFFSET;
      float x = mod(value, BASE);
      float y = floor(value / BASE);
      return vec2(x, y) / BASE;
    }
  
    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }
  
    vec2 newPos() {
      float minx = 0.497777777777778;
      float maxy= 0.33;
      float maxx = 0.6072222222222222;
      float miny = 0.2205937745177285;
      return vec2((maxx-minx) * (rand(u_random)-1.0)+maxx, (maxy-miny)*(rand(u_random)-1.0)+maxy);
    }
  
  
    void main() {
        vec4 color = texture2D(u_particles, v_tex_pos);
        vec4 wind = texture2D(u_wind, v_tex_pos);

        // decode particle position from pixel RGBA
        vec2 pos = vec2(color.r / 255.0 + color.b,
                    color.g / 255.0 + color.a); 
  
        vec2 velocity = mix(u_wind_min, u_wind_max, lookup_wind(pos));
        float speed_t = length(velocity) / length(u_wind_max);
    
        float distortion = cos(radians(pos.y * 180.0 - 90.0));
        vec2 offset = vec2(velocity.x ,-velocity.y) * u_speed;
        pos = fract(1.0 + pos + offset);
       
        //pos = fract(1.0 + pos + vec2(decode(wind.xy), decode(wind.zw))*0.0000000001);
        float decoded_x = decode(color.xy) + decode(wind.xy)*speed; 
        float decoded_y = decode(color.zw) + decode(wind.zw)*speed; 
  
        vec2 encoded_x = encode(decoded_x); 
        vec2 encoded_y = encode(decoded_y); 
  
        vec2 seed = (pos + v_tex_pos) * u_random;

        float drop_rate = u_drop_frequency + speed_t * 0.1;
        float drop = step(1.0 - drop_rate, rand(seed));
  
        vec2 random_pos = vec2(
          rand(seed + 1.3),
          rand(seed + 2.1));
        pos = mix(pos, random_pos, drop);

        gl_FragColor = vec4(fract(pos * 255.0), floor(pos * 255.0) / 255.0);
    }
  `;
  
    
        // init shaderprograms
        this.program = initShaders(gl, drawVert, drawFrag); 
        this.updateProgram = initShaders(gl, updateVert, updateFrag); 

        // create buffer to hold sqare primitive to draw updated texture
        this.updateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.updateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);

        // create data textures
        this.textures = genTexture(gl, this.textures);
        this.stateTexture =  this.textures[2];
  
        // Create framebuffer
        this.fb = gl.createFramebuffer();
        // generate particles 
        this.setParticles(gl, this.particleRes);
       
    }
  
    render(gl, matrix) {   
      // if user changes particle nbr 
      if (this.updateParticleNbr) {
        this.setParticles(gl, this.particleRes);
        this.updateParticleNbr = 0; 
      }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);

        // render to screen
        this.renderScreen(gl,matrix);

        // render to texture 
        this.updateTexture(gl, matrix);
      
        this.map.triggerRepaint();
        this.gl = gl; 
    }
  
    renderScreen(gl,matrix){
    
        // render to screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  
        gl.useProgram(this.program);
        var u_image0Location = gl.getUniformLocation(this.program, "u_particles");
        var u_image1Location = gl.getUniformLocation(this.program, "u_wind");
        var u_particle_size = gl.getUniformLocation(this.program, "u_particle_size");
        var u_wind_min = gl.getUniformLocation(this.program, "u_wind_min");
        var u_wind_max = gl.getUniformLocation(this.program, "u_wind_max");
        var u_particles_res = gl.getUniformLocation(this.program, "u_particles_res");
  
        var a_index = gl.getAttribLocation(this.program, "a_index");

        gl.uniform1i(u_image0Location, 0);  
        gl.uniform1i(u_image1Location, 1);
        gl.uniform1f(u_particle_size, this.particleSize);
        gl.uniform2f(u_wind_min, this.xmin, this.ymin);
        gl.uniform2f(u_wind_max, this.xmax, this.ymax);
  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(a_index);
        gl.vertexAttribPointer(a_index, 1, gl.FLOAT, false, 0, 0);
        gl.uniform1f(u_particles_res, this.particleRes);
    
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
        gl.drawArrays(gl.POINTS, 0, this.particleNbr); // nbr of points
        gl.disable(gl.BLEND);   
         
    }
  
    updateTexture(gl, matrix) {
        
        bindFramebuffer(gl, this.fb, this.stateTexture); 

        // set viewport to math nbr particles
        gl.viewport(0, 0, this.particleRes,this.particleRes);
    
        gl.useProgram(this.updateProgram); 
        var u_image0Location = gl.getUniformLocation(this.updateProgram, "u_particles");
        var u_image1Location = gl.getUniformLocation(this.updateProgram, "u_wind");
        var u_wind_res = gl.getUniformLocation(this.updateProgram, "u_wind_res");
        var u_wind_min = gl.getUniformLocation(this.updateProgram, "u_wind_min");
        var u_wind_max = gl.getUniformLocation(this.updateProgram, "u_wind_max");
        var u_random = gl.getUniformLocation(this.updateProgram, "u_random");
        var u_speed = gl.getUniformLocation(this.updateProgram, "u_speed");
        var u_drop_frequency = gl.getUniformLocation(this.updateProgram, "u_drop_frequency");
    
    
        gl.uniform1i(u_image0Location, 0);  
        gl.uniform1i(u_image1Location, 1);
    
        //wind texture res
        //gl.uniform2f(u_wind_res, 180,271);
        gl.uniform2f(u_wind_res, 612,752);

        gl.uniform2f(u_wind_min, this.xmin, this.ymin);
        gl.uniform2f(u_wind_max, this.xmax, this.ymax);
        gl.uniform2f(u_random, Math.random(),Math.random());
        gl.uniform1f(u_speed, this.paricleSpeed);
        gl.uniform1f(u_drop_frequency, this.dropFreq);
    
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.updateBuffer);
        var a_quad_pos = gl.getAttribLocation(this.updateProgram, "a_pos");
        gl.enableVertexAttribArray(a_quad_pos);
        gl.vertexAttribPointer(a_quad_pos, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    
        // swap textures
        var tmp = this.stateTexture; 
        this.stateTexture = this.textures[0]; 
        this.textures[0] = tmp; 
        this.gl = gl;     
    }
    
    setParticles(gl, nbr) {
        this.particleRes = nbr;
        this.particleNbr = nbr* nbr //particleRes * particleRes;
        const particleState = new Uint8Array(this.particleNbr * 4);

        for (let i = 0; i < particleState.length; i++) {
            particleState[i] = Math.floor(Math.random() * 256); // randomize the initial particle positions
        }

        this.textures[0] = createTexture(gl, gl.NEAREST, particleState, this.particleRes, this.particleRes);
        this.stateTexture = createTexture(gl, gl.NEAREST, particleState, this.particleRes, this.particleRes);
    
        const particleIndices = new Float32Array(this.particleNbr);
        for (let i = 0; i < this.particleNbr; i++) {
            particleIndices[i] = i;
        }
        this.buffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer); 
        gl.bufferData(gl.ARRAY_BUFFER, particleIndices, gl.STATIC_DRAW); 
        this.gl = gl; 
    }
}
  
  
function createTexture(gl, filter, data, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   
    gl.texParameteri(gl.TEXTURE_2D, gl.LINEAR, filter);
    if (data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
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
  
function initShaders(gl, updateVert, updateFrag){
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, updateVert);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, updateFrag);
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
  
function createTexture(gl, filter, data, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    if (data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
  
function initShaders(gl, updateVert, updateFrag){
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, updateVert);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, updateFrag);
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
  
  
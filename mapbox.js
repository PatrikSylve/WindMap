
function initMap(img){

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
        map.addLayer(new PointLayer(img));
    });
}


// convert coordinates to MercatorCoordinates (EPSG:3857 converted in range 0-1)
function convertCoordinates(long, lati) {
  return mapboxgl.MercatorCoordinate.fromLngLat({ lng: long, lat:lati });
}


// class for webgl point layer
class PointLayer {
  constructor(image) {
      this.id = 'point-layer';
      this.type = 'custom';
      this.renderingMode = '2d';
      this.image = image; 
  }

  onAdd(map, gl) {

      const vertexSource = `
      precision mediump float;

      attribute float a_index;

      uniform sampler2D u_particles;
      uniform float u_particles_res;
      uniform mat4 u_matrix;

      //varying vec2 v_particle_pos;

      void main() {
        vec4 color = texture2D(u_particles, vec2(
            fract(a_index / u_particles_res),
            floor(a_index / u_particles_res) / u_particles_res));
    
        // decode current particle position from the pixel's RGBA value
        vec2 v_particle_pos = vec2(
            color.r/255.0 ,
            color.g/255.0 );
    
        gl_PointSize = 5.0;
        gl_Position = u_matrix*vec4(2.0*v_particle_pos.x -1.0, 1.0 - 2.0*v_particle_pos.y, 0, 1);
    }`;

      const fragmentSource = `
      precision mediump float;

      void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }`;

      var indexCoord = []; 
      for (var i = 0; i < 512*512; i++){
        indexCoord[i] = i; 
      }

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexSource);
      gl.compileShader(vertexShader);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(fragmentShader);

      this.program = gl.createProgram();
      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      gl.linkProgram(this.program);

      this.aPos = gl.getAttribLocation(this.program, "a_index");
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indexCoord), gl.STATIC_DRAW);

      /*
          // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
     
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
     
    // Asynchronously load an image
    var image2 = new Image();
    image2.src = "projectedCoord.png";
    image2.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      console.log("hj")
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image2);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    */

  }

  render(gl, matrix) {
      var particleRes = 512; 
      genTexture(gl, this.image);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.enableVertexAttribArray(this.aPos);
      gl.vertexAttribPointer(this.aPos, 1, gl.FLOAT, false, 0, 0);
      gl.useProgram(this.program);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_particles_res"), particleRes);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
      gl.drawArrays(gl.POINTS, 0, 512*512); // nbr of points
  }
}


function genTexture(gl, image2){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
 // var image2 = new Image();

 // image2.src = imageSrc;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  console.log("hj")
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap(gl.TEXTURE_2D);
}


// initialize 

var img = new Image();
img.src="coordinates512.png";
img.onload = function () {
  initMap(img)
}

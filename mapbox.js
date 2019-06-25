

var bbox = new mapboxgl.LngLatBounds( 
    new mapboxgl.LngLat(-17.9397, 55.8002),
    new mapboxgl.LngLat(47.9876, 68.7661),
    );
  
  mapboxgl.accessToken = 'pk.eyJ1IjoicGF0YWxhdGEiLCJhIjoiY2p3dDMzY2gyMDFiZjQ4cXNsaHhuYjlqbCJ9.7uoXoKVJazB2MhNLxvaJjQ';
  var map = new mapboxgl.Map({
      container: 'map', 
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [18, 60], // starting position [lng, lat]
      zoom: 2
  });
  

  
  // set darkmode
  map.setStyle('mapbox://styles/mapbox/dark-v10');
  // set maximum bounding box to only cover sweden 
  map.setMaxBounds(bbox); 

  var highlightLayer = {
    id: 'highlight',
    type: 'custom',
     
    onAdd: function (map, gl) {
    var vsSource = "" +
    "uniform mat4 u_matrix;" +
    "attribute vec2 a_pos;" +
    "void main() {" +
    "    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);" +
    "}";
     
    var fsSource = "" +
    "void main() {" +
    "    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);" +
    "}";

    this.program = createShaderProgram(gl, fsSource, vsSource);

    this.aPos = gl.getAttribLocation(this.program, "a_pos");
     
    var helsinki = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 25.004, lat: 60.239 });
    var berlin = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 13.403, lat: 52.562 });
    var kyiv = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 30.498, lat: 50.541 });
     
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    helsinki.x, helsinki.y,
    berlin.x, berlin.y,
    kyiv.x, kyiv.y,
    ]), gl.STATIC_DRAW); 
  },
  render: function (gl, matrix) {
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }
  };
  map.on('load', function() {
map.addLayer(highlightLayer, 'building');
});
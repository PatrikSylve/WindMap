
function initMap(data){
  /* 
    data[0]: wind speed
    data[1]: wind direction
    data[2]: coordinates 
  */
  var coordinates = data[2].coordinates; 

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
    map.setMaxBounds(bbox); 
  
    map.on('load', function() {
      // add custom layer from class PointLayer
        map.addLayer(new PointLayer(coordinateArray(coordinates)));
    });
}


// convert coordinates to MercatorCoordinates (EPSG:3857 converted in range 0-1)
function convertCoordinates(long, lati) {
  return mapboxgl.MercatorCoordinate.fromLngLat({ lng: long, lat:lati });
}

// take coordinates from coordinate pair array and create a new array with projected coordinates; 
function coordinateArray(coord) {
  var array = []; 
    for(var i = 0; i < coord.length; i++){
      let index = i*2; 
      let coordinates = convertCoordinates(coord[i][0], coord[i][1]); 
      array[index] = coordinates.x; 
      array[index + 1] = coordinates.y; 
    }
    return array; 
}


// class for webgl point layer
class PointLayer {
  constructor(coord) {
      this.id = 'point-layer';
      this.type = 'custom';
      this.renderingMode = '2d';
      this.coordArray = coord; 
  }

  onAdd(map, gl) {
      const vertexSource = `
      uniform mat4 u_matrix;
      attribute vec2 a_pos; 
      void main() {
          gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
          gl_PointSize = 0.1;
      }`;

      const fragmentSource = `
      void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 0.8);
      }`;

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

      this.aPos = gl.getAttribLocation(this.program, "a_pos");
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coordArray), gl.STATIC_DRAW);
  }

  render(gl, matrix) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.enableVertexAttribArray(this.aPos);
      gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
      gl.useProgram(this.program);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
      gl.drawArrays(gl.POINTS, 0, 461589); // nbr of points
  }
}
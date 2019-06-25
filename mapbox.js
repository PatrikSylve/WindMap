

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
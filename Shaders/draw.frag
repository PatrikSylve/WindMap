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
       
        vec4 color = c2; 
       
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
      }
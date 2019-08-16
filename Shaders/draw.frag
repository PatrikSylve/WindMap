 precision mediump float;

    uniform sampler2D u_wind;
    uniform vec2 u_wind_min;
    uniform vec2 u_wind_max;
    
    varying vec4 v_color;
    varying vec2 v_pos; 
    

    void main() { 
      vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, v_pos).rg);
      float speed_t = length(velocity) / length(u_wind_max);

      
      // l1
      
      vec4 l1 = vec4(69.0/255.0, 117.0/255.0, 180.0/255.0, 1.0); 
      //l2
      //116,173,209
      vec4 l2 = vec4(116.0/255.0, 173.0/255.0, 209.0/255.0, 1.0); 

      //l3
      //224,243,248
      vec4 l3 = vec4(224.0/255.0, 243.0/255.0, 248.0/255.0, 1.0); 

      //l4
      //254,224,144
      vec4 l4 = vec4(254.0/255.0, 224.0/255.0, 144.0/255.0, 1.0); 

      //l5
      //244,109,67
      vec4 l5 = vec4(244.0/255.0, 109.0/255.0, 67.0/255.0, 1.0); 

      //l6 
      //215,48,39
      vec4 l6 = vec4(215.0/255.0, 48.0/255.0, 39.0/255.0, 1.0); 
      vec4 color = l2; 
     
      if (speed_t > 0.1) {
        color = l2; 
     }

      if (speed_t > 0.2) {
        color = l3; 
     }
      if (speed_t > 0.3) {
        color = l4; 
     }

      if (speed_t > 0.4) {
        color = l5; 
     }

      if (speed_t > 0.5) {
         color = l6; 
      }
      gl_FragColor = color; //vec4(1.0,0.0,0.0,1.0);//v_color;
    }
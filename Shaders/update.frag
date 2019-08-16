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

    vec2 vertex_coord = (floor(uv * u_wind_res)) * px;

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
    
    vec2 pos = vec2(
      color.r / 255.0 + color.b,
      color.g / 255.0 + color.a); // decode particle position from pixel RGBA

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

    // drop rate is a chance a particle will restart at random position, to avoid degeneration
    float drop_rate = u_drop_frequency + speed_t * 0.1;
    float drop = step(1.0 - drop_rate, rand(seed));

    vec2 random_pos = vec2(
        rand(seed + 1.3),
        rand(seed + 2.1));
    pos = mix(pos, random_pos, drop);

    //gl_FragColor = vec4(floor(encoded_x.x), floor(encoded_x.y), floor(encoded_y.x), floor(encoded_y.y));
    //gl_FragColor = vec4(encoded_x, encoded_y);
    gl_FragColor = vec4(
      fract(pos * 255.0),
      floor(pos * 255.0) / 255.0);
  }
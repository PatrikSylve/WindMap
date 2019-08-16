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

        vec2 particle_pos = vec2(color.r / 255.0 + color.b,
                                color.g / 255.0 + color.a);

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
    }
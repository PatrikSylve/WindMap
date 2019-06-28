
import requests, json, math, png

# download data and generate a png file storing coordinates
def generate_coord_texture():
    getData() 

    with open('windCoord.txt') as json_file:
        data = json.load(json_file)

    gen_png_coord(650,710,'coordinates2.png', data)


# get data and write to file
def getData():
    validTime = requests.get("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/validtime.json")
    r = validTime.json()
    vt = r["validTime"][0] 

    # format validtime
    temp = ""
    for x in str(vt): 
        if x != '-' and x != ':' and x != '"':
            temp += x
    
    urlS = requests.get("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint/validtime/" + temp + "/parameter/ws/leveltype/hl/level/10/data.json?with-geo=false")
    urlD = requests.get("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint/validtime/" + temp + "/parameter/wd/leveltype/hl/level/10/data.json?with-geo=false")
    urlC = requests.get("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint.json") 

    wSpeed = urlS.json()
    wDir = urlD.json()
    coord = urlC.json() 

    with open('windSpeed.txt', 'w') as outfile:
        json.dump(wSpeed, outfile)

    with open('windDir.txt', 'w') as diroutfile:
        json.dump(wDir, diroutfile)

    with open('windCoord.txt', 'w') as coordoutfile:
        json.dump(coord, coordoutfile)



# func for calculating max values
# for loniguted lon_lat = 0, else 1
def calc_max_min(lon_lat, max_min, w, h, data):
    tmp = data["coordinates"][0][lon_lat]
    for y in range(0, h):
        for x in range(0, w):
            i = x*y + x
            if max_min == 'max':
                if tmp <= data["coordinates"][i][lon_lat]:
                    tmp = data["coordinates"][i][lon_lat]
            else:
                if tmp >= data["coordinates"][i][lon_lat]:
                    tmp = data["coordinates"][i][lon_lat]
    return tmp

#
''''
umax = 33.780332 #first coord range 600x600
umin = -4.245814
vmax = 67.73865
vmin = 52.50044
'''


# generate a png-file storing coordinates
def gen_png_coord(width, height, name, data):
    img = []
    
    umin = calc_max_min(0, 'min', width, height, data)
    umax = calc_max_min(0, 'max', width, height, data)
    vmin = calc_max_min(1, 'min', width, height, data)
    vmax = calc_max_min(1, 'max', width, height, data)
   

    for y in range(0, height):
        row = ()
        for x in range(0, width):
            i = x*y + x
            lon = abs(math.floor(255 * (data["coordinates"][i][0] - umin) / (umax - umin)))
            lat = abs(math.floor(255 * (data["coordinates"][i][1] - vmin) / (vmax - vmin)))
            row = row +(lon, lat, 0)
        img.append(row)


    with open(name, 'wb') as f:
        w = png.Writer(width, height)
        w.write(f, img)

generate_coord_texture()

# calculate horisontal and vertical wind speed based on speed and direction wind data 
'''
def find_vec(height, width):
    dx =[]
    dy = []
    with open('windSpeed.txt') as speed:
        speed_data = json.load(speed)
    with open('windDir.txt') as direction:
        dir_data = json.load(direction)
   
    for y in range (0, height):
        for x in range (0, width):
            i = x*y + x
            speed =speed_data["timeSeries"][0]["parameters"][0]["values"][i]
            direc = dir_data["timeSeries"][0]["parameters"][0]["values"][i]
            dx.append(speed*math.cos(direc))
            dy.append(speed*math.sin(direc))
    max_value = max([max(dy), max(dx)])
    min_value = min([min(dx), min(dy)])

    #encode to [0-255] wth 'Excess-K' representation
        

find_vec(600,600)

def encode(dxy, max_v, min_v):
    scale = max_v-min_v
    base = scale/2
    for x in dxy: 
        dxy = dxy * scale + base * base / 2
        '''


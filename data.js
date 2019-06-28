
// fetch the current valid time from smhi which is used to get wind data
function getValidTime(){
    var validTime ="https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/validtime.json";
    fetch(validTime)
        .then(res => res.json()).then(res =>  getAllData(res));
}


// fetch wind speed, wind direction and station coordinates from SMHI. The function calls initMap when promise is resolved.
// parameter is JSON containing an array of valid times 
function getAllData(time){
    var Vtime = parseTime(time); 
    
    urlSpeed = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint/validtime/" + Vtime + "/parameter/ws/leveltype/hl/level/10/data.json?with-geo=false";
    urlDir = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint/validtime/" + Vtime + "/parameter/wd/leveltype/hl/level/10/data.json?with-geo=false";
    urlCoord = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint.json"; 
    data = 0; 

    Promise.all([urlSpeed, urlDir,urlCoord].map(url =>
        fetch(url).then(resp => resp.json())
    )).then(res => {
        data = res; 
    }).then(res => {
        initMap(data); 
    });  
}


// format the valid time 
function parseTime(time) {
    let temp =""; 
    time = JSON.stringify(time.validTime[0]);
    for (var i = 0; i < time.length; i++){
        let ch = time[i];
        if ((ch != '-') && (ch != ':') && (ch != '"') ){
            temp += ch; 
        } 
    }
    return temp; 
} 


//initalize data fetch
getValidTime(); 




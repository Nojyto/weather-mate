const lat      = 55.166080530703354, lon = 24.417680224680666

const GEO_API_KEY       = "AIzaSyDS5Ba4yckNhLgc3b_yujY9HkwwjYgzhX4"
const GEO_API_URL       = (query) => `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GEO_API_KEY}`
let geoData             = {}

const WEATHER_API_KEY   = "7fd94e220617fedef7ce908432bba472"
const WEATHER_API_URL   = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${WEATHER_API_KEY}`
const POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
const WEATHER_ICON_URL  = (ico) => "https://openweathermap.org/img/wn/" + ico + ".png"
let pollutionData       = {}
let weatherData         = {}

function getCurWeekday(day){
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satur"]
    return weekday[day]
}

function getCurDate(){
    const weekday = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
    const months  = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    const d = new Date()
    return `${weekday[d.getDay()]}, ${months[d.getMonth() + 1]} ${d.getDate()} ${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
}

function getSunToggleTime(epoch){
    const d = new Date(epoch * 1000)
    return `${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
}

function getUVindex(val){
    if(val >= 11){
        return "extreme"
    }else if(val >= 8){
        return "very high"
    }else if(val >= 6){
        return "high"
    }else if(val >= 3){
        return "moderate"
    }else {
        return "low"
    }
}

function getAQI(AQI){
    if(50 >= AQI){
        return `Good(${AQI})`
    }else if(100 >= AQI){
        return `Moderate(${AQI})`
    }else if(150 >= AQI){
        return `Tolerable(${AQI})`
    }else if(200 >= AQI){
        return `Bad(${AQI})`
    }else if(250 >= AQI){
        return `Horrible(${AQI})`
    }else if(300 >= AQI){
        return `Hazardous(${AQI})`
    }
}

function addCurrWeather(){
    document.getElementById("currentWeather").innerHTML = `
        <div>
            <h1>${weatherData.timezone}</h1>
            <p>${getCurDate()}</p>
        </div>

        <div class="mainInfo">
            <label for="feelsLikeTemp">
                <img src=${WEATHER_ICON_URL(weatherData.current.weather[0].icon)} alt="weatherIcon"></img>
                <var>${parseInt(weatherData.current.feels_like)}°</var>
            </label>
            <label for="rainChance">
                <i class="fas fa-tint"></i>
                <var>${weatherData.hourly[0].pop * 100}% </var>
            </label>
        </div>

        <div>
            <label for="windSpeed">
                <i class="fas fa-wind"></i>
                <var>${parseInt(weatherData.current.wind_speed)} <small>m/s</small></var>
            </label>
            <label for="windAngle">
                <i style="transform: rotate(${weatherData.current.wind_deg}deg)" class="fas fa-arrow-up"></i>
            </label>
        </div>

        <div>
            <label for="humidity">
                <i class="fas fa-tint"></i>
                <var>Humidity: ${weatherData.current.humidity}%</var>
            </label>
        </div>

        <div>
            <label>
                <i class="fas fa-smog"></i>
                <var>AQI: <small>${getAQI(pollutionData.list[0].main.aqi)}</small></var>
            </label>
        </div>

        <div>
            <label for="sunTime">
                <i class="fas fa-sun"></i>
                <var>${getSunToggleTime(weatherData.current.sunrise)} - ${getSunToggleTime(weatherData.current.sunset)}</var>
            </label>
        </div>

        <div>
            <label for="UV-index">
                <i class="fas fa-glasses"></i>
                <var>UV: <small>${getUVindex(weatherData.current.uvi)}</small></var>
            </label>
        </div>
    `
}

function addHourlyWeather(){
    hourlyWeather = document.getElementById("hourlyWeather")
    d = new Date()
    for(let i = 1; i <= 4; i++){
        d.setHours(d.getHours() + 1);
        hourlyWeather.innerHTML += `
            <div style="${(i == 4) ? "margin-right: 0px" : "margin-right: 18px"}">  
                <label for="time">${d.getHours()}:00</label>
                <img src=${WEATHER_ICON_URL(weatherData.hourly[i].weather[0].icon)} alt="weatherIcon"></img>
                <label for="temp">${parseInt(weatherData.hourly[i].feels_like)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${weatherData.hourly[i].pop * 100}%</label>
            </div>
        `
    }
}

function addDailyWeather(){
    dailyWeather = document.getElementById("dailyWeather")
    for(let i = 1; i <= 6; i++){
        dailyWeather.innerHTML += `
            <div>  
                <label for="weekday">${(i == 1) ? "Tomorrow" : getCurWeekday(d.getDay() + i - 1)}</label>
                <img src=${WEATHER_ICON_URL(weatherData.daily[i].weather[0].icon)} alt="weatherIcon"></img>
                <label for="temp">${parseInt(weatherData.daily[i].temp.max)}°/ ${parseInt(weatherData.daily[i].temp.min)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${weatherData.daily[i].pop * 100}%</label>
            </div>
        `
    }
}

window.onload = async () => {
    /*try{
        geoData = await(await fetch(GEO_API_URL("marijampole"))).json()
        //geoData = await(await fetch("https://maps.googleapis.com/maps/api/geocode/json?place_id=ChIJd8BlQ2BZwokRAFUEcm_qrcA&key=AIzaSyDia73QDHsV7N8StWtd0g2WoszWS8Ru1Ic&sensor=true")).json()
    }catch(err){console.error(err)}
    console.log(geoData)*/
    try{
        weatherData   = await(await fetch(WEATHER_API_URL)).json()
        pollutionData = await(await fetch(POLLUTION_API_URL)).json()
    }catch(err){console.error(err)}
    //console.log(weatherData)
    //console.log(pollutionData)

    addCurrWeather();
    addHourlyWeather();
    addDailyWeather();
}
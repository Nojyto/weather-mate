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

function addCurrWeather(){
    const getCurDate = () => {
        const weekday = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
        const months  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        const d = new Date()
        return `${weekday[d.getDay()]}, ${months[d.getMonth() + 1]} ${d.getDate()} ${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
    }

    document.getElementById("currentWeather").innerHTML = `
        <div>
            <h1>${weatherData.timezone}</h1>
            <p>${getCurDate()}</p>
        </div>

        <div>
            <label for="feelsLikeTemp">
                <img src=${WEATHER_ICON_URL(weatherData.current.weather[0].icon)} alt="weatherIcon" draggable="false"></img>
                <var>${parseInt(weatherData.current.temp)}°</var>
            </label>
            <span>${weatherData.current.weather[0].description.charAt(0).toUpperCase() + weatherData.current.weather[0].description.slice(1)}</span>
            <span>${parseInt(weatherData.daily[0].temp.max)}°/ ${parseInt(weatherData.daily[0].temp.min)}°</span>
            <span>Feels like ${parseInt(weatherData.current.feels_like)}°</span>
        </div>
    `
}

function addCurrInfo(){
    const getAQI = (AQI) => {
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

    const getSunToggleTime = (epoch) => {
        const d = new Date(epoch * 1000)
        return `${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
    }

    const getUVindex = (val) => {
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

    document.getElementById("currentInfo").innerHTML = `
        <div>
            <label><i class="fas fa-wind"></i></label>
            <var><i style="transform: rotate(${weatherData.current.wind_deg}deg)" class="fas fa-arrow-up"></i>${parseInt(weatherData.current.wind_speed)} m/s</var>
        </div>

        <div>
            <label for="humidity"><i class="fas fa-tint"></i></label>
            <var>${weatherData.current.humidity}%</var>
        </div>

        <div>
            <label for="pollution"><i class="fas fa-smog"></i></label>
            <var>${getAQI(pollutionData.list[0].main.aqi)}</var>
        </div>

        <div>
            <label for="sunTime"><i class="fas fa-sun"></i></label>
            <var>${getSunToggleTime(weatherData.current.sunrise)} - ${getSunToggleTime(weatherData.current.sunset)}</var>
        </div>

        <div>
            <label for="UV-index"><i class="fas fa-glasses"></i></label>
            <var>${getUVindex(weatherData.current.uvi)}</var>
        </div>
    `
}

function addHourlyWeather(){
    hourlyWeather = document.getElementById("hourlyWeather")
    d = new Date()
    if(d.getMinutes() > 40) d.setTime(d.getTime() + (60*60*1000))
    for(let i = 1; i <= 4; i++){
        d.setHours(d.getHours() + 1);
        hourlyWeather.innerHTML += `
            <div style="${(i == 4) ? "margin-right: 0px" : "margin-right: 18px"}">  
                <label for="time">${d.getHours()}:00</label>
                <img src=${WEATHER_ICON_URL(weatherData.hourly[i].weather[0].icon)} alt="weatherIcon" draggable="false"></img>
                <label for="temp">${parseInt(weatherData.hourly[i].feels_like)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${weatherData.hourly[i].pop * 100}%</label>
            </div>
        `
    }
}

function addDailyWeather(){
    dailyWeather = document.getElementById("dailyWeather")
    let d = new Date() /*${(i == 1) ? "Tomorrow" : getCurWeekday(d.getDay() + i - 1)}*/
    d.setDate(d.getDate() + 1)
    for(let i = 1; i <= 6; i++){
        dailyWeather.innerHTML += `
            <div>  
                <label for="weekday">${(i == 1) ? "Tomorrow" : d.toLocaleString("default", {weekday:"long"})}</label>
                <img src=${WEATHER_ICON_URL(weatherData.daily[i].weather[0].icon)} alt="weatherIcon" draggable="false"></img>
                <label for="temp">${parseInt(weatherData.daily[i].temp.max)}°/ ${parseInt(weatherData.daily[i].temp.min)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${weatherData.daily[i].pop * 100}%</label>
            </div>
        `
        d.setDate(d.getDate() + 1)
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
    console.log(weatherData)
    //console.log(pollutionData)

    addCurrWeather();
    addHourlyWeather();
    addCurrInfo();
    addDailyWeather();
}
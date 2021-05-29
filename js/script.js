const lat      = 55.166080530703354, lon = 24.417680224680666
const API_KEY  = "7fd94e220617fedef7ce908432bba472"
const API_URL  = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${API_KEY}`
const ICON_URL = (ico) => "http://openweathermap.org/img/wn/" + ico + ".png"

let data = {}

function getCurWeekday(day){
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satur"]
    return weekday[day]
}

function getCurDate(){
    const weekday = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
    const d = new Date()
    return `${weekday[d.getDay()]}, ${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
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

window.onload = async () => {
    try{
        data = await(await fetch(API_URL)).json()
    }catch(err){console.error(err)}
    console.log(data)

    document.getElementById("currentWeather").innerHTML = `
        <div>
            <h1>${data.timezone}</h1>
            <p>${getCurDate()}</p>
        </div>

        <div>
            <label for="feelsLikeTemp">
                <img src=${ICON_URL(data.current.weather[0].icon)} alt="weatherIcon"></img>
                <var>${parseInt(data.current.feels_like)}°</var>
            </label>
            <label for="rainChance">
                <i class="fas fa-tint"></i>
                <var>${data.hourly[0].pop * 100}% </var>
            </label>
        </div>

        <div>
            <label for="windSpeed">
                <i class="fas fa-wind"></i>
                <var>${(data.current.wind_speed * 3.6).toPrecision(3)} <small>km/h</small></var>
            </label>
        </div>

        <div>
            <label for="sunTime">
                <i class="fas fa-sun"></i>
                <var>${getSunToggleTime(data.current.sunrise)}-${getSunToggleTime(data.current.sunset)}</var>
            </label>
        </div>

        <div>
            <label for="UV-index">
                <i class="fas fa-glasses"></i>
                <var>UV: <small>${getUVindex(data.current.uvi)}</small></var>
            </label>
        </div>
    `


    hourlyWeather = document.getElementById("hourlyWeather")
    d = new Date()

    for(let i = 1; i <= 4; i++){
        d.setHours(d.getHours() + 1);
        hourlyWeather.innerHTML += `
            <div style="${(i == 4) ? "margin-right: 0px" : "margin-right: 18px"}">  
                <label for="time">${d.getHours()}:00</label>
                <img src=${ICON_URL(data.hourly[i].weather[0].icon)} alt="weatherIcon"></img>
                <label for="temp">${parseInt(data.hourly[i].feels_like)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${data.hourly[i].pop * 100}%</label>
            </div>
        `
    }


    dailyWeather = document.getElementById("dailyWeather")

    for(let i = 1; i <= 6; i++){
        dailyWeather.innerHTML += `
            <div>  
                <label for="weekday">${(i == 1) ? "Tomorrow" : getCurWeekday(d.getDay() + i - 1)}</label>
                <img src=${ICON_URL(data.daily[i].weather[0].icon)} alt="weatherIcon"></img>
                <label for="temp">${parseInt(data.daily[i].feels_like.day)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${data.daily[i].pop * 100}%</label>
            </div>
        `
    }
}

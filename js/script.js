const WEATHER_API_KEY   = "7fd94e220617fedef7ce908432bba472"
const WEATHER_API_URL   = (lat, lon) => `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${WEATHER_API_KEY}`
const POLLUTION_API_URL = (lat, lon) => `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
const GEO_API_URL       = (query)    => `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${WEATHER_API_KEY}`
const WEATHER_ICON_URL  = (ico)      => "https://openweathermap.org/img/wn/" + ico + ".png"

function addCurrWeather(weatherData, city){
    const getCurDate = () => {
        const weekday = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
        const months  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
        const d = new Date()
        return `${weekday[d.getDay()]}, ${months[d.getMonth() + 1]} ${d.getDate()} ${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
    }

    document.getElementById("currentWeather").innerHTML = `
        <div>
            <h1>${city}</h1>
            <p>${getCurDate()}</p>
        </div>

        <div>
            <label for="feelsLikeTemp">
                <img src=${WEATHER_ICON_URL(weatherData.current.weather[0].icon)} alt="weatherIcon" draggable="false"></img>
                <var>${Math.floor(weatherData.current.temp)}°</var>
            </label>
            <span>${weatherData.current.weather[0].description.charAt(0).toUpperCase() + weatherData.current.weather[0].description.slice(1)}</span>
            <span>${Math.ceil(weatherData.daily[0].temp.max)}°/ ${Math.floor(weatherData.daily[0].temp.min)}°</span>
            <span>Feels like ${Math.ceil(weatherData.current.feels_like)}°</span>
        </div>
    `
}

function addHourlyWeather(weatherData){
    hourlyWeather = document.getElementById("hourlyWeather")
    d = new Date()
    if(d.getMinutes() > 40) d.setTime(d.getTime() + (60*60*1000))
    for(let i = 1; i <= 12; i++){
        d.setHours(d.getHours() + 1)
        hourlyWeather.innerHTML += `
            <div style="${(i == 1) ? "margin-left: 790px" : "margin-left: 18px"}">  
                <label for="time">${d.getHours()}:00</label>
                <samp>
                    <img src=${WEATHER_ICON_URL(weatherData.hourly[i].weather[0].icon)} alt="weatherIcon" draggable="false"></img>
                    <span>${weatherData.hourly[i].weather[0].description.charAt(0).toUpperCase() + weatherData.hourly[i].weather[0].description.slice(1)}</span>
                </samp>
                <label for="temp">${Math.ceil(weatherData.hourly[i].feels_like)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${weatherData.hourly[i].pop * 100}%</label>
            </div>
        `
    }
}

function addCurrInfo(weatherData, pollutionData){
    const getAQI = (AQI) => {
        switch(AQI){
            case 5: return "Very Poor"
            case 4: return "Poor"
            case 3: return "Moderate"
            case 2: return "Fair"
            case 1: return "Good"
        }
    }

    const getUVindex = (val) => {
        if(val >= 11){
            return "Extreme"
        }else if(val >= 8){
            return "Very high"
        }else if(val >= 6){
            return "High"
        }else if(val >= 3){
            return "Moderate"
        }else {
            return "Low"
        }
    }

    const getSunToggleTime = (epoch) => {
        const d = new Date(epoch * 1000)
        return `${d.getHours()}:${(d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes()}`
    }

    const getMoonPhaseIcon = (phase) =>{
        const iconUrl = (moon) => `dependencies/moonPhases/${moon}.png`
        if     (phase <= 0.11) return iconUrl("newMoon")
        else if(phase <= 0.22) return iconUrl("waxingCrescent")
        else if(phase <= 0.33) return iconUrl("quarterMoon")
        else if(phase <= 0.44) return iconUrl("waxingGibbous")
        else if(phase <= 0.55) return iconUrl("fullMoon")
        else if(phase <= 0.66) return iconUrl("waningGibbous")
        else if(phase <= 0.77) return iconUrl("lastQuarter")
        else if(phase <= 0.88) return iconUrl("waningCrescent")
        else if(phase <= 1.00) return iconUrl("newMoon")
    }

    const getMoonPhaseName = (phase) =>{
        if     (phase <= 0.11) return "New moon"
        else if(phase <= 0.22) return "Waxing crescent"
        else if(phase <= 0.33) return "Quarter moon"
        else if(phase <= 0.44) return "Waxing gibbous"
        else if(phase <= 0.55) return "Full moon"
        else if(phase <= 0.66) return "Waning gibbous"
        else if(phase <= 0.77) return "Last quarter"
        else if(phase <= 0.88) return "Waning crescent"
        else if(phase <= 1.00) return "New moon"
    }

    document.getElementById("currentInfo").innerHTML = `
        <div>
            <label><i class="fas fa-wind"></i><span>Wind dir/speed</span></label>
            <var><i style="transform: rotate(${weatherData.current.wind_deg}deg)" class="fas fa-arrow-up"></i>${Math.ceil(weatherData.current.wind_speed)} m/s</var>
        </div>

        <div>
            <label for="humidity"><i class="fas fa-tint"></i><span>Humidity</span></label>
            <var>${weatherData.current.humidity}%</var>
        </div>

        <div>
            <label for="cloudDensity"><i class="fas fa-cloud"></i><span>Cloud coverage</span></label>
            <var>${weatherData.current.clouds}%</var>
        </div>

        <div>
            <label for="pollution"><i class="fas fa-smog"></i><span>AQI</span></label>
            <var>${getAQI(pollutionData.list[0].main.aqi)}</var>
        </div>

        <div>
            <label for="UV-index"><i class="fas fa-glasses"></i><span>UV index</span></label>
            <var>${getUVindex(weatherData.current.uvi)}</var>
        </div>

        <div>
            <label for="sunTime"><i class="fas fa-sun"></i><span>Sun rise/set</span></label>
            <var>${getSunToggleTime(weatherData.current.sunrise)} - ${getSunToggleTime(weatherData.current.sunset)}</var>
        </div>

        <div>
            <label for="moonPhase"><img class="moonImg" src=${ getMoonPhaseIcon(weatherData.daily[0].moon_phase)} alt="moonIcon" draggable="false"></img><span>Moon phase</span></label>
            <var>${getMoonPhaseName(weatherData.daily[0].moon_phase)}</var>
        </div>
    `
}

function addDailyWeather(weatherData){
    dailyWeather = document.getElementById("dailyWeather")
    let d = new Date() /*${(i == 1) ? "Tomorrow" : getCurWeekday(d.getDay() + i - 1)}*/
    d.setDate(d.getDate() + 1)
    for(let i = 1; i <= 6; i++){
        dailyWeather.innerHTML += `
            <div style="${(i == 6) ? "margin-bottom: 0px" : "margin-bottom: 17px"}">  
                <label for="weekday">${(i == 1) ? "Tomorrow" : d.toLocaleString("EN", {weekday:"long"})}</label>
                <samp>
                    <img src=${WEATHER_ICON_URL(weatherData.daily[i].weather[0].icon)} alt="weatherIcon" draggable="false"></img>
                    <span>${weatherData.daily[i].weather[0].description.charAt(0).toUpperCase() + weatherData.daily[i].weather[0].description.slice(1)}</span>
                </samp>
                <label for="temp">${Math.floor(weatherData.daily[i].temp.max)}°/ ${Math.floor(weatherData.daily[i].temp.min)}°</label>
                <label for="rain"><i class="fas fa-tint"></i>${Math.floor(weatherData.daily[i].pop * 100)}%</label>
            </div>
        `
        d.setDate(d.getDate() + 1)
    }
}

function addAdditionalInfo(weatherData){
    const drivingDifficulty = (diff) => {
        switch (diff){
            case 0:case 1:case 2:case 3: return "None"
            case 4:case 5:case 6: return "Moderate"
            case 7:case 8:case 9: return "Severe"
            default: return "Extreme"
        }
    }
    const runningDifficulty = (diff) => {
        switch (diff){
            case 0:case 1:case 2:case 3: return "Very good"
            case 4:case 5:case 6: return "Decent"
            case 7:case 8:case 9: return "Poor"
            default: return "Very poor"
        }
    }
    let diff = 0
    if(weatherData.current.visibility < 5000) diff++
    if(weatherData.current.visibility < 2500) diff++
    if(weatherData.current.temp < -5) diff++
    else if(weatherData.current.temp < -15) diff++
    if(weatherData.current.weather[0].id / 100 == 2) diff += 2
    else if(weatherData.current.weather[0].id / 100 == 3) diff++
    else if(weatherData.current.weather[0].id / 100 == 4) diff++
    else if(weatherData.current.weather[0].id / 100 == 5) diff+=2
    else if(weatherData.current.weather[0].id / 100 == 6) diff+=4
    
    document.getElementById("additionalInfo").innerHTML = `
        <div>
            <label><i class="fas fa-car"></i><span>Driving difficulty</span></label>
            <var>${drivingDifficulty(diff)}</var>
        </div>
        <div>
            <label><i class="fas fa-running"></i><span>Running opportunity</span></label>
            <var>${runningDifficulty(diff)}</var>
        </div>
        
    `
}

window.onload = async () => {
    document.getElementById("changeLocation").addEventListener("click", () => {
        localStorage.city = null
        localStorage.lat  = null
        localStorage.lon  = null
        location.reload()
    })
    let lat                 = localStorage.getItem("lat")
    let lon                 = localStorage.getItem("lon")
    let city                = localStorage.getItem("city")

    let geoData             = {}
    let pollutionData       = {}
    let weatherData         = {}

    try{
        if(city === null || city === "null"){
            city = window.prompt("Enter your city: ")
            
            geoData = await(await fetch(GEO_API_URL(city))).json()
            if(geoData[0] === undefined){
                city = null
                window.alert("Invalid city name.")
            }else{
                city = geoData[0].name
                localStorage.city = city

                lat = geoData[0].lat
                localStorage.lat = lat
                
                lon = geoData[0].lon
                localStorage.lon = lon
            }
            location.reload()
        }
        weatherData   = await(await fetch(WEATHER_API_URL(lat, lon))).json()
        pollutionData = await(await fetch(POLLUTION_API_URL(lat, lon))).json()
    }catch(err){console.error(err)}
    //console.log(geoData)
    //console.log(weatherData)
    //console.log(pollutionData)

    addCurrWeather(weatherData, city)
    addHourlyWeather(weatherData)
    addCurrInfo(weatherData, pollutionData)
    addDailyWeather(weatherData)
    addAdditionalInfo(weatherData)
}
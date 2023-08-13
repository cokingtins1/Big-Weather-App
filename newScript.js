const apiKey =
	"https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FNew_York"

const lat = 39.3321
const lon = -84.4173

function setLocaiton(lat, lon) {
	window.LINK = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FNew_York`
}

setLocaiton(lat, lon)

async function getWeather() {
	try {
		const response = await fetch(LINK)
		const data = await response.json()

		//deconstruct data from API and store as const for easier access
		const parsedData = parseData(data)

		// rename parsedData to current and parseData fucntion to parseCurrentWeather. create separate const for daily weather and separate function to parsedaily data.
		console.log(data)
		dayMapfun(parsedData)
		renderWeather(parsedData)
	} catch (error) {
		console.error("there was an error")
	}
}

function parseData({ current_weather, daily, daily_units, hourly }) {
	const {
		temperature: currentTemp,
		windspeed: windspeed,
		weathercode: iconCode,
		time: time,
	} = current_weather
	const { apparent_temperature_max: maxDailyTemp } = daily
	const { apparent_temperature_max: degF } = daily_units
	const { temperature_2m: hourlyTemp } = hourly
	return {
		currentTemp: Math.round(currentTemp),
		highTemp: Math.round(Math.max(...hourlyTemp)),
		lowTemp: Math.round(Math.min(...hourlyTemp)),
		maxDailyTemp: maxDailyTemp.map((number) => Math.round(number)),
		time,
		iconCode,
		degF,
	}
}

function renderWeather(data) {
	renderWeeklyWeather(data)
	renderHourlyWeather(data)
	renderCurrentWeather(data)
	// render weekly data, hourly data, etc.
}

function renderWeeklyWeather() {
	for (let i = 0; i < 7; i++) {
		setValue(`${i}`, dayMap.get(i), "F")
	}
}

function renderHourlyWeather(data) {
	// const currentTime = data.current_weather.time
	function convertTime(unixTime) {
		const date = new Date(unixTime * 1000)
		const hour = date.getUTCHours()
		const minutes = date.getUTCMinutes()

		const period = hour >= 12 ? "PM" : "AM"
		const ampmHour = hour % 12 === 0 ? 12 : hour % 12
		console.log(hour)
		// return `${ampmHour}${period}`
		return `${ampmHour}:${minutes.toString().padStart(2, "0")} ${period}`
	}

	const currentUnixTime = Math.floor(Date.now())
	const theHour = convertTime(currentUnixTime)
	console.log(theHour)
}

const dayMap = new Map()
function dayMapfun(data) {
	for (let i = 0; i < 7; i++) {
		dayMap.set(i, data.maxDailyTemp[i])
	}
}

function renderCurrentWeather(data) {
	// console.log(data.current_weather.temperature)
	setValue("current-temp", data.currentTemp, data.degF)
	setValue("current-high", data.highTemp, data.degF)
	setValue("current-low", data.lowTemp, data.degF)
}

function setValue(selector, value, unit, { parent = document } = {}) {
	parent.querySelector(`[data-${selector}]`).textContent = value + unit
}

getWeather()

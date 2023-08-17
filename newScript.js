const apiKey =
	"https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FNew_York"

const lat = 39.3321
const lon = -84.4173

const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })

function setLocaiton(lat, lon) {
	window.LINK = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FNew_York`
}

setLocaiton(lat, lon)

async function getWeather() {
	try {
		const response = await fetch(LINK)
		const data = await response.json()

		// const weatherData = parseWeatherData(data) // get more readable/usable data from raw data

		// const { current, daily, hourly } = weatherData // deconstruct parsed data into current, daily, and hourly

		const current = parseCurrentWeather(data) // returns object "current"
		const daily = parseDailyWeather(data)
		// const hourly = parseHourlyWeather(data)
		// const dailyArray = parseDailyWeather(data)

		console.log(data)
		console.log(current.dailyHighFeelsLike)

		renderWeather({ current })
	} catch (error) {
		console.error("There was an error:", error)
	}
}

function getDayofWeek(current) {
	const weekNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	]

	const date = new Date(current.currentTime)
	const weekCode = new Map()

	for (let i = 0; i < 7; i++) {
		weekCode.set(weekNames[i], i)
	}

	// return weekNames[date.getDay(current.time)], weekCode
	return weekCode.get(weekNames[date.getDay(current.currentTime)])
}

// function parseWeatherData(data) {
// 	const { current_weather, daily, hourly } = data

// 	const {
// 		temperature: currentTemp,
// 		weathercode: iconCode,
// 		windspeed: windspeed,
// 		time: currentTime,
// 	} = current_weather

// 	const {
// 		temperature_2m_max: maxTemp,
// 		temperature_2m_min: minTemp,
// 		apparent_temperature_max: maxFeelsLike,
// 		apparent_temperature_min: minFeelsLike,
// 		precipitation_sum: precip,
// 		weathercode: dailyWeatherCode,
// 		time: dailyTime,
// 	} = daily

// 	const {
// 		time: hourlyTime,
// 		precipitation: hourlyPrecip,
// 		temperature_2m: hourlyTemp,
// 		weathercode: hourlyWeathercode,
// 	} = hourly

// 	return {

// 			currentTemp: Math.round(currentTemp),
// 			currentTime: currentTime * 1000,
// 			windspeed,
// 			iconCode,

// 			highTemp: maxTemp.map((maxTemp) => Math.round(maxTemp)), // array of high temp
// 			lowTemp: minTemp.map((minTemp) => Math.round(minTemp)),
// 			highFeelsLike: maxFeelsLike.map((maxFeelsLike) =>
// 				Math.round(maxFeelsLike)
// 			), // array of apparent high temp
// 			lowFeelsLike: minFeelsLike.map((minFeelsLike) =>
// 				Math.round(minFeelsLike)
// 			),
// 			precip: Math.round(precip[0]),
// 			dailyTime: dailyTime.map((dailyTime) => dailyTime * 1000),
// 			dailyWeatherCode,

// 			hourlyTime: hourlyTime.map((hourlyTime) => hourlyTime * 1000),
// 			hourlyPrecip,
// 			hourlyTemp: hourlyTemp.map((hourlyTemp) => Math.round(hourlyTemp)),
// 			hourlyWeathercode,

// 	}
// }

function parseCurrentWeather({ current_weather, daily }) {
	const {
		temperature: currentTemp,
		weathercode: iconCode,
		windspeed: windspeed,
		time: currentTime,
	} = current_weather

	const {
		temperature_2m_max: maxTemp,
		temperature_2m_min: minTemp,
		apparent_temperature_max: maxFeelsLike,
		apparent_temperature_min: minFeelsLike,
		precipitation_sum: precip,
		weathercode: dailyWeatherCode,
		time: dailyTime,
	} = daily

	return {
		// current data
		currentTemp: Math.round(currentTemp),
		currentTime: currentTime * 1000,
		windspeed,
		iconCode,

		// daily data
		dailyHighTemp: Math.round(maxTemp[0]),
		dailyLowTemp: Math.round(minTemp[0]),
		dailyHighFeelsLike: Math.round(maxFeelsLike[0]),
		dailyLowFeelsLike: Math.round(minFeelsLike[0]),

		// weekly data
		weeklyHighTemp: maxTemp.map((maxTemp) => Math.round(maxTemp)), // array of high temp
		weeklyLowTemp: minTemp.map((minTemp) => Math.round(minTemp)),
		weeklyHighFeelsLike: maxFeelsLike.map((maxFeelsLike) =>
			Math.round(maxFeelsLike)
		), // array of apparent high temp
		weeklyLowFeelsLike: minFeelsLike.map((minFeelsLike) =>
			Math.round(minFeelsLike)
		),
		precip: Math.round(precip[0]),
		dailyTime: dailyTime.map((dailyTime) => dailyTime * 1000),
		dailyWeatherCode,
	}
}

function parseDailyWeather({ daily }) {
	return daily.time.map((time, index) => {
		return {
			timestamp: time * 1000,
			iconCode: daily.weathercode[index],
			highTemp: Math.round(daily.temperature_2m_max[index]), // array of daily high temps
			lowTemp: Math.round(daily.temperature_2m_min[index]),
		}
	})
}

// function parseHourlyWeather({ hourly, current_weather }) {
// 	return hourly.time.map((time, index) => {
// 			return {
// 				hourlyTime: time * 1000,
// 				iconCode: hourly.weathercode[index],
// 				hourlyTemp: Math.round(hourly.temperature_2m[index]),
// 				windspeed: Math.round(hourly.windspeed_10m[index]),
// 				precip: Math.round(hourly.precipitation[index]),
// 			}
// 		}).filter(({hourlyTime}) => hourlyTime >= current_weather.time * 1000)

// }

function renderHourlyWeather(hourly) {
	hourlySection.innerHTML = ""
}
// function dayMapFunction(dailyData) {
// 	// Implement your logic here to process daily weather data
// }

function renderWeather({ current, daily, hourly }) {
	// renderWeeklyWeather(daily)
	// renderHourlyWeather(hourly)
	renderCurrentWeather(current)
	// renderDailyWeather(daily)

	// render weekly data, hourly data, etc.
}

function renderCurrentWeather(current) {
	setValue("current-temp", current.currentTemp, "")
	setValue("current-high", current.dailyHighTemp, "")
	setValue("current-low", current.dailyLowTemp, "")
	setValue("current-fl-high", current.dailyHighFeelsLike, "")
	setValue("current-fl-low", current.dailyLowFeelsLike, "")
	setValue("current-wind", current.windspeed, "")
	setValue("current-precip", current.precip, "")
}

function renderDailyWeather(daily) {}

function renderWeeklyWeather(daily) {
	dailySection.innerHTML = ""

	daily.highTemp.forEach((highTemp) => {
		const element = dayCardTemplate.content.cloneNode(true)
		setValue("temp", highTemp, "", { parent: element })
		// setValue('day','Monday','', {parent:element})
		dailySection.append(element)
	})

	// for(let i=0;i<6;i++){
	// 	const element2 = setValue('date', i,'')
	// 	dailySection.append(element2)
	// }
}
const hourRowTemplate = document.getElementById("hour-row-template")
const hourlySection = document.querySelector("[data-hour-section]")

function setValue(selector, value, unit, { parent = document } = {}) {
	parent.querySelector(`[data-${selector}]`).textContent = value + unit
}

getWeather()

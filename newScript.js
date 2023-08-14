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

		const weatherData = parseWeatherData(data) // get more readable/usable data from raw data

		const { current, daily, hourly } = weatherData // deconstruct parsed data into current, daily, and hourly

		dayMapFunction(daily)
		console.log(data)

		renderWeather(weatherData)
	} catch (error) {
		console.error("There was an error:", error)
	}
}

function parseWeatherData(data) {
	const { current_weather, daily, hourly } = data

	const {
		temperature: currentTemp,
		weathercode: iconCode,
		windspeed: windspeed,
		is_day: dayCode,
		time,
	} = current_weather

	const {
		temperature_2m_max: maxTemp,
		temperature_2m_min: minTemp,
		apparent_temperature_max: maxFeelsLike,
		apparent_temperature_min: minFeelsLike,
	} = daily

	return {
		current: {
			currentTemp: Math.round(currentTemp),
			time: time * 1000,
			windspeed,
			dayCode,
			iconCode,
			maxFeelsLike: maxFeelsLike.map((number) => Math.round(number)),
			minFeelsLike: minFeelsLike.map((number) => Math.round(number)),
		},
		daily: {
			highTemp: Math.round(Math.max(...maxTemp)),
			lowTemp: Math.round(Math.min(...minTemp)),
			highFeelsLike: Math.round(maxFeelsLike),
			lowFeelsLike: Math.round(minFeelsLike),
		},
		hourly: hourly,
	}
}

function dayMapFunction(dailyData) {
	// Implement your logic here to process daily weather data
}

function renderWeather({ current, daily, renderHourlyWeather }) {
	// renderWeeklyWeather(data)
	// renderHourlyWeather(data)
	renderCurrentWeather(current)
	renderDailyWeather(daily)

	// render weekly data, hourly data, etc.
}

function renderCurrentWeather(current) {
	const currentDay = current.dayCode
	console.log(currentDay)
	// console.log(data.current_weather.temperature)
	setValue("current-temp", current.currentTemp, "")
	setValue("current-fl-high", current.maxFeelsLike[currentDay], "")
	setValue("current-fl-low", current.minFeelsLike[currentDay], "")

	setValue("current-wind", current.windspeed, "")
	// setValue("current-low", current.lowFeelsLike, "°F")
}

function renderDailyWeather(daily) {
	setValue("current-high", daily.highTemp, "")
	setValue("current-low", daily.lowTemp, "")
	setValue("current-high", daily.highTemp, "")
}

function renderWeeklyWeather(data) {
	dailySection.innerHTML = ""

	data.maxDailyTemp.forEach((day) => {
		const element = dayCardTemplate.content.cloneNode(true)
		setValue("temp", day, "°F", { parent: element })
		setValue("date", DAY_FORMATTER.format(day.time), "", {
			parent: element,
		})
		dailySection.append(element)
	})
}

function renderHourlyWeather() {
	// const currentUnixTime = Math.floor(Date.now() / 1000)
	// function convertTime(unixTime) {
	// 	const date = new Date(unixTime * 1000)
	// 	return new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(
	// 		date
	// 	)
	// }

	// const currentHour = convertTime(currentUnixTime)
	// // console.log(currentHour[0])

	let timeArray = []
	for (let i = 0; i < 9; i++) {
		timeArray.push(parseInt(currentHour[0]) + i)
	}

	// console.log(timeArray)
}

const dayMap = new Map()
function dayMapfun(data) {
	for (let i = 0; i < 7; i++) {
		dayMap.set(i, data.maxDailyTemp[i])
	}
}

function setValue(selector, value, unit, { parent = document } = {}) {
	parent.querySelector(`[data-${selector}]`).textContent = value + unit
}

getWeather()

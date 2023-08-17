import { ICON_MAP } from "./iconMap.js"

const lat = 39.3321
const lon = -84.4173

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })

function setLocaiton(lat, lon) {
	window.LINK = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FNew_York`
}

setLocaiton(lat, lon)

async function getWeather() {
	try {
		const response = await fetch(LINK)
		const data = await response.json()

		const current = parseCurrentWeather(data) // returns object "current"
		const daily = parseDailyWeather(data)
		const hourly = parseHourlyWeather(data)

		console.log(data)
		console.log(current)

		renderWeather({ current, daily, hourly })
	} catch (error) {
		console.error("There was an error:", error)
	}
}

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

function parseHourlyWeather({ hourly, current_weather }) {
	return hourly.time
		.map((time, index) => {
			return {
				hourlyTime: time * 1000,
				iconCode: hourly.weathercode[index],
				hourlyTemp: Math.round(hourly.temperature_2m[index]),
				hourlyFeelsLike: Math.round(hourly.apparent_temperature[index]),
				windspeed: Math.round(hourly.windspeed_10m[index]),
				precip: Math.round(hourly.precipitation[index]),
			}
		})
		.filter(({ hourlyTime }) => hourlyTime >= current_weather.time * 1000)
}

function renderWeather({ current, daily, hourly }) {
	renderHourlyWeather(hourly)
	renderCurrentWeather(current)
	renderDailyWeather(daily)
}

function renderCurrentWeather(current) {
	setValue("current-temp", current.currentTemp, "")
	setValue("current-high", current.dailyHighTemp, "")
	setValue("current-low", current.dailyLowTemp, "")
	setValue("current-fl-high", current.dailyHighFeelsLike, "")
	setValue("current-fl-low", current.dailyLowFeelsLike, "")
	setValue("current-wind", current.windspeed, "")
	setValue("current-precip", current.precip, "")
	document.querySelector("[data-current-icon]").src = getIconURL(
		current.iconCode
	)
}

function renderDailyWeather(daily) {
	const dailySection = document.querySelector("[data-day-section]")
	const dayCardTemplate = document.getElementById("day-card-template")
	dailySection.innerHTML = ""

	daily.forEach((day) => {
		const element = dayCardTemplate.content.cloneNode(true)
		setValue("temp", day.highTemp, "", { parent: element })
		setValue("date", DAY_FORMATTER.format(day.timestamp), "", {
			parent: element,
		})
		element.querySelector("[data-icon]").src = getIconURL(day.iconCode)
		dailySection.append(element)
	})
}

function renderHourlyWeather(hourly) {
	const hourRowTemplate = document.getElementById("hour-row-template")
	const hourlySection = document.querySelector("[data-hour-section]")
	hourlySection.innerHTML = ""

	hourly.slice(0, 24).forEach((hour) => {
		const element = hourRowTemplate.content.cloneNode(true)
		setValue("day", DAY_FORMATTER.format(hour.hourlyTime), "", {
			parent: element,
		})
		setValue("time", HOUR_FORMATTER.format(hour.hourlyTime), "", {
			parent: element,
		})
		setValue("temp", hour.hourlyTemp, "", { parent: element })
		setValue("fl-temp", hour.hourlyFeelsLike, "", { parent: element })
		setValue("wind", hour.windspeed, "", { parent: element })
		setValue("precip", hour.precip, "", { parent: element })
		element.querySelector("[data-icon]").src = getIconURL(hour.iconCode)
		hourlySection.append(element)
	})
}

function setValue(selector, value, unit, { parent = document } = {}) {
	parent.querySelector(`[data-${selector}]`).textContent = value + unit
}

function getIconURL(iconCode) {
	return `icons/${ICON_MAP.get(iconCode)}.svg`
}

getWeather()

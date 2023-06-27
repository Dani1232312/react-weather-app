import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  const getWeather = async () => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );
      setWeather(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`
      );
      const dailyForecast = filterDailyForecast(forecastResponse.data.list);
      setForecast(dailyForecast);
    } catch (error) {
      console.error(error);
    }
  };

  const filterDailyForecast = (forecastList) => {
    const dailyForecast = [];
    const processedDays = new Set();

    forecastList.forEach((forecast) => {
      const date = new Date(forecast.dt_txt);
      const day = date.toDateString();

      if (!processedDays.has(day)) {
        processedDays.add(day);
        dailyForecast.push(forecast);
      }
    });

    return dailyForecast;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getWeather();
  };

  const appStyle = {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '1em'
  };

  const inputStyle = {
    width: '60%',
    padding: '0.5em',
    fontSize: '1em',
    margin: '1em 0',
  };

  const buttonStyle = {
    padding: '0.5em 1em',
    fontSize: '1em',
    backgroundColor: '#007BFF',
    color: '#FFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  const weatherStyle = {
    backgroundColor: '#f2f2f2',
    borderRadius: '10px',
    padding: '1em',
    margin: '1em 0'
  };

  return (
    <div style={appStyle}>
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Get Weather</button>
      </form>
      {weather && (
        <div style={weatherStyle}>
          <h2>
            Weather in {weather.name} ({weather.sys.country})
          </h2>
          <p>{Math.round(weather.main.temp - 273.15)}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>
            {weather.weather[0].main} - {weather.weather[0].description}
          </p>
        </div>
      )}
      {forecast && (
        <div style={weatherStyle}>
          <h2>5-day Forecast</h2>
          {forecast.slice(0, 5).map((f, index) => (
            <div key={index}>
              <p>
                {new Date(f.dt * 1000).toLocaleDateString()}{' '}
                {new Date(f.dt * 1000).toLocaleTimeString()}
              </p>w
              <p>{Math.round(f.main.temp - 273.15)}°C</p>
              <p>{f.weather[0].main} - {f.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;

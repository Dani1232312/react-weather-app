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
    padding: '1em',
    backgroundColor: '#726EFF',
    color: '#FFF'
  };

  const inputStyle = {
    width: '60%',
    padding: '0.5em',
    fontSize: '1em',
    margin: '1em 0',
    backgroundColor: '#SAFFE7',
    border: 'none',
    borderRadius: '5px'
  };

  const buttonStyle = {
    padding: '0.5em 1em',
    fontSize: '1em',
    backgroundColor: '#08C6AB',
    color: '#FFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  const weatherStyle = {
    backgroundColor: '#37465B',
    borderRadius: '10px',
    padding: '1em',
    margin: '1em 0'
  };

  const cardStyle = {
    backgroundColor: '#212B38',
    borderRadius: '10px',
    padding: '1em',
    margin: '1em',
    display: 'inline-block',
    verticalAlign: 'top',
    minWidth: '200px'
  };

  const imageStyle = {
    width: '60px',
    height: '60px',
    marginBottom: '0.5em'
  };

  const getImageUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}.png`;

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
        <button type="submit" style={buttonStyle}>
          Get Weather
        </button>
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
          <div>
            {forecast.slice(0, 5).map((f, index) => (
              <div key={index} style={cardStyle}>
                <p>{new Date(f.dt * 1000).toLocaleDateString()}</p>
                <img src={getImageUrl(f.weather[0].icon)} alt={f.weather[0].description} style={imageStyle} />
                <p>{Math.round(f.main.temp - 273.15)}°C</p>
                <p>
                  {f.weather[0].main} - {f.weather[0].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

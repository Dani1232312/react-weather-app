import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import FlagSelect from 'react-flags-select';

// import 'react-flags-select/css/react-flags-select.css';

const App = () => {
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric'); // Default unit is Celsius
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Retrieve unit preference from local storage
    const savedUnit = localStorage.getItem('weatherAppUnit');
    if (savedUnit) {
      setUnit(savedUnit);
    }
  }, []);

  useEffect(() => {
    // Persist unit preference to local storage
    localStorage.setItem('weatherAppUnit', unit);
  }, [unit]);

  const getWeather = async () => {
    try {
      setLoading(true);
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      const convertedWeather = convertTemperature(weatherResponse.data);
      setWeather(convertedWeather);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      const convertedForecast = convertForecast(forecastResponse.data.list);
      setForecast(convertedForecast);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        const dayForecasts = forecastList.filter(
          (f) => new Date(f.dt_txt).toDateString() === day
        );
        const maxTemp = Math.max(...dayForecasts.map((f) => f.main.temp));
        const minTemp = Math.min(...dayForecasts.map((f) => f.main.temp));
        dailyForecast.push({ ...forecast, main: { temp_max: maxTemp, temp_min: minTemp } });
      }
    });

    return dailyForecast;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getWeather();
  };

  const handleRetrieveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherByLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error retrieving location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const getWeatherByLocation = async (latitude, longitude) => {
    try {
      setLoading(true);
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
      );
      const convertedWeather = convertTemperature(weatherResponse.data);
      setWeather(convertedWeather);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
      );
      const convertedForecast = convertForecast(forecastResponse.data.list);
      setForecast(convertedForecast);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = () => {
    const selectedPlace = autocompleteRef.current.getPlace();
    if (selectedPlace && selectedPlace.geometry) {
      const { lat, lng } = selectedPlace.geometry.location;
      getWeatherByLocation(lat(), lng());
    }
  };

  const toggleUnit = () => {
    // Toggle between Celsius and Fahrenheit
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const convertTemperature = (data) => {
    const convertedData = { ...data };
    if (unit === 'metric') {
      convertedData.main.temp = Math.round(convertedData.main.temp);
      convertedData.main.temp_min = Math.round(convertedData.main.temp_min);
      convertedData.main.temp_max = Math.round(convertedData.main.temp_max);
    } else {
      convertedData.main.temp = Math.round((convertedData.main.temp * 9) / 5 + 32);
      convertedData.main.temp_min = Math.round((convertedData.main.temp_min * 9) / 5 + 32);
      convertedData.main.temp_max = Math.round((convertedData.main.temp_max * 9) / 5 + 32);
    }
    return convertedData;
  };

  const convertForecast = (list) => {
    return list.map((item) => {
      const convertedItem = { ...item };
      if (unit === 'metric') {
        convertedItem.main.temp = Math.round(convertedItem.main.temp);
        convertedItem.main.temp_min = Math.round(convertedItem.main.temp_min);
        convertedItem.main.temp_max = Math.round(convertedItem.main.temp_max);
      } else {
        convertedItem.main.temp = Math.round((convertedItem.main.temp * 9) / 5 + 32);
        convertedItem.main.temp_min = Math.round((convertedItem.main.temp_min * 9) / 5 + 32);
        convertedItem.main.temp_max = Math.round((convertedItem.main.temp_max * 9) / 5 + 32);
      }
      return convertedItem;
    });
  };

  const appStyle = {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '1em',
    backgroundColor: '#726EFF',
    color: '#FFF',
  };

  const inputStyle = {
    width: '60%',
    padding: '0.5em',
    fontSize: '1em',
    margin: '1em 0',
    backgroundColor: '#SAFFE7',
    border: 'none',
    borderRadius: '5px',
  };

  const buttonStyle = {
    padding: '0.5em 1em',
    fontSize: '1em',
    backgroundColor: '#08C6AB',
    color: '#FFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const weatherStyle = {
    backgroundColor: '#37465B',
    borderRadius: '10px',
    padding: '1em',
    margin: '1em 0',
  };

  const cardStyle = {
    backgroundColor: '#212B38',
    borderRadius: '10px',
    padding: '1em',
    margin: '1em',
    display: 'inline-block',
    verticalAlign: 'top',
    minWidth: '200px',
  };

  const imageStyle = {
    width: '60px',
    height: '60px',
    marginBottom: '0.5em',
  };

  const flagStyle = {
    width: '30px',
    height: 'auto',
    marginRight: '0.5em',
  };

  const getImageUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}.png`;

  function getFlagEmoji(countryCode) {
    return countryCode.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(127397 + char.charCodeAt())
    );
  }

  return (
    <div style={appStyle}>
      <h1>Weather App</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          style={{ ...inputStyle, width: '40%', borderRadius: '10px 0 0 10px' }}
          ref={autocompleteRef}
        />
        <button type="submit" style={{ ...buttonStyle, marginLeft: '0.5em', borderRadius: '0 10px 10px 0' }}>
          Get Weather
        </button>
        <button type="button" style={{ ...buttonStyle, marginLeft: '0.5em' }} onClick={handleRetrieveLocation}>
          Use Current Location
        </button>
      </form>
      {weather && (
        <div style={weatherStyle}>
          <h2>
            Weather in {weather.name} {getFlagEmoji(weather.sys.country)}
          </h2>
          <p>{weather.main.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
          <p>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
          <p>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
          <p>Visibility: {weather.visibility} {unit === 'metric' ? 'm' : 'mi'}</p>
          <p>
            {weather.weather[0].main} - {weather.weather[0].description}
          </p>
          <img src={getImageUrl(weather.weather[0].icon)} alt={weather.weather[0].description} style={imageStyle} />
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
                <p>
                  Max: {f.main.temp_max}°{unit === 'metric' ? 'C' : 'F'} | Min: {f.main.temp_min}°{unit === 'metric' ? 'C' : 'F'}
                </p>
                <p>
                  {f.weather[0].main} - {f.weather[0].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <button type="button" style={buttonStyle} onClick={toggleUnit}>
        Switch to {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
      </button>
    </div>
  );
};

export default App;

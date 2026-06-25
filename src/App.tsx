import React, { useState, useEffect } from "react";
import { 
  Sun, 
  CloudSun, 
  CloudFog, 
  CloudDrizzle, 
  Snowflake, 
  CloudRain, 
  CloudRainWind, 
  CloudLightning, 
  Cloud, 
  Compass, 
  Wind, 
  Thermometer, 
  Droplets, 
  AlertCircle, 
  Search, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Activity, 
  Calendar, 
  ExternalLink, 
  FileText, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  RefreshCw,
  Info
} from "lucide-react";
import { WeatherData, GeocodingResult, IntelligenceRecommendation } from "./types";
import { 
  getWeatherCondition, 
  generateRecommendations, 
  celsiusToFahrenheit, 
  PRE_SEEDED_CITIES 
} from "./utils";

// Fully type-safe weather icon resolver
interface WeatherIconProps {
  name: string;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case "Sun":
      return <Sun className={`${className} animate-pulse`} />;
    case "CloudSun":
      return <CloudSun className={className} />;
    case "CloudFog":
      return <CloudFog className={className} />;
    case "CloudDrizzle":
      return <CloudDrizzle className={className} />;
    case "Snowflake":
      return <Snowflake className={className} />;
    case "CloudRain":
      return <CloudRain className={className} />;
    case "CloudRainWind":
      return <CloudRainWind className={className} />;
    case "CloudLightning":
      return <CloudLightning className={className} />;
    case "Cloud":
      return <Cloud className={className} />;
    default:
      return <CloudSun className={className} />;
  }
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // App state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentCity, setCurrentCity] = useState({ name: "London", country: "United Kingdom", code: "GB" });
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [searchHistory, setSearchHistory] = useState<{name: string, country: string}[]>([
    { name: "London", country: "United Kingdom" },
    { name: "New York", country: "United States" },
    { name: "Tokyo", country: "Japan" }
  ]);
  
  // Custom interactive simulation scenarios
  const [activeScenario, setActiveScenario] = useState<string>("live");
  
  // Day-specific forecast view detail
  const [selectedForecastIndex, setSelectedForecastIndex] = useState<number>(0);

  // Core API Fetch function
  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) {
      setError("Please input a valid city name.");
      return;
    }

    setLoading(true);
    setError(null);
    setActiveScenario("live"); // Reset sandbox scenario to live data

    try {
      // 1. Geocoding API Request
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geocodeUrl);
      
      if (!geoResponse.ok) {
        throw new Error("Geocoding service unavailable.");
      }
      
      const geoResult = await geoResponse.json();
      
      if (!geoResult.results || geoResult.results.length === 0) {
        setError(`City "${cityName}" not found. Please verify spelling or try another query.`);
        setLoading(false);
        return;
      }

      const match: GeocodingResult = geoResult.results[0];
      setCurrentCity({
        name: match.name,
        country: match.country || "Unknown Country",
        code: match.country_code || "UN"
      });

      // Add to unique search history
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.name.toLowerCase() !== match.name.toLowerCase());
        return [{ name: match.name, country: match.country }, ...filtered.slice(0, 4)];
      });

      // 2. Weather Forecast API Request
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      
      const weatherResponse = await fetch(forecastUrl);
      if (!weatherResponse.ok) {
        throw new Error("Weather forecast service unavailable.");
      }

      const weatherResult: WeatherData = await weatherResponse.json();
      setWeatherData(weatherResult);
      setSelectedForecastIndex(0); // Reset selected day to today
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish a connection. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Seed Load
  useEffect(() => {
    fetchWeather("London");
  }, []);

  // Handler for searching a city
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(searchQuery);
  };

  // Override active weather parameters when the scenario sandbox is used
  const getProcessedWeatherData = (): WeatherData | null => {
    if (!weatherData) return null;

    // Deep copy to prevent mutating the original state
    const processed: WeatherData = JSON.parse(JSON.stringify(weatherData));

    switch (activeScenario) {
      case "heatwave":
        processed.current_weather.temperature = 41.5;
        processed.current_weather.weathercode = 0; // Clear
        processed.current_weather.windspeed = 8.5;
        // Adjust daily forecasts to match the scenario
        processed.daily.temperature_2m_max[0] = 43.0;
        processed.daily.temperature_2m_min[0] = 31.0;
        processed.daily.precipitation_sum = [0, 0, 0, 0, 0, 0, 0];
        break;
      case "blizzard":
        processed.current_weather.temperature = -7.2;
        processed.current_weather.weathercode = 75; // Heavy snow
        processed.current_weather.windspeed = 42.0;
        processed.daily.temperature_2m_max[0] = -3.0;
        processed.daily.temperature_2m_min[0] = -12.0;
        processed.daily.precipitation_sum = [8.4, 12.0, 4.5, 0, 0, 1.2, 0];
        break;
      case "monsoon":
        processed.current_weather.temperature = 19.0;
        processed.current_weather.weathercode = 95; // Thunderstorm
        processed.current_weather.windspeed = 28.0;
        processed.daily.temperature_2m_max[0] = 21.0;
        processed.daily.temperature_2m_min[0] = 16.0;
        processed.daily.precipitation_sum = [48.0, 35.5, 12.0, 18.2, 2.0, 0, 0.5];
        break;
      case "gale":
        processed.current_weather.temperature = 14.5;
        processed.current_weather.weathercode = 80; // Heavy showers
        processed.current_weather.windspeed = 52.8;
        processed.daily.temperature_2m_max[0] = 16.0;
        processed.daily.temperature_2m_min[0] = 9.0;
        processed.daily.precipitation_sum = [12.4, 2.0, 0, 0.5, 0, 0, 0];
        break;
      case "live":
      default:
        // No modification needed
        break;
    }

    return processed;
  };

  const processedData = getProcessedWeatherData();
  const currentCondition = processedData ? getWeatherCondition(processedData.current_weather.weathercode) : null;
  const recommendations: IntelligenceRecommendation[] = processedData ? generateRecommendations(processedData) : [];

  // Helper to format temperature nicely based on the current active unit
  const formatTemp = (celsius: number) => {
    if (tempUnit === "F") {
      return `${Math.round(celsiusToFahrenheit(celsius))}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  };

  return (
    <div id="weather-intelligence-root" className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

      {/* Primary Header */}
      <header id="main-header" className="relative z-10 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/10 animate-pulse">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-slate-50 via-teal-100 to-emerald-200 bg-clip-text text-transparent">
                Weather Intelligence Platform
              </h1>
              <p className="text-xs text-slate-400">
                Precision forecasting coupled with decision risk analytics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-mono">Live Ingress: Active</span>
            </div>

            {/* Fahrenheit / Celsius Toggle */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700/60">
              <button 
                onClick={() => setTempUnit("C")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tempUnit === "C" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                °C
              </button>
              <button 
                onClick={() => setTempUnit("F")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tempUnit === "F" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                °F
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        
        {/* Top Control Bar: Search & Pre-seeded Selections */}
        <div id="control-bar" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-sm">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-5 flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query municipality (e.g., Tokyo, Austin, Paris...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-md shadow-teal-500/10 flex items-center gap-1.5 shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Analyze"}
            </button>
          </form>

          {/* Quick Predefined Cities */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium px-1">Presets:</span>
            {PRE_SEEDED_CITIES.map((city) => {
              const isActive = currentCity.name.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => fetchWeather(city.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    isActive 
                      ? "bg-teal-500/15 border-teal-500/50 text-teal-300" 
                      : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  {city.name}
                  <span className="text-[10px] text-slate-500 ml-1.5 bg-slate-800/80 px-1 py-0.5 rounded uppercase">
                    {city.code}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Error Handling State Box */}
        {error && (
          <div id="error-box" className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-200 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-grow">
              <h4 className="font-semibold text-sm text-rose-300">Geographic Query Exception</h4>
              <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          /* High-Fidelity Loading State Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12">
            <div className="lg:col-span-8 flex flex-col gap-6 animate-pulse">
              <div className="h-64 bg-slate-800/50 rounded-2xl" />
              <div className="h-44 bg-slate-800/50 rounded-2xl" />
            </div>
            <div className="lg:col-span-4 h-[450px] bg-slate-800/50 rounded-2xl animate-pulse" />
          </div>
        ) : processedData ? (
          
          /* Main Operational Dashboard Workspace */
          <div id="dashboard-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT / CENTER WORKSPACE: Forecast and Active Details */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* PRIMARY CURRENT CONDITIONS CONTAINER */}
              <div id="current-weather-card" className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-slate-950/90 p-6 md:p-8">
                
                {/* Visual Ambient Weather Style Backdrops */}
                <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none -translate-y-12 translate-x-12 ${currentCondition?.colorClass}`} />

                {/* Card Header Information */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800/70">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
                      <MapPin className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-display font-bold text-slate-100">
                          {currentCity.name}
                        </h2>
                        <span className="text-[11px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold border border-slate-700/30">
                          {currentCity.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {currentCity.country} • Lat: {processedData.latitude.toFixed(3)}° Lon: {processedData.longitude.toFixed(3)}°
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Simulation Status</p>
                    {activeScenario === "live" ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Live Feed Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-400 bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Sandbox Overridden
                      </span>
                    )}
                  </div>
                </div>

                {/* Core Live Data Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 items-center">
                  
                  {/* Left Column: Temperature and Condition Hero */}
                  <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-2xl border ${currentCondition?.borderClass} ${currentCondition?.bgClass} shrink-0`}>
                      {currentCondition && (
                        <WeatherIcon name={currentCondition.iconName} className={`w-14 h-14 ${currentCondition.colorClass}`} />
                      )}
                    </div>
                    <div>
                      <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-50 flex items-baseline">
                        {formatTemp(processedData.current_weather.temperature)}
                      </div>
                      <div className="mt-1 flex flex-col">
                        <span className="text-base font-semibold text-slate-200">
                          {currentCondition?.label}
                        </span>
                        <span className="text-xs text-slate-400 italic">
                          {currentCondition?.description}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Diagnostic Indicators Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Wind Speed Indicator */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Wind Velocity</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {processedData.current_weather.windspeed.toFixed(1)} km/h
                        </span>
                      </div>
                    </div>

                    {/* Apparent Real-Feel (Simulated or mapped accurately) */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Apparent</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {formatTemp(processedData.current_weather.temperature + 0.8)}
                        </span>
                      </div>
                    </div>

                    {/* Wind Direction Compass */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Wind Direction</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {processedData.current_weather.winddirection}°
                        </span>
                      </div>
                    </div>

                    {/* Atmospheric Precip Today */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Precip Today</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {processedData.daily.precipitation_sum[0].toFixed(1)} mm
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* 7-DAY FORECAST TIMELINE CONTAINER */}
              <div id="forecast-block" className="rounded-3xl border border-slate-800/80 bg-slate-950/20 p-6 flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <h3 className="text-base font-display font-semibold text-slate-200">
                      7-Day Planning Forecast Outlook
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Click any day card to project operational metrics
                  </p>
                </div>

                {/* Horizontal Daily Scroll/Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {processedData.daily.time.map((date, idx) => {
                    const maxTemp = processedData.daily.temperature_2m_max[idx];
                    const minTemp = processedData.daily.temperature_2m_min[idx];
                    const precipitation = processedData.daily.precipitation_sum[idx];
                    const weathercode = processedData.daily.weathercode[idx];
                    const condition = getWeatherCondition(weathercode);
                    const isSelected = selectedForecastIndex === idx;

                    const dateObj = new Date(date + "T00:00:00");
                    const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
                    const dateLabel = dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedForecastIndex(idx)}
                        className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? "bg-slate-800/80 border-teal-500/60 ring-1 ring-teal-500/20 shadow-md" 
                            : "bg-slate-900/30 border-slate-800/50 hover:bg-slate-900/50 hover:border-slate-700/40"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-300">{dayLabel}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{dateLabel}</span>
                        </div>

                        <div className={`my-3 p-1.5 rounded-lg ${condition.bgClass} text-slate-50`}>
                          <WeatherIcon name={condition.iconName} className={`w-5 h-5 ${condition.colorClass}`} />
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-bold text-slate-100">{formatTemp(maxTemp)}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{formatTemp(minTemp)}</span>
                        </div>

                        {/* Rain likelihood pill */}
                        {precipitation > 0 ? (
                          <span className="mt-2 inline-block text-[9px] font-semibold text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded-full border border-sky-900/30">
                            {precipitation.toFixed(1)} mm
                          </span>
                        ) : (
                          <span className="mt-2 inline-block text-[9px] font-semibold text-slate-600 bg-slate-950/20 px-1.5 py-0.5 rounded-full">
                            Dry
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Expanded Projected Intelligence Metrics */}
                <div id="expanded-forecast-detail" className="p-4 rounded-2xl border border-slate-800 bg-slate-900/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                  
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-teal-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Operational Projection for {new Date(processedData.daily.time[selectedForecastIndex] + "T00:00:00").toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        High Temp of <span className="font-bold text-slate-100">{formatTemp(processedData.daily.temperature_2m_max[selectedForecastIndex])}</span> and Low of <span className="font-bold text-slate-100">{formatTemp(processedData.daily.temperature_2m_min[selectedForecastIndex])}</span>. Weather condition class is <span className="font-bold text-teal-300">{getWeatherCondition(processedData.daily.weathercode[selectedForecastIndex]).label}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">Precipitation Accumulation Risk:</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      processedData.daily.precipitation_sum[selectedForecastIndex] > 10
                        ? "bg-rose-950/40 text-rose-400 border border-rose-900/50"
                        : processedData.daily.precipitation_sum[selectedForecastIndex] > 0
                        ? "bg-amber-950/40 text-amber-400 border border-amber-900/50"
                        : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                    }`}>
                      {processedData.daily.precipitation_sum[selectedForecastIndex].toFixed(1)} mm
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT SIDEBAR: Weather Intelligence Recommendations Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* RECOMMENDED PLANNERS CARD */}
              <div id="intelligence-card" className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col gap-5">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <h3 className="text-base font-display font-bold text-slate-100">
                      Weather Intelligence Advisor
                    </h3>
                  </div>
                  <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-semibold border border-teal-500/20">
                    Decision Engine v2.4
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Real-time rule matrix evaluation applied to forecasted city parameters:
                </p>

                {/* Recommendations Stack */}
                <div className="flex flex-col gap-4">
                  {recommendations.map((rec, index) => {
                    let severityStyles = "";
                    switch (rec.severity) {
                      case "danger":
                        severityStyles = "bg-rose-950/25 border-rose-500/30 text-rose-200";
                        break;
                      case "warning":
                        severityStyles = "bg-amber-950/25 border-amber-500/30 text-amber-200";
                        break;
                      case "success":
                        severityStyles = "bg-emerald-950/25 border-emerald-500/30 text-emerald-200";
                        break;
                      case "info":
                      default:
                        severityStyles = "bg-slate-900/85 border-slate-800 text-slate-300";
                    }

                    return (
                      <div 
                        key={index} 
                        className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${severityStyles}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {rec.domain}
                          </span>
                          <span className={`h-2 w-2 rounded-full ${
                            rec.severity === "danger" ? "bg-rose-500 animate-ping" :
                            rec.severity === "warning" ? "bg-amber-400" :
                            rec.severity === "success" ? "bg-emerald-400" : "bg-slate-400"
                          }`} />
                        </div>
                        <h4 className="font-semibold text-xs text-slate-100 mt-1.5">{rec.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{rec.recommendation}</p>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* SIMULATION SANDBOX / STRESS TEST CARD */}
              <div id="sandbox-card" className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 flex flex-col gap-4">
                
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-display font-bold text-slate-200">
                    Decision Stress Sandbox
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Trigger mock hazardous scenarios to stress-test localized warning protocols and immediate AI recommendations:
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "live", label: "Restore Active Weather Feed", desc: "Live API response stream", activeColor: "border-teal-500 text-teal-300 bg-teal-950/20" },
                    { id: "heatwave", label: "Extreme Heatwaves (41°C)", desc: "Retail & electrical utilities load test", activeColor: "border-rose-500 text-rose-400 bg-rose-950/25" },
                    { id: "blizzard", label: "Winter Blizzard Alert (-7°C)", desc: "Transit routes & ice hazard caution", activeColor: "border-sky-400 text-sky-300 bg-sky-950/20" },
                    { id: "monsoon", label: "Torrential Rain (48mm)", desc: "Flooding & indoor retail planning", activeColor: "border-indigo-500 text-indigo-400 bg-indigo-950/25" },
                    { id: "gale", label: "Severe Gale Force Winds (53 km/h)", desc: "Marine cargo & flight dispatch warnings", activeColor: "border-amber-500 text-amber-400 bg-amber-950/25" }
                  ].map((scenario) => {
                    const isSelected = activeScenario === scenario.id;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => setActiveScenario(scenario.id)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          isSelected 
                            ? scenario.activeColor
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="font-semibold">{scenario.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{scenario.desc}</div>
                      </button>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

        ) : (
          /* Missing State fallbacks */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Info className="w-12 h-12 text-slate-500 mb-4 animate-spin" />
            <p className="text-slate-400 text-sm">Awaiting database connection parameters...</p>
          </div>
        )}

        
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-800/80 bg-slate-950/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Weather Intelligence Platform. All meteorological forecasting data provided via public Open-Meteo services.</p>
          <div className="flex gap-4">
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-all flex items-center gap-1">
              Open-Meteo Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

import { WeatherCondition, WeatherData, IntelligenceRecommendation } from "./types";

// WMO Weather interpretation codes
export function getWeatherCondition(code: number): WeatherCondition {
  switch (code) {
    case 0:
      return {
        label: "Clear Sky",
        iconName: "Sun",
        colorClass: "text-amber-500",
        bgClass: "bg-amber-50/70 dark:bg-amber-950/20",
        borderClass: "border-amber-200/50 dark:border-amber-800/30",
        description: "Optimal blue skies, high solar irradiance.",
      };
    case 1:
    case 2:
    case 3:
      return {
        label: "Partly Cloudy",
        iconName: "CloudSun",
        colorClass: "text-sky-500",
        bgClass: "bg-sky-50/70 dark:bg-sky-950/20",
        borderClass: "border-sky-200/50 dark:border-sky-800/30",
        description: "Scattered cloud cover with brief sunny intervals.",
      };
    case 45:
    case 48:
      return {
        label: "Foggy",
        iconName: "CloudFog",
        colorClass: "text-slate-400",
        bgClass: "bg-slate-50/70 dark:bg-slate-900/20",
        borderClass: "border-slate-200/50 dark:border-slate-800/30",
        description: "Reduced visibility. Plan for low-visibility logistics.",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Drizzle",
        iconName: "CloudDrizzle",
        colorClass: "text-teal-400",
        bgClass: "bg-teal-50/70 dark:bg-teal-950/20",
        borderClass: "border-teal-200/50 dark:border-teal-800/30",
        description: "Light but continuous moisture deposit.",
      };
    case 56:
    case 57:
    case 66:
    case 67:
      return {
        label: "Freezing Rain",
        iconName: "Snowflake",
        colorClass: "text-indigo-400",
        bgClass: "bg-indigo-50/70 dark:bg-indigo-950/20",
        borderClass: "border-indigo-200/50 dark:border-indigo-800/30",
        description: "Ice accumulation likely on surfaces. Travel hazards.",
      };
    case 61:
    case 63:
    case 65:
      return {
        label: "Rain",
        iconName: "CloudRain",
        colorClass: "text-blue-500",
        bgClass: "bg-blue-50/70 dark:bg-blue-950/20",
        borderClass: "border-blue-200/50 dark:border-blue-800/30",
        description: "Precipitation occurring. Carry protection equipment.",
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: "Snowfall",
        iconName: "Snowflake",
        colorClass: "text-sky-300",
        bgClass: "bg-sky-50/70 dark:bg-sky-950/10",
        borderClass: "border-sky-200/50 dark:border-sky-900/20",
        description: "Snow accumulation active. Winter maintenance required.",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Rain Showers",
        iconName: "CloudRainWind",
        colorClass: "text-indigo-500",
        bgClass: "bg-indigo-50/70 dark:bg-indigo-950/20",
        borderClass: "border-indigo-200/50 dark:border-indigo-800/30",
        description: "Sudden heavy rainfall downpours with strong winds.",
      };
    case 85:
    case 86:
      return {
        label: "Snow Showers",
        iconName: "Snowflake",
        colorClass: "text-cyan-300",
        bgClass: "bg-cyan-50/70 dark:bg-cyan-950/10",
        borderClass: "border-cyan-200/50 dark:border-cyan-900/20",
        description: "Intermittent heavy snow squalls. Poor road traction.",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        iconName: "CloudLightning",
        colorClass: "text-red-500",
        bgClass: "bg-red-50/70 dark:bg-red-950/20",
        borderClass: "border-red-200/50 dark:border-red-800/30",
        description: "Severe electrical activity. High lightning risk.",
      };
    default:
      return {
        label: "Overcast",
        iconName: "Cloud",
        colorClass: "text-slate-400",
        bgClass: "bg-slate-50/70 dark:bg-slate-900/20",
        borderClass: "border-slate-200/50 dark:border-slate-800/30",
        description: "Grey skies, low ambient light levels.",
      };
  }
}

// Generate smart weather intelligence recommendation based on current & daily stats
export function generateRecommendations(data: WeatherData): IntelligenceRecommendation[] {
  const currentTemp = data.current_weather.temperature;
  const currentWind = data.current_weather.windspeed;
  const currentCode = data.current_weather.weathercode;
  
  const dailyHighs = data.daily.temperature_2m_max;
  const dailyPrecipitation = data.daily.precipitation_sum;
  const dailyDates = data.daily.time;

  const recommendations: IntelligenceRecommendation[] = [];

  // Finding days with heavy rain / precipitation
  const heavyRainDays: { date: string; value: number }[] = [];
  dailyPrecipitation.forEach((precip, idx) => {
    if (precip > 5.0) {
      const dateName = new Date(dailyDates[idx] + "T00:00:00").toLocaleDateString("en-US", { weekday: 'long' });
      heavyRainDays.push({ date: dateName, value: precip });
    }
  });

  // --- Outdoor & Planning Domain ---
  if (heavyRainDays.length > 0) {
    const daysStr = heavyRainDays.map(d => `${d.date} (${d.value.toFixed(1)}mm)`).join(", ");
    recommendations.push({
      domain: "Outdoor Planning",
      title: "Rain Sheltering Suggested",
      recommendation: `High precipitation expected on ${daysStr}. We strongly recommend scheduling indoor operations or outdoor alternative backups for these windows.`,
      severity: "warning",
    });
  } else if (currentTemp >= 18 && currentTemp <= 26 && currentCode <= 3) {
    recommendations.push({
      domain: "Outdoor Planning",
      title: "Optimal Outdoor Operations",
      recommendation: `Perfect mild weather (${currentTemp}°C) with clear/partly cloudy skies. Excellent window for site visits, surveys, and recreational activities.`,
      severity: "success",
    });
  } else {
    recommendations.push({
      domain: "Outdoor Planning",
      title: "Moderate Visual Conditions",
      recommendation: "Stable meteorological parameters. Standard operations can proceed with regular equipment logs.",
      severity: "info",
    });
  }

  // --- Business & Retail Footfall Domain ---
  if (currentTemp > 33) {
    recommendations.push({
      domain: "Retail & Business",
      title: "High Heatwave Footfall Impact",
      recommendation: `Extreme heat of ${currentTemp}°C may suppress walk-in customer traffic. Recommend boosting digital sales channels and preparing cooling amenities.`,
      severity: "danger",
    });
  } else if (heavyRainDays.length > 2) {
    recommendations.push({
      domain: "Retail & Business",
      title: "Sustained Wet Weather Effect",
      recommendation: "Persistent precipitation over multiple days will depress brick-and-mortar retail conversion. Drive-thru and delivery logistics will see a demand spike.",
      severity: "warning",
    });
  } else if (currentTemp >= 16 && currentTemp <= 25 && heavyRainDays.length === 0) {
    recommendations.push({
      domain: "Retail & Business",
      title: "Peak Footfall Environment",
      recommendation: "Favorable temperatures and dry days ahead present an ideal window for commercial retail footfall, open-air street markets, and cafe patios.",
      severity: "success",
    });
  } else {
    recommendations.push({
      domain: "Retail & Business",
      title: "Stable Commercial Baseline",
      recommendation: "Weather parameters reflect seasonal norms. Expect typical consumer demand cycles and standard footfall volumes.",
      severity: "info",
    });
  }

  // --- Logistics & Logistics Safety ---
  if (currentWind > 24) {
    recommendations.push({
      domain: "Logistics & Transport",
      title: "High Wind Hazard Warning",
      recommendation: `Elevated wind speeds of ${currentWind} km/h detected. Exercise extreme caution during transit, secure loose shipping/outdoor materials, and restrict drone operations.`,
      severity: "danger",
    });
  } else if (currentCode >= 45 && currentCode <= 48) {
    recommendations.push({
      domain: "Logistics & Transport",
      title: "Low Visibility Advisory",
      recommendation: "Foggy conditions are currently reducing visibility thresholds. Ensure transportation assets have auxiliary fog lights active and add buffer times for freight delivery.",
      severity: "warning",
    });
  } else {
    recommendations.push({
      domain: "Logistics & Transport",
      title: "Unimpeded Freight Windows",
      recommendation: "Favorable clear pathways with negligible wind and fog interference. Normal delivery routes and scheduling may be executed without delay.",
      severity: "success",
    });
  }

  // --- Energy & Utilities ---
  if (currentTemp > 28) {
    recommendations.push({
      domain: "Energy Grid",
      title: "Surging Cooling Utility Demand",
      recommendation: "High temperature profile will trigger increased localized HVAC usage. Grid operators should anticipate peak afternoon electricity loads.",
      severity: "warning",
    });
  } else if (currentTemp < 6) {
    recommendations.push({
      domain: "Energy Grid",
      title: "Thermal Heating Surge Risk",
      recommendation: `Chilly conditions (${currentTemp}°C) expected to create high natural gas and electricity draw. Monitor pipeline freeze-ups and ensure boiler operations are pre-heated.`,
      severity: "warning",
    });
  } else {
    recommendations.push({
      domain: "Energy Grid",
      title: "Balanced Utility Load Profile",
      recommendation: "Mild temperatures present ideal steady-state operating conditions for localized municipal grids, resulting in efficient baseload generation.",
      severity: "success",
    });
  }

  return recommendations;
}

// Convert Celsius to Fahrenheit
export function celsiusToFahrenheit(c: number): number {
  return (c * 9/5) + 32;
}

// Pre-seeded popular capital cities to serve as quick selections and default view
export const PRE_SEEDED_CITIES = [
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.0060, code: "US" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, code: "GB" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, code: "JP" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, code: "AU" },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, code: "FR" },
];

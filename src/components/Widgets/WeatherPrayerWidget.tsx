import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Clock, 
  MapPin, 
  Moon, 
  Sunrise, 
  Sunset,
  Sparkles,
  Navigation,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface WeatherPrayerWidgetProps {
  darkMode?: boolean;
  className?: string;
  variant?: 'compact' | 'full' | 'sidebar' | 'epaper';
}

interface CityData {
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
  temp: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain';
  humidity: number;
  windSpeed: number;
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    sehri: string;
    iftar: string;
  };
}

const CITIES: Record<string, CityData> = {
  dhaka: {
    nameBn: 'ঢাকা',
    nameEn: 'Dhaka',
    lat: 23.8103,
    lng: 90.4125,
    temp: 31,
    condition: 'আংশিক মেঘলা',
    icon: 'cloud',
    humidity: 74,
    windSpeed: 12,
    prayerTimes: {
      fajr: '০৪:৩৭',
      sunrise: '০৫:৫২',
      dhuhr: '১১:৫২',
      asr: '০৪:১০',
      maghrib: '০৫:৫১',
      isha: '০৭:০৭',
      sehri: '০৪:৩২',
      iftar: '০৫:৫২',
    },
  },
  chittagong: {
    nameBn: 'চট্টগ্রাম',
    nameEn: 'Chittagong',
    lat: 22.3569,
    lng: 91.7832,
    temp: 30,
    condition: 'রৌদ্রোজ্জ্বল',
    icon: 'sun',
    humidity: 78,
    windSpeed: 15,
    prayerTimes: {
      fajr: '০৪:৩৩',
      sunrise: '০৫:৪৭',
      dhuhr: '১১:৪৭',
      asr: '০৪:০৬',
      maghrib: '০৫:৪৭',
      isha: '০৭:০২',
      sehri: '০৪:২৮',
      iftar: '০৫:৪৮',
    },
  },
  sylhet: {
    nameBn: 'সিলেট',
    nameEn: 'Sylhet',
    lat: 24.8949,
    lng: 91.8687,
    temp: 29,
    condition: 'হালকা বৃষ্টি',
    icon: 'rain',
    humidity: 82,
    windSpeed: 10,
    prayerTimes: {
      fajr: '০৪:৩১',
      sunrise: '০৫:৪৬',
      dhuhr: '১১:৪৬',
      asr: '০৪:০৪',
      maghrib: '০৫:৪৫',
      isha: '০৭:০১',
      sehri: '০৪:২৬',
      iftar: '০৫:৪৬',
    },
  },
  rajshahi: {
    nameBn: 'রাজশাহী',
    nameEn: 'Rajshahi',
    lat: 24.3745,
    lng: 88.6042,
    temp: 32,
    condition: 'রৌদ্রোজ্জ্বল',
    icon: 'sun',
    humidity: 68,
    windSpeed: 11,
    prayerTimes: {
      fajr: '০৪:৪৪',
      sunrise: '০৫:৫৮',
      dhuhr: '১১:৫৮',
      asr: '০৪:১৭',
      maghrib: '০৫:৫৮',
      isha: '০৭:১৪',
      sehri: '০৪:৩৯',
      iftar: '০৫:৫৯',
    },
  },
  khulna: {
    nameBn: 'খুলনা',
    nameEn: 'Khulna',
    lat: 22.8456,
    lng: 89.5403,
    temp: 31,
    condition: 'আংশিক মেঘলা',
    icon: 'cloud',
    humidity: 76,
    windSpeed: 13,
    prayerTimes: {
      fajr: '০৪:৩৯',
      sunrise: '০৫:৫৪',
      dhuhr: '১১:৫৪',
      asr: '০৪:১৩',
      maghrib: '০৫:৫৪',
      isha: '০৭:১০',
      sehri: '০৪:৩৪',
      iftar: '০৫:৫৫',
    },
  },
  barisal: {
    nameBn: 'বরিশাল',
    nameEn: 'Barisal',
    lat: 22.7010,
    lng: 90.3535,
    temp: 31,
    condition: 'আংশিক মেঘলা',
    icon: 'cloud',
    humidity: 77,
    windSpeed: 14,
    prayerTimes: {
      fajr: '০৪:৩৭',
      sunrise: '০৫:৫২',
      dhuhr: '১১:৫২',
      asr: '০৪:১১',
      maghrib: '০৫:৫২',
      isha: '০৭:০৭',
      sehri: '০৪:৩২',
      iftar: '০৫:৫৩',
    },
  },
  rangpur: {
    nameBn: 'রংপুর',
    nameEn: 'Rangpur',
    lat: 25.7439,
    lng: 89.2752,
    temp: 29,
    condition: 'আংশিক মেঘলা',
    icon: 'cloud',
    humidity: 72,
    windSpeed: 11,
    prayerTimes: {
      fajr: '০৪:৪২',
      sunrise: '০৫:৫৬',
      dhuhr: '১১:৫৫',
      asr: '০৪:১৬',
      maghrib: '০৫:৫৬',
      isha: '০৭:১২',
      sehri: '০৪:৩৭',
      iftar: '০৫:৫৭',
    },
  },
  mymensingh: {
    nameBn: 'ময়মনসিংহ',
    nameEn: 'Mymensingh',
    lat: 24.7471,
    lng: 90.4203,
    temp: 30,
    condition: 'হালকা মেঘলা',
    icon: 'cloud',
    humidity: 75,
    windSpeed: 10,
    prayerTimes: {
      fajr: '০৪:৩৬',
      sunrise: '০৫:৫১',
      dhuhr: '১১:৫১',
      asr: '০৪:১০',
      maghrib: '০৫:৫০',
      isha: '০৭:০৬',
      sehri: '০৪:৩১',
      iftar: '০৫:৫১',
    },
  },
  comilla: {
    nameBn: 'কুমিল্লা',
    nameEn: 'Comilla',
    lat: 23.4682,
    lng: 91.1788,
    temp: 31,
    condition: 'রৌদ্রোজ্জ্বল',
    icon: 'sun',
    humidity: 75,
    windSpeed: 12,
    prayerTimes: {
      fajr: '০৪:৩৫',
      sunrise: '০৫:৫০',
      dhuhr: '১১:৫০',
      asr: '০৪:০৮',
      maghrib: '০৫:৪৯',
      isha: '০৭:০৫',
      sehri: '০৪:৩০',
      iftar: '০৫:৫০',
    },
  },
  coxsbazar: {
    nameBn: "কক্সবাজার",
    nameEn: "Cox's Bazar",
    lat: 21.4272,
    lng: 92.0058,
    temp: 30,
    condition: 'সাগরের হাওয়া ও রোদেলা',
    icon: 'sun',
    humidity: 80,
    windSpeed: 18,
    prayerTimes: {
      fajr: '০৪:৩১',
      sunrise: '০৫:৪৫',
      dhuhr: '১১:৪৫',
      asr: '০৪:০৪',
      maghrib: '০৫:৪৫',
      isha: '০৭:০০',
      sehri: '০৪:২৬',
      iftar: '০৫:৪৬',
    },
  },
  bogura: {
    nameBn: 'বগুড়া',
    nameEn: 'Bogura',
    lat: 24.8465,
    lng: 89.3777,
    temp: 31,
    condition: 'আংশিক মেঘলা',
    icon: 'cloud',
    humidity: 70,
    windSpeed: 12,
    prayerTimes: {
      fajr: '০৪:৪১',
      sunrise: '০৫:৫৫',
      dhuhr: '১১:৫৫',
      asr: '০৪:১৪',
      maghrib: '০৫:৫৫',
      isha: '০৭:১১',
      sehri: '০৪:৩৬',
      iftar: '০৫:৫৬',
    },
  },
};

// Calculate distance between two lat/lng pairs
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const WeatherPrayerWidget: React.FC<WeatherPrayerWidgetProps> = ({
  darkMode = false,
  className = '',
  variant = 'sidebar',
}) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('dhaka');
  const [activeTab, setActiveTab] = useState<'both' | 'weather' | 'prayer'>('both');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isGeoDetected, setIsGeoDetected] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);

  // Automatic Geolocation Detection (Requirement 3)
  const detectUserLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closestKey = 'dhaka';
        let minDistance = Infinity;

        Object.entries(CITIES).forEach(([key, data]) => {
          const dist = getDistance(latitude, longitude, data.lat, data.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestKey = key;
          }
        });

        setSelectedCityKey(closestKey);
        setIsGeoDetected(true);
        setDetectedLocationName(CITIES[closestKey]?.nameBn || 'শনাক্তকৃত শহর');
        setIsDetectingLocation(false);
      },
      (err) => {
        // Fallback gracefully without alerting user
        console.warn('Geolocation fallback to default division:', err.message);
        setIsDetectingLocation(false);
      },
      { timeout: 7000, maximumAge: 600000 }
    );
  };

  useEffect(() => {
    // Attempt automatic geolocation detection on initial mount
    detectUserLocation();
  }, []);

  const city = CITIES[selectedCityKey] || CITIES.dhaka;

  const renderWeatherIcon = (type: 'sun' | 'cloud' | 'rain') => {
    switch (type) {
      case 'sun':
        return <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 animate-spin-slow shrink-0" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 shrink-0" />;
      case 'cloud':
      default:
        return <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />;
    }
  };

  /* ================= COMPACT VARIANT (FOR FOOTER / HEADER STRIP) ================= */
  if (variant === 'compact') {
    return (
      <div
        className={`w-full rounded-2xl border transition-all p-3.5 sm:p-4 font-solaiman shadow-xs ${
          darkMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        } ${className}`}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left: Location & Weather Summary */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    লাইভ আবহাওয়া ও নামাজের সময়সূচি
                  </span>
                  {isGeoDetected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>জিপিএস অটো-ডিটেক্ট</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  <span>অবস্থান:</span>
                  <select
                    value={selectedCityKey}
                    onChange={(e) => {
                      setSelectedCityKey(e.target.value);
                      setIsGeoDetected(false);
                    }}
                    className="font-bold bg-transparent text-slate-800 dark:text-slate-200 border-0 outline-none cursor-pointer underline hover:text-red-600"
                  >
                    {Object.entries(CITIES).map(([key, data]) => (
                      <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {data.nameBn} জেলা
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={detectUserLocation}
                    disabled={isDetectingLocation}
                    className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="আমার অবস্থান পুনরায় শনাক্ত করুন"
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-red-600" />
                    ) : (
                      <Navigation className="w-2.5 h-2.5 text-red-600" />
                    )}
                    <span>{isDetectingLocation ? 'শনাক্ত হচ্ছে...' : 'রি-ডিটেক্ট'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Weather Capsule */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/50 dark:border-slate-700">
              {renderWeatherIcon(city.icon)}
              <div>
                <span className="text-sm font-black font-latin text-slate-900 dark:text-white">
                  {city.temp}°C
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold ml-1.5">
                  {city.condition}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2">
                বাতাস: {city.windSpeed} কিমি
              </span>
            </div>
          </div>

          {/* Right: 5 Daily Prayer Times Strip */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-1">
              <Moon className="w-3.5 h-3.5" />
              <span>ওয়াক্ত:</span>
            </span>
            {[
              { name: 'ফজর', time: city.prayerTimes.fajr },
              { name: 'যোহর', time: city.prayerTimes.dhuhr },
              { name: 'আসর', time: city.prayerTimes.asr },
              { name: 'মাগরিব', time: city.prayerTimes.maghrib },
              { name: 'এশা', time: city.prayerTimes.isha },
            ].map((p, idx) => (
              <div
                key={idx}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center"
              >
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{p.name}</div>
                <div className="text-xs font-black text-slate-900 dark:text-white font-latin">{p.time}</div>
              </div>
            ))}

            <div className="hidden sm:flex items-center gap-2 pl-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
              <span>সেহরি: {city.prayerTimes.sehri}</span>
              <span>•</span>
              <span>ইফতার: {city.prayerTimes.iftar}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= BROADSHEET E-PAPER VARIANT (FOR PRINTED DIGITAL EDITION) ================= */
  if (variant === 'epaper') {
    return (
      <div
        className={`w-full bg-white text-slate-900 border border-slate-300 shadow-2xs p-3 font-solaiman ${className}`}
      >
        {/* Top Broadsheet Micro-Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-serif-bangla">
              আজকের আবহাওয়া ও নামাজের সময়সূচি (মুদ্রিত সংস্করণ)
            </h4>
          </div>

          {/* District Selector & GPS Re-detect */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <MapPin className="w-3 h-3 text-red-600 shrink-0" />
            <select
              value={selectedCityKey}
              onChange={(e) => {
                setSelectedCityKey(e.target.value);
                setIsGeoDetected(false);
              }}
              className="font-bold bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-slate-900 text-[10.5px] outline-none cursor-pointer"
            >
              {Object.entries(CITIES).map(([key, data]) => (
                <option key={key} value={key} className="bg-white text-slate-900">
                  {data.nameBn} জেলা
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={detectUserLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              title="অবস্থান শনাক্তকরণ"
            >
              {isDetectingLocation ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-red-600" />
              ) : (
                <Navigation className="w-2.5 h-2.5 text-red-600" />
              )}
              <span>{isDetectingLocation ? 'শনাক্ত...' : 'জিপিএস'}</span>
            </button>
          </div>
        </div>

        {/* Weather & Prayer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Weather Capsule (4 cols) */}
          <div className="sm:col-span-4 flex items-center gap-2.5 bg-slate-50/80 p-2 border border-slate-200 rounded-xs">
            {renderWeatherIcon(city.icon)}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black font-latin text-slate-950">
                  {city.temp}°C
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {city.condition}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 flex items-center gap-2 mt-0.5">
                <span>আর্দ্রতা: {city.humidity}%</span>
                <span>•</span>
                <span>বাতাস: {city.windSpeed} কিমি</span>
              </div>
            </div>
          </div>

          {/* 5 Daily Prayer Times Strip (8 cols) */}
          <div className="sm:col-span-8 flex flex-wrap items-center justify-between gap-1 sm:gap-1.5 bg-slate-50/50 p-1.5 border border-slate-200 rounded-xs">
            <span className="text-[10.5px] font-black text-emerald-800 flex items-center gap-1 mr-1">
              <Moon className="w-3 h-3 text-emerald-600" />
              <span>ওয়াক্ত:</span>
            </span>

            {[
              { name: 'ফজর', time: city.prayerTimes.fajr },
              { name: 'যোহর', time: city.prayerTimes.dhuhr },
              { name: 'আসর', time: city.prayerTimes.asr },
              { name: 'মাগরিব', time: city.prayerTimes.maghrib },
              { name: 'এশা', time: city.prayerTimes.isha },
            ].map((p, idx) => (
              <div
                key={idx}
                className="px-2 py-0.5 bg-white border border-slate-300 text-center rounded-2xs shadow-2xs"
              >
                <div className="text-[9px] font-bold text-slate-600">{p.name}</div>
                <div className="text-xs font-black text-slate-950 font-latin leading-tight">{p.time}</div>
              </div>
            ))}

            <div className="text-[10px] font-bold text-emerald-900 border-l border-slate-300 pl-2">
              <div>সেহরি: <span className="font-latin">{city.prayerTimes.sehri}</span></div>
              <div>ইফতার: <span className="font-latin">{city.prayerTimes.iftar}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= STANDARD / SIDEBAR VARIANT ================= */
  return (
    <div
      className={`rounded-2xl border transition-all shadow-xs overflow-hidden ${
        darkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold font-solaiman text-xs text-slate-900 dark:text-white">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>আবহাওয়া ও নামাজের সময়সূচি</span>
        </div>

        {/* City Selector & Auto Geolocation Button */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
            <select
              value={selectedCityKey}
              onChange={(e) => {
                setSelectedCityKey(e.target.value);
                setIsGeoDetected(false);
              }}
              className="text-[11px] font-bold font-solaiman bg-transparent text-slate-800 dark:text-slate-200 border-0 outline-none cursor-pointer pr-1"
            >
              {Object.entries(CITIES).map(([key, data]) => (
                <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {data.nameBn}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={detectUserLocation}
            disabled={isDetectingLocation}
            className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
            title="আমার অবস্থান অটো ডিটেক্ট করুন (GPS Detection)"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-3 h-3 animate-spin text-red-600" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Geolocation Status Badge */}
      {isGeoDetected && (
        <div className="px-3.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300 font-solaiman font-bold">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>স্বয়ংক্রিয় শনাক্তকৃত জেলা: {city.nameBn}</span>
          </span>
          <span className="text-[9px] uppercase font-mono text-emerald-600 dark:text-emerald-400">GPS Live</span>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold font-solaiman">
        <button
          onClick={() => setActiveTab('both')}
          className={`flex-1 py-1.5 text-center transition-colors cursor-pointer ${
            activeTab === 'both'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20 dark:bg-red-950/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          উভয়
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`flex-1 py-1.5 text-center transition-colors cursor-pointer ${
            activeTab === 'weather'
              ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/20 dark:bg-amber-950/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          আবহাওয়া
        </button>
        <button
          onClick={() => setActiveTab('prayer')}
          className={`flex-1 py-1.5 text-center transition-colors cursor-pointer ${
            activeTab === 'prayer'
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          নামাজ
        </button>
      </div>

      <div className="p-3 space-y-3 font-solaiman">
        {/* Weather Block */}
        {(activeTab === 'both' || activeTab === 'weather') && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:from-slate-800/60 dark:to-slate-800/30 border border-amber-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {renderWeatherIcon(city.icon)}
                <div>
                  <div className="text-xl font-black font-latin tracking-tight text-slate-900 dark:text-white leading-none">
                    {city.temp}°<span className="text-sm font-semibold text-slate-500">C</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-solaiman mt-0.5">
                    {city.condition}
                  </div>
                </div>
              </div>

              <div className="text-[10px] space-y-0.5 text-right font-solaiman text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-end gap-1">
                  <Droplets className="w-3 h-3 text-sky-500" />
                  <span>আর্দ্রতা: {city.humidity}%</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Wind className="w-3 h-3 text-teal-500" />
                  <span>বাতাস: {city.windSpeed} কিমি/ঘণ্টা</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times Grid */}
        {(activeTab === 'both' || activeTab === 'prayer') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 font-solaiman px-0.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Moon className="w-3.5 h-3.5" />
                <span>নামাজের ওয়াক্ত ({city.nameBn}):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">লাইভ ক্যালেন্ডার</span>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center font-solaiman">
              {[
                { name: 'ফজর', time: city.prayerTimes.fajr },
                { name: 'যোহর', time: city.prayerTimes.dhuhr },
                { name: 'আসর', time: city.prayerTimes.asr },
                { name: 'মাগরিব', time: city.prayerTimes.maghrib },
                { name: 'এশা', time: city.prayerTimes.isha },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{p.name}</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{p.time}</div>
                </div>
              ))}
            </div>

            {/* Sehri & Iftar Quick Bar */}
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-[10px] font-solaiman text-emerald-900 dark:text-emerald-300 font-bold">
              <span className="flex items-center gap-1">
                <Sunrise className="w-3 h-3 text-amber-500" />
                সেহরি শেষ: {city.prayerTimes.sehri}
              </span>
              <span className="flex items-center gap-1">
                <Sunset className="w-3 h-3 text-rose-500" />
                ইফতার: {city.prayerTimes.iftar}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

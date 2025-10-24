import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SelectedSchemePage = () => {
  const { schemeCode } = useParams();
  const navigate = useNavigate();
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('current'); // 'year', 'month', 'current'
  const [dataAvailability, setDataAvailability] = useState({
    year: true,
    month: true,
    current: true
  });

  useEffect(() => {
    fetch(`https://api.mfapi.in/mf/${schemeCode}`)
      .then((res) => res.json())
      .then((json) => {
        setSchemeData(json);
        
        // Check data availability for each time period
        const allData = Array.isArray(json.data) ? json.data : [];
        if (allData.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Check for year data
          const yearDate = new Date(today);
          yearDate.setMonth(today.getMonth() - 12);
          const yearData = allData.filter(item => {
            const dateParts = item.date.split('-');
            const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= yearDate && itemDate <= today;
          });
          
          // Check for month data
          const monthDate = new Date(today);
          monthDate.setMonth(today.getMonth() - 1);
          const monthData = allData.filter(item => {
            const dateParts = item.date.split('-');
            const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= monthDate && itemDate <= today;
          });
          
          // Check for current (10 days) data
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() - 10);
          const currentData = allData.filter(item => {
            const dateParts = item.date.split('-');
            const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= currentDate && itemDate <= today;
          });
          
          setDataAvailability({
            year: yearData.length > 0,
            month: monthData.length > 0,
            current: currentData.length > 0
          });
          
          // Set default filter to first available period
          if (currentData.length > 0) {
            setTimeFilter('current');
          } else if (monthData.length > 0) {
            setTimeFilter('month');
          } else if (yearData.length > 0) {
            setTimeFilter('year');
          }
        }
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [schemeCode]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
          <svg className="animate-spin h-16 w-16 text-blue-400 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-slate-300 text-xl mt-8 font-light tracking-wide">Loading scheme details</p>
      </div>
    );

  if (!schemeData) 
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4">
          <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p className="text-slate-400 text-lg">No scheme data found</p>
      </div>
    );

  // Filter data based on selected time period (exact calculation from today)
  const getFilteredData = () => {
    const allData = Array.isArray(schemeData.data) ? schemeData.data : [];
    if (allData.length === 0) return [];
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate target date based on filter
    let targetDate = new Date(today);
    
    switch(timeFilter) {
      case 'year':
        // Exactly 12 months back from today
        targetDate.setMonth(today.getMonth() - 12);
        break;
      case 'month':
        // Exactly 1 month back from today
        targetDate.setMonth(today.getMonth() - 1);
        break;
      case 'current':
      default:
        // Exactly 10 days back from today
        targetDate.setDate(today.getDate() - 10);
        break;
    }
    
    // Filter data that falls within the date range
    return allData.filter(item => {
      // Parse date from API (format: "DD-MM-YYYY")
      const dateParts = item.date.split('-');
      const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      itemDate.setHours(0, 0, 0, 0);
      
      // Include data from target date to today
      return itemDate >= targetDate && itemDate <= today;
    });
  };

  const navEntries = getFilteredData();
  const hasData = navEntries.length > 0;
  const chronological = hasData ? [...navEntries].reverse() : [];
  const labels = chronological.map((d) => d.date);
  const navValues = chronological.map((d) => parseFloat(d.nav?.replace(/,/g, "")) || 0);

  // Calculate performance metrics
  const latestNav = navValues[navValues.length - 1] || 0;
  const oldestNav = navValues[0] || 0;
  const change = latestNav - oldestNav;
  const changePercent = oldestNav !== 0 ? ((change / oldestNav) * 100).toFixed(2) : 0;
  const isPositive = change >= 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: "NAV (₹)",
        data: navValues,
        backgroundColor: navValues.map((_, idx) => {
          const alpha = 0.3 + (idx / navValues.length) * 0.5;
          return `rgba(59, 130, 246, ${alpha})`;
        }),
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(96, 165, 250, 0.9)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#cbd5e1",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(59, 130, 246, 0.3)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: timeFilter === 'year' ? 12 : 8,
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(71, 85, 105, 0.2)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          callback: (value) => `₹${value}`,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const getTimePeriodText = () => {
    const today = new Date();
    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    };
    
    let startDate = new Date(today);
    
    switch(timeFilter) {
      case 'year':
        startDate.setMonth(today.getMonth() - 12);
        return `Last 12 months (${formatDate(startDate)} to ${formatDate(today)})`;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        return `Last 1 month (${formatDate(startDate)} to ${formatDate(today)})`;
      case 'current':
        startDate.setDate(today.getDate() - 10);
        return `Last 10 days (${formatDate(startDate)} to ${formatDate(today)})`;
      default:
        return 'Current period';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span className="font-medium">Back to All Schemes</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Scheme Header Card */}
        <div className="mb-6 p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-3">
                <span className="text-xs font-mono text-blue-400">#{schemeCode}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {schemeData.meta.scheme_name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-slate-400">Fund House:</span>
                  <span className="text-slate-200 font-medium">{schemeData.meta.fund_house}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-slate-200 font-medium">{schemeData.meta.scheme_type}</span>
                </div>
              </div>
            </div>

            {/* Performance Card */}
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 min-w-[200px]">
              <p className="text-slate-400 text-sm mb-2">Current NAV</p>
              {hasData ? (
                <>
                  <p className="text-3xl font-bold text-white mb-2">₹{latestNav.toFixed(2)}</p>
                  <div className={`flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <svg className={`w-5 h-5 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <span className="font-semibold">{isPositive ? '+' : ''}{changePercent}%</span>
                    <span className="text-xs text-slate-500">({navValues.length} days)</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-600 mb-2">--</p>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-sm">No data available</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-6 p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">NAV Performance</h2>
              <p className="text-slate-400 text-sm">{getTimePeriodText()} trend analysis</p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <span className="text-blue-400 text-sm font-medium">Bar Chart View</span>
            </div>
          </div>
          <div className="h-[400px] p-4 rounded-xl bg-slate-900/30">
            {hasData ? (
              <Bar data={chartData} options={options} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4">
                  <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <p className="text-slate-400 text-xl font-medium mb-2">No Data Available</p>
                <p className="text-slate-500 text-sm">
                  {timeFilter === 'year' && 'No data available for the previous 1 year period'}
                  {timeFilter === 'month' && 'No data available for the previous 1 month period'}
                  {timeFilter === 'current' && 'No data available for the previous 10 days period'}
                </p>
                <p className="text-slate-600 text-xs mt-2">Try selecting a different time period</p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <button 
              onClick={() => dataAvailability.year && setTimeFilter('year')}
              disabled={!dataAvailability.year}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.year 
                  ? 'opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30' 
                  : timeFilter === 'year' 
                    ? 'from-blue-500/30 to-blue-600/30 border-blue-400 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5' 
                    : 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/20 hover:-translate-y-0.5'
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${
                !dataAvailability.year
                  ? ''
                  : timeFilter === 'year'
                    ? 'from-blue-500/10 to-blue-600/10'
                    : 'from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10'
              }`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.year ? 'text-blue-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.year ? 'text-white' : 'text-slate-600'}`}>
                  Previous 1 Year
                </span>
              </div>
              {!dataAvailability.year && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>

            <button 
              onClick={() => dataAvailability.month && setTimeFilter('month')}
              disabled={!dataAvailability.month}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.month 
                  ? 'opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30' 
                  : timeFilter === 'month' 
                    ? 'from-cyan-500/30 to-cyan-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5' 
                    : 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:-translate-y-0.5'
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${
                !dataAvailability.month
                  ? ''
                  : timeFilter === 'month'
                    ? 'from-cyan-500/10 to-cyan-600/10'
                    : 'from-cyan-500/0 to-cyan-600/0 group-hover:from-cyan-500/10 group-hover:to-cyan-600/10'
              }`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.month ? 'text-cyan-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.month ? 'text-white' : 'text-slate-600'}`}>
                  Previous 1 Month
                </span>
              </div>
              {!dataAvailability.month && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>

            <button 
              onClick={() => dataAvailability.current && setTimeFilter('current')}
              disabled={!dataAvailability.current}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.current 
                  ? 'opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30' 
                  : timeFilter === 'current' 
                    ? 'from-purple-500/30 to-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5' 
                    : 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/20 hover:-translate-y-0.5'
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${
                !dataAvailability.current
                  ? ''
                  : timeFilter === 'current'
                    ? 'from-purple-500/10 to-purple-600/10'
                    : 'from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/10'
              }`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.current ? 'text-purple-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.current ? 'text-white' : 'text-slate-600'}`}>
                  Current (10 Days)
                </span>
              </div>
              {!dataAvailability.current && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* NAV History Table */}
        <div className="p-8 rounded-2xl from-slate-800/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Recent NAV History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">#</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Date</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">NAV (₹)</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Change</th>
                </tr>
              </thead>
              <tbody>
                {schemeData.data.slice(0, 10).map((navItem, idx) => {
                  const currentNav = parseFloat(navItem.nav?.replace(/,/g, "")) || 0;
                  const prevNav = idx < schemeData.data.length - 1 
                    ? parseFloat(schemeData.data[idx + 1].nav?.replace(/,/g, "")) || 0 
                    : currentNav;
                  const dayChange = currentNav - prevNav;
                  const dayChangePercent = prevNav !== 0 ? ((dayChange / prevNav) * 100).toFixed(2) : 0;
                  const isDayPositive = dayChange >= 0;

                  return (
                    <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors duration-200">
                      <td className="py-4 px-4 text-slate-500 text-sm">{idx + 1}</td>
                      <td className="py-4 px-4 text-slate-300">{navItem.date}</td>
                      <td className="py-4 px-4 text-right font-mono text-white font-medium">₹{navItem.nav}</td>
                      <td className="py-4 px-4 text-right">
                        {idx === schemeData.data.length - 1 ? (
                          <span className="text-slate-600 text-sm">—</span>
                        ) : (
                          <span className={`flex items-center justify-end gap-1 text-sm font-medium ${isDayPositive ? 'text-green-400' : 'text-red-400'}`}>
                            <svg className={`w-4 h-4 ${isDayPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                            </svg>
                            {isDayPositive ? '+' : ''}{dayChangePercent}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedSchemePage;
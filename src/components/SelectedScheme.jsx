import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SelectedSchemePage = () => {
  const { schemeCode } = useParams();
  const navigate = useNavigate();

  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("one_month");
  const [chartType, setChartType] = useState("line");

  const [dataAvailability, setDataAvailability] = useState({
    max_period: true,
    five_year: true,
    two_year: true,
    one_year: true,
    six_month: true,
    one_month: true,
  });

  const chartRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.mfapi.in/mf/${schemeCode}`)
      .then((res) => res.json())
      .then((json) => {
        setSchemeData(json);

        const allData = Array.isArray(json.data) ? json.data : [];
        const hasAnyData = allData.length > 0;

        if (hasAnyData) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const maxPeriodData = allData;

          const fiveYearDate = new Date(today);
          fiveYearDate.setMonth(today.getMonth() - 60);
          const fiveYearData = allData.filter((item) => {
            const dateParts = item.date.split("-");
            const itemDate = new Date(
              dateParts[2],
              dateParts[1] - 1,
              dateParts[0]
            );
            return itemDate >= fiveYearDate && itemDate <= today;
          });

          const twoYearDate = new Date(today);
          twoYearDate.setMonth(today.getMonth() - 24);
          const twoYearData = allData.filter((item) => {
            const dateParts = item.date.split("-");
            const itemDate = new Date(
              dateParts[2],
              dateParts[1] - 1,
              dateParts[0]
            );
            return itemDate >= twoYearDate && itemDate <= today;
          });

          const oneYearDate = new Date(today);
          oneYearDate.setMonth(today.getMonth() - 12);
          const oneYearData = allData.filter((item) => {
            const dateParts = item.date.split("-");
            const itemDate = new Date(
              dateParts[2],
              dateParts[1] - 1,
              dateParts[0]
            );
            return itemDate >= oneYearDate && itemDate <= today;
          });

          const sixMonthDate = new Date(today);
          sixMonthDate.setMonth(today.getMonth() - 6);
          const sixMonthData = allData.filter((item) => {
            const dateParts = item.date.split("-");
            const itemDate = new Date(
              dateParts[2],
              dateParts[1] - 1,
              dateParts[0]
            );
            return itemDate >= sixMonthDate && itemDate <= today;
          });

          const oneMonthDate = new Date(today);
          oneMonthDate.setMonth(today.getMonth() - 1);
          const oneMonthData = allData.filter((item) => {
            const dateParts = item.date.split("-");
            const itemDate = new Date(
              dateParts[2],
              dateParts[1] - 1,
              dateParts[0]
            );
            return itemDate >= oneMonthDate && itemDate <= today;
          });

          setDataAvailability({
            max_period: maxPeriodData.length > 0,
            five_year: fiveYearData.length > 0,
            two_year: twoYearData.length > 0,
            one_year: oneYearData.length > 0,
            six_month: sixMonthData.length > 0,
            one_month: oneMonthData.length > 0,
          });

          // Default time filter to the largest available period
          if (maxPeriodData.length > 0) {
            setTimeFilter("max_period");
            setChartType("line");
          } else if (fiveYearData.length > 0) {
            setTimeFilter("five_year");
            setChartType("line");
          } else if (twoYearData.length > 0) {
            setTimeFilter("two_year");
            setChartType("line");
          } else if (oneYearData.length > 0) {
            setTimeFilter("one_year");
            setChartType("line");
          } else if (sixMonthData.length > 0) {
            setTimeFilter("six_month");
            setChartType("line");
          } else if (oneMonthData.length > 0) {
            setTimeFilter("one_month");
            setChartType("line");
          } else {
            setChartType("bar"); // fallback
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
          <svg
            className="animate-spin h-16 w-16 text-blue-400 relative z-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-slate-300 text-xl mt-8 font-light tracking-wide">
          Loading scheme details
        </p>
      </div>
    );

  if (!schemeData)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4">
          <svg
            className="w-12 h-12 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <p className="text-slate-400 text-lg">No scheme data found</p>
      </div>
    );

  // --- Data Filtering Logic ---
  const getFilteredData = () => {
    const allData = Array.isArray(schemeData.data) ? schemeData.data : [];
    if (allData.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDate = new Date(today);

    switch (timeFilter) {
      case "max_period":
        return allData;
      case "five_year":
        targetDate.setMonth(today.getMonth() - 60);
        break;
      case "two_year":
        targetDate.setMonth(today.getMonth() - 24);
        break;
      case "one_year":
        targetDate.setMonth(today.getMonth() - 12);
        break;
      case "six_month":
        targetDate.setMonth(today.getMonth() - 6);
        break;
      case "one_month":
      default:
        targetDate.setMonth(today.getMonth() - 1);
        break;
    }

    return allData.filter((item) => {
      const dateParts = item.date.split("-");
      const itemDate = new Date(
        dateParts[2],
        dateParts[1] - 1,
        dateParts[0]
      );
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= targetDate && itemDate <= today;
    });
  };

  const navEntries = getFilteredData(); // This is newest-first because API returns newest-first
  const hasData = navEntries.length > 0;

  // For chart use chronological (oldest-first)
  const chronological = hasData ? [...navEntries].reverse() : [];

  const labels = chronological.map((d) => d.date);
  const navValues = chronological.map(
    (d) => parseFloat(d.nav?.replace(/,/g, "")) || 0
  );

  // Performance metrics
  const latestNav = navValues[navValues.length - 1] || 0;
  const oldestNav = navValues[0] || 0;
  const change = latestNav - oldestNav;
  const changePercent = oldestNav !== 0 ? ((change / oldestNav) * 100).toFixed(2) : 0;
  const isPositive = change >= 0;

  // Y-axis min calculation
  const lowestNav = navValues.length > 0 ? Math.min(...navValues) : 0;
  const yAxisMin = lowestNav > 0 ? lowestNav - 0.1 : 0;

  // Chart data
  const chartData = {
    labels,
    datasets: [
      ...(chartType === "line"
        ? [
            {
              label: "NAV (₹)",
              data: navValues,
              borderColor: (context) => {
                const index = context.dataIndex;
                if (index === 0) return "rgba(34, 197, 94, 1)";
                const currentNav = context.dataset.data[index];
                const previousNav = context.dataset.data[index - 1];
                if (currentNav < previousNav) return "rgba(239, 68, 68, 1)";
                return "rgba(34, 197, 94, 1)";
              },
              borderWidth: 1.5,
              type: "line",
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.3,
              backgroundColor: "rgba(51, 65, 85, 0.7)",
              fill: "origin",
            },
          ]
        : []),
      ...(chartType === "bar"
        ? [
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
              type: "bar",
            },
          ]
        : []),
    ],
  };

  const currentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        caretPadding: 20,
        caretSize: 0,
        external: function (context) {
          const { chart, tooltip } = context;
          if (!tooltip.dataPoints) return;
          const position = tooltip.caretX;
          const yAxis = chart.scales.y;
          chart.ctx.save();
          chart.ctx.beginPath();
          chart.ctx.setLineDash([4, 4]);
          chart.ctx.strokeStyle = "#94a3b8";
          chart.ctx.lineWidth = 1;
          chart.ctx.moveTo(position, yAxis.top);
          chart.ctx.lineTo(position, yAxis.bottom);
          chart.ctx.stroke();
          chart.ctx.restore();
        },
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#cbd5e1",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(59, 130, 246, 0.3)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `NAV: ₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        min: yAxisMin,
        beginAtZero: false,
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
    },
  };

  // Time period text
  const getTimePeriodText = () => {
    const today = new Date();
    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, "0")}-${(
        d.getMonth() +
        1
      )
        .toString()
        .padStart(2, "0")}-${d.getFullYear()}`;
    };

    let startDate = new Date(today);

    switch (timeFilter) {
      case "max_period":
        if (schemeData.data.length > 0) {
          const rawOldest = schemeData.data[schemeData.data.length - 1];
          const dateParts = rawOldest.date.split("-");
          const inceptionDate = new Date(
            dateParts[2],
            dateParts[1] - 1,
            dateParts[0]
          );
          return `Max Period (${formatDate(inceptionDate)} to ${formatDate(
            today
          )})`;
        }
        return `Max Period (Data not available)`;
      case "five_year":
        startDate.setMonth(today.getMonth() - 60);
        return `Last 5 Years (${formatDate(startDate)} to ${formatDate(today)})`;
      case "two_year":
        startDate.setMonth(today.getMonth() - 24);
        return `Last 2 Years (${formatDate(startDate)} to ${formatDate(today)})`;
      case "one_year":
        startDate.setMonth(today.getMonth() - 12);
        return `Last 1 Year (${formatDate(startDate)} to ${formatDate(today)})`;
      case "six_month":
        startDate.setMonth(today.getMonth() - 6);
        return `Last 6 Months (${formatDate(startDate)} to ${formatDate(today)})`;
      case "one_month":
      default:
        startDate.setMonth(today.getMonth() - 1);
        return `Last 1 Month (${formatDate(startDate)} to ${formatDate(today)})`;
    }
  };

  const renderChart = () => {
    if (!hasData) return null;
    return <Chart ref={chartRef} type={chartType} data={chartData} options={currentOptions} />;
  };

  const tableData = navEntries; // e.g., navEntries.slice(0, 100) to limit to 100 rows



  // yearly data //
  // ---------------- YEARLY AGGREGATION (place after navEntries is available) ----------------
const parseNav = (navString) => parseFloat((navString || "0").replace(/,/g, ""));

// Build a map: year -> { year, nav (latest in that year), date, count }
const yearlyMap = new Map();
(navEntries || []).forEach((item) => {
  const dateParts = item.date.split("-");
  const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  const year = itemDate.getFullYear();
  const nav = parseNav(item.nav);

  // navEntries is newest-first, so first occurrence for a year is the latest NAV in that year
  if (!yearlyMap.has(year)) {
    yearlyMap.set(year, { year, nav, date: item.date, count: 1 });
  } else {
    const prev = yearlyMap.get(year);
    prev.count = (prev.count || 1) + 1; // optional metadata
    yearlyMap.set(year, prev);
  }
});

// Convert to array sorted from current year -> oldest
const yearsArrayDesc = Array.from(yearlyMap.values()).sort((a, b) => b.year - a.year);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors duration-300 group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
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
                  <div className={`flex items-center gap-2 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    <svg className={`w-5 h-5 ${isPositive ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <span className="font-semibold">{isPositive ? "+" : ""}{changePercent}%</span>
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

            {/* Chart Type Selector */}
            <div className="flex space-x-2 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  chartType === "bar"
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  chartType === "line"
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="h-[400px] p-4 rounded-xl bg-slate-900/30">
            {hasData ? (
              renderChart()
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4">
                  <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <p className="text-slate-400 text-xl font-medium mb-2">No Data Available</p>
                <p className="text-slate-500 text-sm">No NAV data available for this time period. Try selecting a different time period.</p>
                <p className="text-slate-600 text-xs mt-2">Try selecting a different time period</p>
              </div>
            )}
          </div>

          {/* Action Buttons (Time Filters) */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mt-6">
            {/* Max Period */}
            <button
              onClick={() => dataAvailability.max_period && setTimeFilter("max_period")}
              disabled={!dataAvailability.max_period}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.max_period
                  ? "opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30"
                  : timeFilter === "max_period"
                  ? "from-yellow-500/30 to-yellow-600/30 border-yellow-400 shadow-lg shadow-yellow-500/20 hover:-translate-y-0.5"
                  : "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:border-yellow-400 hover:shadow-yellow-500/20 hover:-translate-y-0.5"
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${!dataAvailability.max_period ? "" : timeFilter === "max_period" ? "from-yellow-500/10 to-yellow-600/10" : "from-yellow-500/0 to-yellow-600/0 group-hover:from-yellow-500/10 group-hover:to-yellow-600/10"}`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.max_period ? "text-yellow-400" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 012 2v2a2 2 0 01-2 2m0-6a2 2 0 00-2 2v2a2 2 0 002 2M5 9h2m-2 0a2 2 0 00-2 2v2a2 2 0 002 2m0-4a2 2 0 012 2v2a2 2 0 01-2 2m14-4h-2m2 0a2 2 0 01-2 2v2a2 2 0 01-2 2m0-4a2 2 0 00-2 2v2a2 2 0 002 2M9 16h6m-3-4v8m-4 0v4m8-4v4"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.max_period ? "text-white" : "text-slate-600"}`}>Max</span>
              </div>
              {!dataAvailability.max_period && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>

            {/* 5 Years */}
            <button
              onClick={() => dataAvailability.five_year && setTimeFilter("five_year")}
              disabled={!dataAvailability.five_year}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.five_year
                  ? "opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30"
                  : timeFilter === "five_year"
                  ? "from-red-500/30 to-red-600/30 border-red-400 shadow-lg shadow-red-500/20 hover:-translate-y-0.5"
                  : "from-red-500/20 to-red-600/20 border-red-500/30 hover:border-red-400 hover:shadow-red-500/20 hover:-translate-y-0.5"
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${!dataAvailability.five_year ? "" : timeFilter === "five_year" ? "from-red-500/10 to-red-600/10" : "from-red-500/0 to-red-600/0 group-hover:from-red-500/10 group-hover:to-red-600/10"}`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.five_year ? "text-red-400" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.five_year ? "text-white" : "text-slate-600"}`}>5 Years</span>
              </div>
              {!dataAvailability.five_year && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>

            {/* 2 Years */}
            <button
              onClick={() => dataAvailability.two_year && setTimeFilter("two_year")}
              disabled={!dataAvailability.two_year}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.two_year
                  ? "opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30"
                  : timeFilter === "two_year"
                  ? "from-blue-500/30 to-blue-600/30 border-blue-400 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                  : "from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/20 hover:-translate-y-0.5"
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${!dataAvailability.two_year ? "" : timeFilter === "two_year" ? "from-blue-500/10 to-blue-600/10" : "from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10"}`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.two_year ? "text-blue-400" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.two_year ? "text-white" : "text-slate-600"}`}>2 Years</span>
              </div>
              {!dataAvailability.two_year && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>

            {/* 1 Year */}
            <button
              onClick={() => dataAvailability.one_year && setTimeFilter("one_year")}
              disabled={!dataAvailability.one_year}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.one_year
                  ? "opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30"
                  : timeFilter === "one_year"
                  ? "from-cyan-500/30 to-cyan-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5"
                  : "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:-translate-y-0.5"
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${!dataAvailability.one_year ? "" : timeFilter === "one_year" ? "from-cyan-500/10 to-cyan-600/10" : "from-cyan-500/0 to-cyan-600/0 group-hover:from-cyan-500/10 group-hover:to-cyan-600/10"}`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.one_year ? "text-cyan-400" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.one_year ? "text-white" : "text-slate-600"}`}>1 Year</span>
              </div>
              {!dataAvailability.one_year && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>

            {/* 6 Months */}
            <button
              onClick={() => dataAvailability.six_month && setTimeFilter("six_month")}
              disabled={!dataAvailability.six_month}
              className={`group relative overflow-hidden px-6 py-4 rounded-xl border transition-all duration-300 ${
                !dataAvailability.six_month
                  ? "opacity-50 cursor-not-allowed from-slate-700/20 to-slate-800/20 border-slate-600/30"
                  : timeFilter === "six_month"
                  ? "from-emerald-500/30 to-emerald-600/30 border-emerald-400 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                  : "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:-translate-y-0.5"
              }`}
            >
              <div className={`absolute inset-0 transition-all duration-300 ${!dataAvailability.six_month ? "" : timeFilter === "six_month" ? "from-emerald-500/10 to-emerald-600/10" : "from-emerald-500/0 to-emerald-600/0 group-hover:from-emerald-500/10 group-hover:to-emerald-600/10"}`}></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${dataAvailability.six_month ? "text-emerald-400" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className={`font-semibold ${dataAvailability.six_month ? "text-white" : "text-slate-600"}`}>6 Months</span>
              </div>
              {!dataAvailability.six_month && (
                <div className="absolute top-1 right-1">
                  <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-500">No Data</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* ---------------- NAV HISTORY TABLE (Current -> Older) ---------------- */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Recent NAV History</h3>
              <p className="text-slate-400 text-sm">Showing entries from current (top) to older (bottom).</p>
            </div>
            <div className="text-sm text-slate-400">
              <span>Total rows: {tableData.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-700/60">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">NAV (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Change (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">% Change</th>
                </tr>
              </thead>
            <tbody className="bg-slate-800/30 divide-y divide-slate-700">
  {(!yearsArrayDesc || yearsArrayDesc.length === 0) ? (
    <tr>
      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
        No NAV entries for this period.
      </td>
    </tr>
  ) : (
    // yearsArrayDesc is current-year -> older
    yearsArrayDesc.map((row, idx) => {
      const currentNav = Number(row.nav || 0);
      // previous year in table (older) is next element in yearsArrayDesc
      const nextRow = yearsArrayDesc[idx + 1];
      const previousNav = nextRow ? Number(nextRow.nav || 0) : null;
      const diff = previousNav !== null ? currentNav - previousNav : 0;
      const diffPercent = previousNav !== null && previousNav !== 0 ? (diff / previousNav) * 100 : 0;
      const isPos = diff >= 0;

      return (
        <tr key={`yr-${row.year}`} className="group hover:bg-slate-900/40 transition-colors">
          <td className="px-4 py-3 text-left align-middle text-sm text-slate-200">
            {row.year}
          </td>
          <td className="px-4 py-3 text-right align-middle text-sm font-medium text-white">
            {currentNav.toFixed(2)}
          </td>
          <td className={`px-4 py-3 text-right align-middle text-sm ${isPos ? "text-emerald-400" : "text-red-400"}`}>
            {previousNav !== null ? (diff >= 0 ? "+" : "") + diff.toFixed(2) : "—"}
          </td>
          <td className={`px-4 py-3 text-right align-middle text-sm ${isPos ? "text-emerald-400" : "text-red-400"}`}>
            {previousNav !== null ? (diffPercent >= 0 ? "+" : "") + diffPercent.toFixed(2) + "%" : "—"}
          </td>
        </tr>
      );
    })
  )}
</tbody>

            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Notes: Table shows values for the selected time filter. For "Max" the table will show the full available history returned by the API (newest → oldest).
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectedSchemePage;

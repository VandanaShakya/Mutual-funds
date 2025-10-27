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
  Filler,
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
  LineElement,
  Filler
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
    three_month: true, 
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

        // Helper to create date object from DD-MM-YYYY string
        const createDate = (dateString) => {
          const dateParts = dateString.split("-");
          // Date constructor uses month index (0-11)
          return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        };

        if (hasAnyData) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const filterData = (months) => {
            const targetDate = new Date(today);
            targetDate.setMonth(today.getMonth() - months);
            return allData.filter((item) => {
              const itemDate = createDate(item.date);
              return itemDate >= targetDate && itemDate <= today;
            });
          };

          const maxPeriodData = allData;
          const fiveYearData = filterData(60);
          const twoYearData = filterData(24);
          const oneYearData = filterData(12);
          const sixMonthData = filterData(6);
          const threeMonthData = filterData(3); 
          const oneMonthData = filterData(1);

          setDataAvailability({
            max_period: maxPeriodData.length > 0,
            five_year: fiveYearData.length > 0,
            two_year: twoYearData.length > 0,
            one_year: oneYearData.length > 0,
            six_month: sixMonthData.length > 0,
            three_month: threeMonthData.length > 0, 
            one_month: oneMonthData.length > 0,
          });

          // Default time filter to the largest available period (adjusted order)
          let defaultFilter = "one_month"; // Start with smallest
          if (maxPeriodData.length > 0) defaultFilter = "max_period";
          else if (fiveYearData.length > 0) defaultFilter = "five_year";
          else if (twoYearData.length > 0) defaultFilter = "two_year";
          else if (oneYearData.length > 0) defaultFilter = "one_year";
          else if (sixMonthData.length > 0) defaultFilter = "six_month";
          else if (threeMonthData.length > 0) defaultFilter = "three_month"; 
          else if (oneMonthData.length > 0) defaultFilter = "one_month";

          setTimeFilter(defaultFilter);
          setChartType("line");

          if (!hasAnyData) {
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
      case "three_month": 
        targetDate.setMonth(today.getMonth() - 3);
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

  const navEntries = getFilteredData(); // newest-first
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
      case "three_month": 
        startDate.setMonth(today.getMonth() - 3);
        return `Last 3 Months (${formatDate(startDate)} to ${formatDate(today)})`;
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

  // ---------------- NAV HISTORY TABLES ----------------
  // fullData = entire API data (newest-first)
  const fullData = Array.isArray(schemeData.data) ? schemeData.data : [];

  // ---------- YEARLY SUMMARY (built from fullData) ----------
  const parseNav = (navString) => parseFloat((navString || "0").replace(/,/g, ""));

  const yearlyMap = new Map();
  (fullData || []).forEach((item) => {
    const dateParts = item.date.split("-");
    const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    const year = itemDate.getFullYear();
    const nav = parseNav(item.nav);

    // fullData is newest-first, so first occurrence per year = latest NAV in that year
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, { year, nav, date: item.date, count: 1 });
    } else {
      const prev = yearlyMap.get(year);
      prev.count = (prev.count || 1) + 1;
      yearlyMap.set(year, prev);
    }
  });

  const yearsArrayDesc = Array.from(yearlyMap.values()).sort((a, b) => b.year - a.year);

  // ---------- FILTERED NAV LIST (based on timeFilter) ----------
  // navEntries is newest-first (API returns newest-first and getFilteredData preserves that)
  const filteredList = navEntries; // newest -> older for selected period

  // helper to compute per-row change for filtered list (newest-first)
  const computeRowDiff = (list, idx) => {
    const current = parseNav(list[idx].nav);
    const next = list[idx + 1] ? parseNav(list[idx + 1].nav) : null;
    if (next === null) return { diff: 0, diffPercent: 0, hasPrev: false };
    const diff = current - next;
    const diffPercent = next !== 0 ? (diff / next) * 100 : 0;
    return { diff, diffPercent, hasPrev: true };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto **px-4 sm:px-8** py-4">
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
      {/* ***UPDATED: Removed base `px-4` and kept `sm:px-8` for desktop padding.
        This allows the cards to stretch full-width on mobile.*** */}
      <div className="max-w-7xl mx-auto sm:px-8 py-8">
        {/* Scheme Header Card */}
        {/* ***UPDATED: px-4 on mobile and p-8 on sm (desktop)*** */}
        <div className="mb-6 px-4 py-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm mx-auto sm:mx-0">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 pt-0 sm:pt-10">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
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
            <div className="p-4 sm:p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 min-w-[150px] sm:min-w-[200px]">
              <p className="text-slate-400 text-sm mb-2">Current NAV</p>
              {hasData ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-2">₹{latestNav.toFixed(2)}</p>
                  <div className={`flex items-center gap-2 text-sm sm:text-base ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isPositive ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <span className="font-semibold">{isPositive ? "+" : ""}{changePercent}%</span>
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
        {/* ***UPDATED: px-4 on mobile and p-8 on sm (desktop)*** */}
        <div className="mb-6 px-4 py-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm mx-auto sm:mx-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">NAV Performance</h2>
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

          {/* ***UPDATED: Reduced mobile padding on chart container to px-2*** */}
          <div className="h-[300px] sm:h-[400px] px-2 py-4 sm:p-4 rounded-xl bg-slate-900/30">
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
          <div className="flex justify-center items-center mt-6">
            <div className="flex gap-3 sm:gap-4 flex-wrap justify-center items-center max-w-3xl mx-auto">
              {/* 1 Month (Existing, now with proper placement) */}
              <button
                onClick={() => dataAvailability.one_month && setTimeFilter("one_month")}
                disabled={!dataAvailability.one_month}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-mono text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.one_month
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "one_month"
                      ? "bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-400 text-pink-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-pink-500/5 to-pink-600/10 border-pink-600/30 hover:scale-105 hover:text-pink-300 hover:border-pink-400/60"}
                `}
              >
                1M
              </button>

              {/* 3 Months (NEW BUTTON - Replaces 3Y) */}
              <button
                onClick={() => dataAvailability.three_month && setTimeFilter("three_month")}
                disabled={!dataAvailability.three_month}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-semibold text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.three_month
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "three_month"
                      ? "bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border-indigo-400 text-indigo-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-indigo-600/30 hover:scale-105 hover:text-indigo-300 hover:border-indigo-400/60"}
                `}
              >
                3M
              </button>
              
              {/* 6 Months (Existing) */}
              <button
                onClick={() => dataAvailability.six_month && setTimeFilter("six_month")}
                disabled={!dataAvailability.six_month}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-mono text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.six_month
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "six_month"
                      ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-400 text-emerald-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-600/30 hover:scale-105 hover:text-emerald-300 hover:border-emerald-400/60"}
                `}
              >
                6M
              </button>

              {/* 1 Year (Existing) */}
              <button
                onClick={() => dataAvailability.one_year && setTimeFilter("one_year")}
                disabled={!dataAvailability.one_year}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-mono text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.one_year
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "one_year"
                      ? "bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-400 text-cyan-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 border-cyan-600/30 hover:scale-105 hover:text-cyan-300 hover:border-cyan-400/60"}
                `}
              >
                1Y
              </button>

              {/* 2 Years (Existing) */}
              <button
                onClick={() => dataAvailability.two_year && setTimeFilter("two_year")}
                disabled={!dataAvailability.two_year}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-semibold text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.two_year
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "two_year"
                      ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400 text-blue-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-blue-600/30 hover:scale-105 hover:text-blue-300 hover:border-blue-400/60"}
                `}
              >
                2Y
              </button>

              {/* 5 Years (Existing) */}
              <button
                onClick={() => dataAvailability.five_year && setTimeFilter("five_year")}
                disabled={!dataAvailability.five_year}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-mono text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.five_year
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "five_year"
                      ? "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400 text-red-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-red-500/5 to-red-600/10 border-red-600/30 hover:scale-105 hover:text-red-300 hover:border-red-400/60"}
                `}
              >
                5Y
              </button>

              {/* MAX (Existing) */}
              <button
                onClick={() => dataAvailability.max_period && setTimeFilter("max_period")}
                disabled={!dataAvailability.max_period}
                className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-full border font-mono text-sm transition-all duration-300 ease-out
                  ${!dataAvailability.max_period
                    ? "opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700 text-slate-500"
                    : timeFilter === "max_period"
                      ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-400 text-yellow-300 shadow-lg scale-105"
                      : "bg-gradient-to-br from-yellow-500/5 to-yellow-600/10 border-yellow-600/30 hover:scale-105 hover:text-yellow-300 hover:border-yellow-400/60"}
                `}
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- YEARLY SUMMARY TABLE (Full History) ---------------- */}
        {/* ***UPDATED: px-4 on mobile and p-6 on sm (desktop)*** */}
        <div className="mb-8 px-4 py-6 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/40 mx-auto sm:mx-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Yearly Summary (Full History)</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Static summary built from full available history (Max previous).</p>
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              <span>Total years: {yearsArrayDesc.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-700/60">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Latest NAV (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Change (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">% Change</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                {(!yearsArrayDesc || yearsArrayDesc.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No yearly summary available.
                    </td>
                  </tr>
                ) : (
                  yearsArrayDesc.map((row, idx) => {
                    const currentNav = Number(row.nav || 0);
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
            Notes: This table is static and shows latest NAV per year derived from the full history returned by the API.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SelectedSchemePage;
import React from "react";
import { Line } from "react-chartjs-2";

const SchemeLayout = ({ schemeData }) => {
  if (!schemeData) return null;

  const navEntries = Array.isArray(schemeData.data) ? schemeData.data.slice(0, 30) : [];
  const chronological = [...navEntries].reverse();
  const labels = chronological.map((d) => d.date);
  const navValues = chronological.map((d) => parseFloat(d.nav?.replace(/,/g, "")) || null);

  const chartData = {
    labels,
    datasets: [
      {
        label: "NAV",
        data: navValues,
        fill: true,
        tension: 0.2,
        pointRadius: 2,
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${schemeData.meta.scheme_name} — Recent NAV` },
    },
    scales: { x: { ticks: { autoSkip: true, maxTicksLimit: 10 } }, y: { beginAtZero: false } },
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">{schemeData.meta.scheme_name}</h3>
      <p className="text-gray-400 mb-4">
        <strong>Fund House:</strong> {schemeData.meta.fund_house} &nbsp; | &nbsp;
        <strong>Scheme Type:</strong> {schemeData.meta.scheme_type}
      </p>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <Line data={chartData} options={options} />
      </div>

      <h4 className="font-semibold mb-2">NAV History (Latest 5 entries):</h4>
      <ul className="list-disc pl-5 space-y-1">
        {schemeData.data.slice(0, 5).map((navItem, idx) => (
          <li key={idx}>
            <span className="text-gray-300">{navItem.date}</span>:{" "}
            <span className="text-green-400">{navItem.nav}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchemeLayout;

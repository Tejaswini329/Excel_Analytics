import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Chart.css';

const Chart = () => {
  const location = useLocation();
  const { data, xIndex, yIndex, chartType, labelIndex } = location.state || {};

  const chartRef = useRef();

  if (!data || !data.length || xIndex === null || yIndex === null) {
    return <p>No chart data provided.</p>;
  }

  const rawData = data.slice(1);
  const headers = data[0];

  // Group values and their corresponding labels
  const groupedData = {};
  rawData.forEach(row => {
    const xVal = row[xIndex];
    const yVal = Number(row[yIndex]);
    const label = labelIndex !== null && labelIndex !== undefined ? row[labelIndex] : '';

    if (!groupedData[xVal]) {
      groupedData[xVal] = { values: [], labels: [] };
    }

    groupedData[xVal].values.push(yVal);
    groupedData[xVal].labels.push(label);
  });

  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)'
  ];

  const renderChartBlock = (groupLabel, groupData, color, index) => {
    const { values, labels } = groupData;

    const chartData = {
      labels: labels.length > 0 ? labels : values.map((_, i) => `Entry ${i + 1}`),
      datasets: [{
        label: `${headers[yIndex]} (${groupLabel})`,
        data: values,
        backgroundColor: color,
        borderColor: color.replace('0.6', '1'),
        borderWidth: 1
      }]
    };

    const commonProps = { data: chartData, options: { responsive: true } };

    return (
      <div key={index} className="chart-wrapper">
        <h3>{groupLabel}</h3>
        {chartType === 'bar' && <Bar {...commonProps} />}
        {chartType === 'line' && <Line {...commonProps} />}
        {chartType === 'pie' && <Pie {...commonProps} />}
        {chartType === '3d-bar' && (
          <p>🧊 3D Charts coming soon using Three.js</p>
        )}
      </div>
    );
  };

  const handleDownloadPNG = async () => {
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement('a');
    link.download = 'grouped_chart.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 15, 15, 180, 100);
    pdf.save('grouped_chart.pdf');
  };

  return (
    <div className="chart-page">
      <h2>📊 Grouped Chart View</h2>
      <div ref={chartRef} className="multi-chart-container">
        {Object.entries(groupedData).map(([groupLabel, groupData], i) =>
          renderChartBlock(groupLabel, groupData, colors[i % colors.length], i)
        )}
      </div>
      <div className="download-buttons">
        <button onClick={handleDownloadPNG}>📸 Download PNG</button>
        <button onClick={handleDownloadPDF}>📄 Download PDF</button>
      </div>
    </div>
  );
};

export default Chart;

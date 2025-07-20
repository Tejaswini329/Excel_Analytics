import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import './Chart.css';

const Chart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const chartRef = useRef();
  const { data, xIndex, yIndex, chartType, labelIndex, fileName } = location.state || {};

  if (!data || data.length < 2 || xIndex === null || yIndex === null) {
    return <p>No chart data provided.</p>;
  }

  const headers = data[0];
  const rows = data.slice(1);

  const structuredData = rows
    .map(row => ({
      xVal: row[xIndex],
      yVal: Number(row[yIndex]),
      label:
        labelIndex !== null && labelIndex !== xIndex && row[labelIndex] !== undefined
          ? row[labelIndex]
          : row[xIndex]
    }))
    .filter(row => !isNaN(row.yVal));

  const generateColors = (length) =>
    Array.from({ length }, (_, i) => `hsl(${(360 / length) * i}, 70%, 60%)`);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = structuredData[ctx.dataIndex]?.label;
            return `${label}: ${ctx.formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: headers[xIndex], font: { weight: 'bold' } },
        ticks: { maxRotation: 45, minRotation: 0 }
      },
      y: {
        title: { display: true, text: headers[yIndex], font: { weight: 'bold' } }
      }
    }
  };

  const renderChart = () => {
    const labels = structuredData.map(item => item.label);
    const values = structuredData.map(item => item.yVal);
    const colors = generateColors(values.length);

    switch (chartType) {
      case 'pie':
        return (
          <Pie
            data={{
              labels,
              datasets: [{ label: 'Total', data: values, backgroundColor: colors, borderWidth: 1 }]
            }}
            options={{ responsive: true }}
          />
        );
      case 'bar':
      case 'line':
        return chartType === 'bar' ? (
          <Bar
            data={{
              labels,
              datasets: [{
                label: headers[yIndex],
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('60%', '45%')),
                borderWidth: 1
              }]
            }}
            options={chartOptions}
          />
        ) : (
          <Line
            data={{
              labels,
              datasets: [{
                label: headers[yIndex],
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('60%', '45%')),
                borderWidth: 1,
                fill: false,
                tension: 0.4
              }]
            }}
            options={chartOptions}
          />
        );
      case 'scatter':
        return (
          <Scatter
            data={{
              datasets: [{
                label: `${headers[yIndex]} vs ${headers[xIndex]}`,
                data: structuredData.map(item => ({
                  x: Number(item.xVal),
                  y: item.yVal
                })),
                backgroundColor: 'rgba(75,192,192,0.6)'
              }]
            }}
            options={chartOptions}
          />
        );
      case '3d-bar':
        return <p>🧊 3D Charts coming soon using Three.js!</p>;
      default:
        return <p>Unsupported chart type: {chartType}</p>;
    }
  };

  const handleDownload = async (format = 'png') => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = imgData;
      link.click();
    } else {
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 110);
      pdf.save('chart.pdf');
    }
  };

  const logChartHistory = async () => {
    try {
      await axios.post('http://localhost:5000/api/charthistory', {
        userId: localStorage.getItem('userId'),
        fileName: fileName || 'Uploaded File',
        chartType,
        xAxis: headers[xIndex],
        yAxis: headers[yIndex],
        labelColumn: labelIndex !== null ? headers[labelIndex] : '',
        downloadLinkPNG: '',
        downloadLinkPDF: ''
      });
    } catch (err) {
      console.error('Error logging chart history:', err);
    }
  };

  useEffect(() => {
    logChartHistory();
  }, []);

  return (
    <>
      

      <div className="chart-page">
        <h2>📊 Chart View</h2>
        <div
          ref={chartRef}
          className="chart-container"
          style={{
            padding: '1rem',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            minHeight: '480px'
          }}
        >
          {renderChart()}
        </div>

        <div className="download-buttons">
          <button onClick={() => handleDownload('png')}>📸 Download PNG</button>
          <button onClick={() => handleDownload('pdf')}>📄 Download PDF</button>
        </div>
      </div>
    </>
  );
};

export default Chart;

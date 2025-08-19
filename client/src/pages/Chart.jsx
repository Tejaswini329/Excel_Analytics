import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import * as THREE from 'three';
import './Chart.css';

const Chart = () => {
  const location = useLocation();
  const chartRef = useRef();
  const threeRef = useRef();
  const tooltipRef = useRef(); // For 3D hover tooltip
  const [selectedType, setSelectedType] = useState(location.state?.chartType || 'bar');

  const { data, xIndex, yIndex, labelIndex, fileName } = location.state || {};

  if (!data || data.length < 2 || xIndex === null || yIndex === null) {
    return <p>No chart data provided.</p>;
  }

  const headers = data[0];
  const rows = data.slice(1);

  // Prepare dataset directly — no aggregation
  const structuredData = rows
    .map(row => {
      const xVal = isNaN(Number(row[xIndex])) ? row[xIndex] : Number(row[xIndex]);
      const yVal = Number(row[yIndex]);
      const xLabel = labelIndex !== null && row[labelIndex] !== undefined ? row[labelIndex] : row[xIndex];
      return { x: xVal, y: yVal, xLabel };
    })
    .filter(row => !isNaN(row.y));

  const generateColors = (length) =>
    Array.from({ length }, (_, i) => `hsl(${(360 / length) * i}, 70%, 60%)`);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: { xAxisKey: 'x', yAxisKey: 'y' },
    layout: { padding: 10 },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = structuredData[context.dataIndex];
            let labelLines = [];
            if (point.xLabel !== point.x) {
              labelLines.push(`X Label: ${point.xLabel}`);
            }
            labelLines.push(`X Value: ${point.x}`);
            labelLines.push(`Y: ${point.y}`);
            return labelLines;
          }
        }
      }
    },
    scales: {
      x: {
        type: typeof structuredData[0]?.x === 'number' ? 'linear' : 'category',
        title: { display: true, text: headers[xIndex], font: { weight: 'bold' } }
      },
      y: { title: { display: true, text: headers[yIndex], font: { weight: 'bold' } } }
    }
  };

  // 3D Chart render with hover tooltip
  const render3DChart = () => {
    if (!threeRef.current) return;
    threeRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, threeRef.current.clientWidth / threeRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(threeRef.current.clientWidth, threeRef.current.clientHeight);
    threeRef.current.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const bars = [];

    const colors = generateColors(structuredData.length);
    structuredData.forEach((item, i) => {
      const geometry = new THREE.BoxGeometry(0.5, item.y, 0.5);
      const material = new THREE.MeshBasicMaterial({ color: colors[i] });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(i, item.y / 2, 0);
      cube.userData = item;
      scene.add(cube);
      bars.push(cube);
    });

    camera.position.z = 10;

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bars);

      if (intersects.length > 0) {
        const { x, y, xLabel } = intersects[0].object.userData;
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${event.clientX + 10}px`;
        tooltipRef.current.style.top = `${event.clientY + 10}px`;
        tooltipRef.current.innerHTML = `<strong>${xLabel}</strong><br>X: ${x}<br>Y: ${y}`;
      } else {
        tooltipRef.current.style.display = 'none';
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();
  };

  useEffect(() => {
    if (selectedType === '3d-bar') {
      render3DChart();
    }
  }, [selectedType]);

  const renderChart = () => {
    const colors = generateColors(structuredData.length);
    switch (selectedType) {
      case 'pie':
        return (
          <Pie
            data={{
              labels: structuredData.map(d => d.xLabel),
              datasets: [{ data: structuredData.map(d => d.y), backgroundColor: colors }]
            }}
            options={chartOptions}
          />
        );
      case 'bar':
        return (
          <Bar
            data={{ datasets: [{ label: headers[yIndex], data: structuredData, backgroundColor: colors }] }}
            options={chartOptions}
          />
        );
      case 'line':
        return (
          <Line
            data={{ datasets: [{ label: headers[yIndex], data: structuredData, borderColor: colors[0], fill: false }] }}
            options={chartOptions}
          />
        );
      case 'scatter':
        return (
          <Scatter
            data={{ datasets: [{ label: `${headers[yIndex]} vs ${headers[xIndex]}`, data: structuredData, backgroundColor: colors[0] }] }}
            options={chartOptions}
          />
        );
      case '3d-bar':
        return <div ref={threeRef} style={{ width: '100%', height: '400px', position: 'relative' }} />;
      default:
        return <p>Unsupported chart type</p>;
    }
  };

  const handleUploadAndDownload = async () => {
  try {
    let imgData;

    if (selectedType === '3d-bar' && threeRef.current) {
      // Get WebGL canvas from Three.js
      const canvas = threeRef.current.querySelector('canvas');
      imgData = canvas.toDataURL('image/png'); // Directly from WebGL
    } else {
      // Fallback to html2canvas for normal charts
      const canvas = await html2canvas(chartRef.current, { scale: 2 });
      imgData = canvas.toDataURL('image/png');
    }

    // Convert to Blob
    const pngBlob = await (await fetch(imgData)).blob();

    // Create PDF
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 110);
    const pdfBlob = pdf.output('blob');

    // Prepare form data
    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId')); 
    formData.append('fileName', fileName || 'Uploaded File');
    formData.append('chartType', selectedType);
    formData.append('xAxis', headers[xIndex]);
    formData.append('yAxis', headers[yIndex]);
    formData.append('labelColumn', labelIndex !== null ? headers[labelIndex] : '');
    formData.append('chartPNG', pngBlob, 'chart.png');
    formData.append('chartPDF', pdfBlob, 'chart.pdf');

    const res = await axios.post('http://localhost:5000/api/charthistory/uploadcharts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const entry = res.data.entry;

    // Auto-download
    for (const [link, name] of [
      [`http://localhost:5000${entry.downloadLinkPNG}`, 'chart.png'],
      [`http://localhost:5000${entry.downloadLinkPDF}`, 'chart.pdf']
    ]) {
      const a = document.createElement('a');
      a.href = link;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Upload or download failed:', err);
  }
};


  return (
    <div className="chart-page">
      <h2>📊 Chart View</h2>

      {/* Chart Type Selector */}
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <label>Chart Type: </label>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          <option value="scatter">Scatter</option>
          <option value="3d-bar">3D Bar</option>
        </select>
      </div>

      {/* Chart */}
      <div ref={chartRef} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', minHeight: '480px' }}>
        {renderChart()}
      </div>

      {/* 3D Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '5px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'none',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      ></div>

      {/* Download button */}
      {/* Download button */}
{selectedType !== '3d-bar' && (
  <div style={{ marginTop: '15px', textAlign: 'center' }}>
    <button
      onClick={handleUploadAndDownload}
      style={{
        padding: '8px 12px',
        borderRadius: '5px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      Download
    </button>
  </div>
)}

    </div>
  );
};

export default Chart;

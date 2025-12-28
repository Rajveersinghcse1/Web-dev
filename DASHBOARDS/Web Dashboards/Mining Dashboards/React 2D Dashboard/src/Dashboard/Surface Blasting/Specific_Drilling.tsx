// SpecificDrillingDashboard.jsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as d3 from 'd3-regression';

const SpecificDrillingDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState('Year Wise');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [drillKey, setDrillKey] = useState('');
  const [dateKey, setDateKey] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields;

        const detectedDrill = headers.find(h => h.toLowerCase().includes('drill'));
        const detectedDate = headers.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('year'));

        setDrillKey(detectedDrill);
        setDateKey(detectedDate);

        if (!detectedDrill || !detectedDate) {
          alert('CSV must include Specific Drill and Date/Year columns.');
          return;
        }

        const parsed = results.data.map(row => {
          const drillValue = parseFloat(row[detectedDrill]);
          const dateObj = new Date(row[detectedDate]);
          return {
            date: `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`,
            year: dateObj.getFullYear(),
            monthYear: `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`,
            drill: drillValue
          };
        }).filter(d => !isNaN(d.drill) && d.drill > 0);

        setData(parsed);

        if (parsed.length > 0) {
          const allDates = parsed.map(d => (filterType === 'Year Wise' ? d.year : d.monthYear));
          const sorted = [...new Set(allDates)].sort();
          setStart(sorted[0]);
          const endLimit = filterType === 'Year Wise' ? Math.min(3, sorted.length - 1) : Math.min(9, sorted.length - 1);
          setEnd(sorted[endLimit]);
        }
      }
    });
  };

  useEffect(() => {
    if (!start || !end || data.length === 0) return;

    let filtered;
    if (filterType === 'Year Wise') {
      filtered = data.filter(d => d.year >= parseInt(start) && d.year <= parseInt(end));
    } else {
      const startIndex = data.findIndex(d => d.monthYear === start);
      const endIndex = data.findIndex(d => d.monthYear === end);
      const range = data.slice(startIndex, endIndex + 1);
      filtered = range;
    }
    setFilteredData(filtered);
  }, [data, start, end, filterType]);

  const uniqueOptions = [...new Set(data.map(d => filterType === 'Year Wise' ? d.year : d.monthYear))].sort();

  // Calculate linear trendline data
  const trendData = () => {
    if (filteredData.length < 2) return [];
    const regression = d3.regressionLinear()
      .x((d, i) => i)
      .y(d => d.drill);

    const points = filteredData.map((d, i) => [i, d.drill]);
    const result = regression(points);

    return result.map((val, i) => ({
      [filterType === 'Year Wise' ? 'year' : 'monthYear']: filteredData[i][filterType === 'Year Wise' ? 'year' : 'monthYear'],
      trend: val[1]
    }));
  };

  const trendline = trendData();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', width: '95%', maxWidth: '800px', margin: 'auto' }}>
      <h2>SPECIFIC DRILLING DASHBOARD</h2>

      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ marginBottom: '20px' }} />

      {data.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select value={filterType} onChange={e => {
              setFilterType(e.target.value);
              if (data.length > 0) {
                const allDates = data.map(d => (e.target.value === 'Year Wise' ? d.year : d.monthYear));
                const sorted = [...new Set(allDates)].sort();
                setStart(sorted[0]);
                const endLimit = e.target.value === 'Year Wise' ? Math.min(3, sorted.length - 1) : Math.min(9, sorted.length - 1);
                setEnd(sorted[endLimit]);
              }
            }}>
              <option>Year Wise</option>
              <option>Month Wise</option>
            </select>

            <select value={start} onChange={e => setStart(e.target.value)}>
              {uniqueOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select value={end} onChange={e => setEnd(e.target.value)}>
              {uniqueOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={filterType === 'Year Wise' ? 'year' : 'monthYear'} />
              <YAxis label={{ value: 'Specific Drill (m)', angle: -90, position: 'insideLeft' }} domain={[0, 'dataMax + 5']} />
              <Tooltip formatter={(value) => `${value} m`} />
              <Legend />
              <Line type="monotone" dataKey="drill" stroke="#8884d8" dot={true} activeDot={{ r: 6 }} name="Specific Drill" />
              <Line type="monotone" data={trendline} dataKey="trend" stroke="#FF0000" dot={false} name="Trendline" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default SpecificDrillingDashboard;

import React, { useEffect, useState } from 'react';
import { useCSV } from '../../context/CSVContext';

const Globalfilter = () => {
  const { csvData, setFilteredData } = useCSV();

  const [filters, setFilters] = useState({
    minename: '',
    pitname: '',
    zonename: '',
    benchname: '',
    rock_name: ''
  });

  const [allData, setAllData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    minename: [],
    pitname: [],
    zonename: [],
    benchname: [],
    rock_name: []
  });

  // Normalize headers + data
  useEffect(() => {
    if (csvData.length > 1) {
      const headers = csvData[0].map(h => h.toLowerCase());
      const data = csvData.slice(1);
      const normalized = data.map(row =>
        Object.fromEntries(headers.map((h, i) => [h, row[i]]))
      );
      setAllData(normalized);

      const uniqueMines = [...new Set(normalized.map(d => d.minename).filter(Boolean))];
      setFilterOptions(prev => ({ ...prev, minename: uniqueMines }));
    }
  }, [csvData]);

  // Update dropdown options based on current filters
  useEffect(() => {
    if (!allData.length) return;

    const { minename, pitname, zonename, benchname } = filters;

    const pitOptions = [...new Set(
      allData.filter(d => d.minename === minename).map(d => d.pitname).filter(Boolean)
    )];

    const zoneOptions = [...new Set(
      allData.filter(d => d.minename === minename && d.pitname === pitname).map(d => d.zonename).filter(Boolean)
    )];

    const benchOptions = [...new Set(
      allData.filter(d => d.minename === minename && d.pitname === pitname && d.zonename === zonename).map(d => d.benchname).filter(Boolean)
    )];

    const rockOptions = [...new Set(
      allData.filter(d =>
        d.minename === minename &&
        d.pitname === pitname &&
        d.zonename === zonename &&
        d.benchname === benchname
      ).map(d => d.rock_name).filter(Boolean)
    )];

    setFilterOptions(prev => ({
      ...prev,
      pitname: pitOptions,
      zonename: zoneOptions,
      benchname: benchOptions,
      rock_name: rockOptions
    }));
  }, [filters, allData]);

  // Apply filters and update context
  useEffect(() => {
    if (csvData.length > 1) {
      const headers = csvData[0];
      const data = csvData.slice(1);
      const headerMap = headers.map(h => h.toLowerCase());

      const indices = {
        minename: headerMap.indexOf('minename'),
        pitname: headerMap.indexOf('pitname'),
        zonename: headerMap.indexOf('zonename'),
        benchname: headerMap.indexOf('benchname'),
        rock_name: headerMap.indexOf('rock_name'),
      };

      const filtered = data.filter(row => (
        (!filters.minename || row[indices.minename] === filters.minename) &&
        (!filters.pitname || row[indices.pitname] === filters.pitname) &&
        (!filters.zonename || row[indices.zonename] === filters.zonename) &&
        (!filters.benchname || row[indices.benchname] === filters.benchname) &&
        (!filters.rock_name || row[indices.rock_name] === filters.rock_name)
      ));

      const result = [headers, ...filtered];
      setFilteredData(result); // 👈 update global context
    }
  }, [filters, csvData, setFilteredData]);

  // Helpers
  const handleFilterChange = (key, value) => {
    const resetFrom = {
      minename: { pitname: '', zonename: '', benchname: '', rock_name: '' },
      pitname: { zonename: '', benchname: '', rock_name: '' },
      zonename: { benchname: '', rock_name: '' },
      benchname: { rock_name: '' },
      rock_name: {}
    };

    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...resetFrom[key]
    }));
  };

  const clearFilters = () => {
    setFilters({
      minename: '',
      pitname: '',
      zonename: '',
      benchname: '',
      rock_name: ''
    });
    setFilteredData(csvData); // 👈 reset to full dataset
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">🌍 Filter Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        {Object.keys(filters).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium mb-1">{key}</label>
            <select
              value={filters[key]}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              disabled={
                (key === 'pitname' && !filters.minename) ||
                (key === 'zonename' && !filters.pitname) ||
                (key === 'benchname' && !filters.zonename) ||
                (key === 'rock_name' && !filters.benchname)
              }
              className="border rounded px-2 py-1"
            >
              <option value="">All</option>
              {filterOptions[key]?.map((val, idx) => (
                <option key={idx} value={val}>{val}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex flex-col">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑 Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Globalfilter;

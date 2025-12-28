// src/context/CSVContext.jsx
import React, { createContext, useState } from 'react';

// ✅ Named export - this is what you’re importing elsewhere
export const CSVContext = createContext();

// ✅ Named export for the provider
export const CSVProvider = ({ children }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [rawData, setRawData] = useState([]);

  return (
    <CSVContext.Provider value={{ filteredData, setFilteredData, rawData, setRawData }}>
      {children}
    </CSVContext.Provider>
  );
};

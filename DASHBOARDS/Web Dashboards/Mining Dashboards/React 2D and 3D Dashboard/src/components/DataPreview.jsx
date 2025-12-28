import React from 'react';

const DataPreview = ({ filteredData, darkMode }) => {
  if (!filteredData || filteredData.length === 0) return null;

  return (
    <div
      className={`mt-6 rounded-xl backdrop-blur-sm border shadow ${
        !darkMode
          ? 'bg-slate-800 border-slate-700 text-slate-100'
          : 'bg-indigo-50 border-indigo-200 text-slate-800'
      } overflow-hidden`}
    >
      <div
        className={`p-4 border-b ${
          !darkMode ? 'border-slate-700' : 'border-indigo-200'
        }`}
      >
        <h3 className="font-semibold text-lg">Data Preview</h3>
        <p className="text-sm opacity-70">First 5 filtered records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`text-sm font-medium ${
              !darkMode
                ? 'bg-slate-700 text-indigo-200'
                : 'bg-indigo-100 text-slate-700'
            }`}
          >
            <tr>
              {Object.keys(filteredData[0] || {}).map((key) => (
                <th key={key} className="px-4 py-2 text-left">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, 5).map((row, index) => (
              <tr
                key={index}
                className={`border-t ${
                  !darkMode
                    ? 'border-slate-700 hover:bg-indigo-900/30'
                    : 'border-indigo-100 hover:bg-indigo-100/50'
                } ${index % 2 === 0 ? '' : !darkMode ? 'bg-slate-800/60' : 'bg-indigo-50'}`}
              >
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm">
                    {typeof value === 'number'
                      ? value.toLocaleString()
                      : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreview;

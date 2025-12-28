let rawData = [];
let processedData = [];
let errorRecords = []; // New: Store invalid records
let currentChart = null;
let columnMapping = {};

// Enhanced column detection patterns
const columnPatterns = {
    totalExpCost: ['total exp cost', 'total explosive cost', 'total cost', 'blasting cost', 'explosion cost'],
    totalExplosiveKg: ['total explosive kg', 'explosive kg', 'explosive weight', 'explosive quantity', 'explosive amount'],
    blastAccessoriesDelayCost: ['blast accessories', 'delay cost', 'initiator cost', 'detonator cost', 'accessories cost'],
    drillingCost: ['drilling cost', 'drill cost', 'drilling expense', 'hole cost'],
    manPowerCost: ['man power cost', 'manpower cost', 'labor cost', 'labour cost', 'worker cost'],
    tonnage: ['tonnage', 'tons', 'tonne', 'material', 'rock tonnage', 'blast tonnage','Ton','recover'],
    
    blastDate: ['blast date', 'date', 'blasting date', 'operation date', 'work date', 'blast_date']
};

// File input handler
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('filterType').addEventListener('change', handleFilterTypeChange);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = `Selected: ${file.name}`;
    showAlert('Loading and processing file...', 'loading');

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
        Papa.parse(file, {
            complete: function(results) {
                processFileData(results.data);
            },
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false
        });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const headers = jsonData[0];
            const rows = jsonData.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
            
            processFileData(rows);
        };
        reader.readAsArrayBuffer(file);
    }
}

function processFileData(data) {
    rawData = data.filter(row => {
        return Object.values(row).some(value => 
            value !== null && value !== undefined && value !== "" && value !== 0
        );
    });

    if (rawData.length === 0) {
        showAlert('No valid data found in the file.', 'error');
        return;
    }

    detectColumns(rawData[0]);
    displayColumnMapping();
    
    // Process all data and separate valid from invalid records
    const allProcessedData = rawData.map(row => processRowWithNumericHandling(row));
    
    // NEW: Separate valid and invalid records based on costPerTon AND blast date
    processedData = [];
    errorRecords = [];
    
    allProcessedData.forEach((row, index) => {
        // Check if costPerTon is NaN, 0, or invalid
        const isValidCostPerTon = !isNaN(row.costPerTon) && row.costPerTon > 0;
        
        // Check if blast date is valid
        const isValidBlastDate = row.blastDate !== null && row.blastDate !== undefined;
        
        // Also check if basic numeric data exists
        const hasValidNumericData = !isNaN(row.totalExpCost) || !isNaN(row.totalExplosiveKg) || 
                                   !isNaN(row.blastAccessoriesDelayCost) || !isNaN(row.drillingCost) || 
                                   !isNaN(row.manPowerCost) || !isNaN(row.tonnage);
        
        if (isValidCostPerTon && hasValidNumericData && isValidBlastDate) {
            processedData.push({...row, originalIndex: index + 1});
        } else {
            // Store error record with reason
            const errorReasons = [];
            if (isNaN(row.costPerTon) || row.costPerTon === 0) {
                if (isNaN(row.totalExpCost) || row.totalExpCost === 0) {
                    errorReasons.push('Missing/Invalid Total Explosive Cost');
                }
                if (isNaN(row.tonnage) || row.tonnage === 0) {
                    errorReasons.push('Missing/Invalid Tonnage');
                }
                if (errorReasons.length === 0) {
                    errorReasons.push('Invalid Cost Per Ton Calculation');
                }
            }
            if (!hasValidNumericData) {
                errorReasons.push('No Valid Numeric Data');
            }
            if (!isValidBlastDate) {
                errorReasons.push('Invalid/Missing Blast Date');
            }
            
            errorRecords.push({
                ...row, 
                originalIndex: index + 1,
                errorReason: errorReasons.join(', ')
            });
        }
    });

    if (processedData.length === 0) {
        showAlert(`No valid records found. All ${errorRecords.length} records have errors. Click "View Error Records" to see details.`, 'error');
        updateErrorButton();
        return;
    }
    
    // Sort processed data by blast date
    processedData.sort((a, b) => {
        if (a.blastDate && b.blastDate) {
            return new Date(a.blastDate) - new Date(b.blastDate);
        }
        return 0;
    });
    
    document.getElementById('columnMappingSection').classList.remove('hidden');
    document.getElementById('controlsSection').classList.remove('hidden');
    document.getElementById('statsSection').classList.remove('hidden');
    document.getElementById('chartSection').classList.remove('hidden');
    document.getElementById('tableSection').classList.remove('hidden');
    
    updateVisualization();
    updateDataTable();
    updateErrorButton();
    
    showAlert(`Successfully processed ${processedData.length} valid records. ${errorRecords.length} records filtered due to errors.`, 'success');
}

// NEW: Update error button visibility and text
function updateErrorButton() {
    const errorButton = document.getElementById('errorButton');
    const exportErrorButton = document.getElementById('exportErrorButton');
    
    if (errorRecords.length > 0) {
        errorButton.style.display = 'inline-block';
        errorButton.textContent = `View Error Records (${errorRecords.length})`;
        exportErrorButton.style.display = 'inline-block';
    } else {
        errorButton.style.display = 'none';
        exportErrorButton.style.display = 'none';
    }
}

// NEW: Show error records in modal or table
function showErrorRecords() {
    const errorContainer = document.getElementById('errorRecordsContainer');
    
    if (errorRecords.length === 0) {
        errorContainer.innerHTML = '<p>No error records found.</p>';
        return;
    }

    const errorColumns = [
        { key: 'originalIndex', label: 'Row #', format: (val) => val },
        { key: 'blastDate', label: 'Blast Date', format: (val) => val ? new Date(val).toLocaleDateString() : 'INVALID' },
        { key: 'totalExpCost', label: 'Total Exp Cost', format: (val) => isNaN(val) ? 'INVALID' : '₹' + val.toFixed(2) },
        { key: 'tonnage', label: 'Tonnage', format: (val) => isNaN(val) ? 'INVALID' : val.toFixed(2) + ' tons' },
        { key: 'costPerTon', label: 'Cost/Ton', format: (val) => isNaN(val) || val === 0 ? 'INVALID' : '₹' + val.toFixed(2) },
        { key: 'errorReason', label: 'Error Reason', format: (val) => val || 'Unknown Error' }
    ];

    let tableHTML = '<div class="error-records-section"><h3>Error Records</h3>';
    tableHTML += '<table class="error-table"><thead><tr>';
    
    errorColumns.forEach(col => {
        tableHTML += `<th>${col.label}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    errorRecords.forEach(row => {
        tableHTML += '<tr class="error-row">';
        errorColumns.forEach(col => {
            const value = row[col.key];
            tableHTML += `<td>${col.format(value)}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table></div>';
    errorContainer.innerHTML = tableHTML;
    
    // Show the error records section
    document.getElementById('errorRecordsSection').classList.remove('hidden');
}

// NEW: Export error records to CSV
function exportErrorRecords() {
    if (errorRecords.length === 0) {
        showAlert('No error records to export.', 'error');
        return;
    }

    const csvHeaders = [
        'Row Number',
        'Blast Date',
        'Total Explosive Cost',
        'Total Explosive (Kg)',
        'Tonnage',
        'Cost Per Ton',
        'Drilling Cost',
        'Manpower Cost',
        'Accessories Cost',
        
        'Error Reason'
    ];

    const csvRows = errorRecords.map(row => [
        row.originalIndex,
        row.blastDate ? new Date(row.blastDate).toLocaleDateString() : 'INVALID',
        isNaN(row.totalExpCost) ? 'INVALID' : row.totalExpCost.toFixed(2),
        isNaN(row.totalExplosiveKg) ? 'INVALID' : row.totalExplosiveKg.toFixed(2),
        isNaN(row.tonnage) ? 'INVALID' : row.tonnage.toFixed(2),
        isNaN(row.costPerTon) || row.costPerTon === 0 ? 'INVALID' : row.costPerTon.toFixed(2),
        isNaN(row.drillingCost) ? 'INVALID' : row.drillingCost.toFixed(2),
        isNaN(row.manPowerCost) ? 'INVALID' : row.manPowerCost.toFixed(2),
        isNaN(row.blastAccessoriesDelayCost) ? 'INVALID' : row.blastAccessoriesDelayCost.toFixed(2),
       
        row.errorReason || 'Unknown Error'
    ]);

    const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'blast_analysis_error_records.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert(`Exported ${errorRecords.length} error records to CSV.`, 'success');
}

function detectColumns(sampleRow) {
    const headers = Object.keys(sampleRow);
    columnMapping = {};

    for (const [category, patterns] of Object.entries(columnPatterns)) {
        for (const header of headers) {
            const headerLower = header.toLowerCase().trim();
            if (patterns.some(pattern => headerLower.includes(pattern))) {
                if (!columnMapping[category]) {
                    columnMapping[category] = header;
                    break;
                }
            }
        }
    }

    console.log('Detected column mapping:', columnMapping);
}

function displayColumnMapping() {
    const mappingContainer = document.getElementById('columnMappingContent');
    let mappingHTML = '';
    
    const mappingLabels = {
        blastDate: 'Blast Date',
        totalExpCost: 'Total Explosive Cost',
        totalExplosiveKg: 'Total Explosive (Kg)',
        blastAccessoriesDelayCost: 'Blast Accessories/Delay Cost',
        drillingCost: 'Drilling Cost',
        manPowerCost: 'Manpower Cost',
        tonnage: 'Tonnage/Material Weight',
        
    };

    for (const [key, label] of Object.entries(mappingLabels)) {
        const columnName = columnMapping[key];
        if (columnName) {
            mappingHTML += `<p><strong>${label}:</strong> ${columnName}</p>`;
        } else {
            mappingHTML += `<p><strong>${label}:</strong> <em>Not detected</em></p>`;
        }
    }

    mappingContainer.innerHTML = mappingHTML;
}

function processRowWithNumericHandling(row) {
    const processed = { ...row };
    
    processed.totalExpCost = parseNumericValue(row[columnMapping.totalExpCost]);
    processed.totalExplosiveKg = parseNumericValue(row[columnMapping.totalExplosiveKg]);
    processed.blastAccessoriesDelayCost = parseNumericValue(row[columnMapping.blastAccessoriesDelayCost]);
    processed.drillingCost = parseNumericValue(row[columnMapping.drillingCost]);
    processed.manPowerCost = parseNumericValue(row[columnMapping.manPowerCost]);
    processed.tonnage = parseNumericValue(row[columnMapping.tonnage]);
    
    // Parse blast date
    if (columnMapping.blastDate && row[columnMapping.blastDate]) {
        processed.blastDate = parseDate(row[columnMapping.blastDate]);
    } else {
        processed.blastDate = null;
    }
    
    // Calculate cost per ton with enhanced validation
    if (!isNaN(processed.totalExpCost) && processed.totalExpCost > 0 && 
        !isNaN(processed.tonnage) && processed.tonnage > 0) {
        processed.costPerTon = processed.totalExpCost / processed.tonnage;
    } else {
        processed.costPerTon = NaN;
    }
    
    
    
    return processed;
}

function parseNumericValue(value) {
    if (value === null || value === undefined || value === '') {
        return NaN;
    }
    
    if (typeof value === 'string') {
        const cleanValue = value.replace(/[₹,$,\s]/g, '').trim();
        const numValue = parseFloat(cleanValue);
        return isNaN(numValue) ? NaN : numValue;
    }
    
    const numValue = parseFloat(value);
    return isNaN(numValue) ? NaN : numValue;
}

function parseDate(dateValue) {
    if (!dateValue) return null;
    
    try {
        // Handle various date formats
        let parsedDate = null;
        
        // Try different date parsing approaches
        if (typeof dateValue === 'string') {
            // Handle DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, etc.
            const dateStr = dateValue.trim();
            
            // Try standard Date parsing first
            parsedDate = new Date(dateStr);
            
            // If that fails, try manual parsing for DD/MM/YYYY format
            if (isNaN(parsedDate.getTime())) {
                const parts = dateStr.split(/[-\/]/);
                if (parts.length === 3) {
                    // Assume DD/MM/YYYY format
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                    const year = parseInt(parts[2]);
                    
                    if (day <= 31 && month <= 11 && year > 1900) {
                        parsedDate = new Date(year, month, day);
                    }
                }
            }
        } else if (typeof dateValue === 'number') {
            // Handle Excel serial date numbers
            parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else {
            parsedDate = new Date(dateValue);
        }
        
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    } catch (e) {
        return null;
    }
}

function handleFilterTypeChange() {
    const filterType = document.getElementById('filterType').value;
    
    ['yearStartGroup', 'yearEndGroup', 'dateStartGroup', 'dateEndGroup', 
     'costMinGroup', 'costMaxGroup', 'tonnageMinGroup', 'tonnageMaxGroup']
        .forEach(id => document.getElementById(id).style.display = 'none');
    
    if (filterType === 'year') {
        document.getElementById('yearStartGroup').style.display = 'block';
        document.getElementById('yearEndGroup').style.display = 'block';
    } else if (filterType === 'date') {
        document.getElementById('dateStartGroup').style.display = 'block';
        document.getElementById('dateEndGroup').style.display = 'block';
    } else if (filterType === 'cost') {
        document.getElementById('costMinGroup').style.display = 'block';
        document.getElementById('costMaxGroup').style.display = 'block';
    } else if (filterType === 'tonnage') {
        document.getElementById('tonnageMinGroup').style.display = 'block';
        document.getElementById('tonnageMaxGroup').style.display = 'block';
    }
}

function getFilteredData() {
    const filterType = document.getElementById('filterType').value;
    const dataType = document.getElementById('dataType').value;
    
    let filteredData = processedData; // Only use valid records (including valid blast dates)
    
    // Apply data type filter
    if (dataType !== 'all') {
        filteredData = filteredData.filter(row => row.dataType === dataType);
    }
    
    if (filterType === 'none') {
        return filteredData;
    }
    
    return filteredData.filter(row => {
        if (filterType === 'year' && row.blastDate) {
            const year = row.blastDate.getFullYear();
            const startYear = parseInt(document.getElementById('yearStart').value);
            const endYear = parseInt(document.getElementById('yearEnd').value);
            
            if (startYear && year < startYear) return false;
            if (endYear && year > endYear) return false;
        }
        
        if (filterType === 'date' && row.blastDate) {
            const startDate = new Date(document.getElementById('dateStart').value);
            const endDate = new Date(document.getElementById('dateEnd').value);
            
            if (startDate && row.blastDate < startDate) return false;
            if (endDate && row.blastDate > endDate) return false;
        }

        if (filterType === 'cost') {
            const minCost = parseFloat(document.getElementById('costMin').value);
            const maxCost = parseFloat(document.getElementById('costMax').value);
            const totalCost = row.totalExpCost || 0;
            
            if (minCost && totalCost < minCost) return false;
            if (maxCost && totalCost > maxCost) return false;
        }

        if (filterType === 'tonnage') {
            const minTonnage = parseFloat(document.getElementById('tonnageMin').value);
            const maxTonnage = parseFloat(document.getElementById('tonnageMax').value);
            const tonnage = row.tonnage || 0;
            
            if (minTonnage && tonnage < minTonnage) return false;
            if (maxTonnage && tonnage > maxTonnage) return false;
        }
        
        return true;
    });
}

function updateVisualization() {
    const filteredData = getFilteredData();
    const chartType = document.getElementById('chartType').value;
    
    updateStatistics(filteredData);
    
    if (currentChart) {
        currentChart.destroy();
    }
    
    const ctx = document.getElementById('dataChart').getContext('2d');
    const chartData = prepareChartData(filteredData, chartType);
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (chartType === 'pie' || chartType === 'doughnut') {
                            label += '₹' + context.parsed.toFixed(2);
                        } else if (chartType === 'costPerTon') {
                            label += '₹' + (context.parsed.y || context.parsed).toFixed(2) + '/ton';
                        } else {
                            label += typeof context.parsed === 'object' ? 
                                    '₹' + (context.parsed.y || context.parsed).toFixed(2) :
                                    '₹' + context.parsed.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Blast Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: chartType === 'costPerTon' ? 'Cost per Ton (₹/ton)' : 'Cost (₹)'
                }
            }
        }
    };

    currentChart = new Chart(ctx, {
        type: chartType === 'costPerTon' ? 'line' : chartType,
        data: chartData,
        options: chartOptions
    });
}

function prepareChartData(data, chartType) {
    switch (chartType) {
        case 'costPerTon':
            // Enhanced cost per ton analysis with blast dates on x-axis
            return {
                labels: data.map(row => {
                    if (row.blastDate) {
                        return row.blastDate.toLocaleDateString();
                    }
                    return 'Invalid Date';
                }),
                datasets: [{
                    label: 'Actual Cost per Ton (₹/ton)',
                    data: data.map(row => {
                        const recoveredTonnage = row.tonnage || 0;
                        return recoveredTonnage > 0 ? (row.totalExpCost || 0) / recoveredTonnage : 0;
                    }),
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    label: 'Theoretical Cost per Ton (₹/ton)',
                    data: data.map(row => {
                        const explosiveKg = row.totalExplosiveKg || 0;
                        const theoreticalTonnage = explosiveKg * 1.2; // Powder Factor = 1.2
                        return theoreticalTonnage > 0 ? (row.totalExpCost || 0) / theoreticalTonnage : 0;
                    }),
                    backgroundColor: 'rgba(255, 152, 0, 0.6)',
                    borderColor: 'rgba(255, 152, 0, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            };

        default:
            return { labels: [], datasets: [] };
    }
}

function updateStatistics(data) {
    const validData = data.filter(row => 
        !isNaN(row.totalExpCost) || !isNaN(row.drillingCost) || 
        !isNaN(row.manPowerCost) || !isNaN(row.tonnage)
    );

    const totalRecords = validData.length;
    const totalExpCost = validData.reduce((sum, row) => sum + (row.totalExpCost || 0), 0);
    const totalExplosive = validData.reduce((sum, row) => sum + (row.totalExplosiveKg || 0), 0);
    const totalTonnage = validData.reduce((sum, row) => sum + (row.tonnage || 0), 0);
    const totalDrillingCost = validData.reduce((sum, row) => sum + (row.drillingCost || 0), 0);
    const totalManpowerCost = validData.reduce((sum, row) => sum + (row.manPowerCost || 0), 0);
    
    const avgBlastingCost = totalRecords > 0 ? totalExpCost / totalRecords : 0;
    const avgCostPerTon = totalTonnage > 0 ? totalExpCost / totalTonnage : 0;
    
    // Calculate actual vs theoretical counts
    const actualCount = validData.filter(row => row.dataType === 'actual').length;
    const theoreticalCount = validData.filter(row => row.dataType === 'theoretical').length;

    document.getElementById('totalRecords').textContent = totalRecords.toLocaleString();
    document.getElementById('avgBlastingCost').textContent = '₹' + avgBlastingCost.toFixed(2);
    document.getElementById('totalExplosive').textContent = totalExplosive.toFixed(2) + ' kg';
    document.getElementById('totalTonnage').textContent = totalTonnage.toLocaleString() + ' tons';
    document.getElementById('avgCostPerTon').textContent = '₹' + avgCostPerTon.toFixed(2);
    document.getElementById('totalDrillingCost').textContent = '₹' + totalDrillingCost.toFixed(2);
    document.getElementById('totalManpowerCost').textContent = '₹' + totalManpowerCost.toFixed(2);
    document.getElementById('actualVsTheoretical').textContent = `${actualCount}/${theoreticalCount}`;
}

function updateDataTable() {
    const filteredData = getFilteredData();
    const tableContainer = document.getElementById('tableContainer');
    
    if (filteredData.length === 0) {
        tableContainer.innerHTML = '<p>No valid data to display.</p>';
        return;
    }

    // Show relevant columns including blast date
    const relevantColumns = [
        { key: 'blastDate', label: 'Blast Date', format: (val) => val ? val.toLocaleDateString() : 'Invalid' },
        { key: 'totalExpCost', label: 'Total Exp Cost (₹)', format: (val) => isNaN(val) ? 'N/A' : '₹' + val.toFixed(2) },
        { key: 'totalExplosiveKg', label: 'Explosive (Kg)', format: (val) => isNaN(val) ? 'N/A' : val.toFixed(2) + ' kg' },
        { key: 'tonnage', label: 'Tonnage', format: (val) => isNaN(val) ? 'N/A' : val.toFixed(2) + ' tons' },
        { key: 'drillingCost', label: 'Drilling Cost (₹)', format: (val) => isNaN(val) ? 'N/A' : '₹' + val.toFixed(2) },
        { key: 'manPowerCost', label: 'Manpower Cost (₹)', format: (val) => isNaN(val) ? 'N/A' : '₹' + val.toFixed(2) },
        { key: 'blastAccessoriesDelayCost', label: 'Accessories Cost (₹)', format: (val) => isNaN(val) ? 'N/A' : '₹' + val.toFixed(2) },
        { key: 'costPerTon', label: 'Cost/Ton (₹)', format: (val) => isNaN(val) ? 'N/A' : '₹' + val.toFixed(2) + '/ton' }
        
    ];

    let tableHTML = '<table><thead><tr>';
    relevantColumns.forEach(col => {
        tableHTML += `<th>${col.label}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Show all filtered records (not just first 100)
    filteredData.forEach(row => {
        tableHTML += '<tr>';
        relevantColumns.forEach(col => {
            const value = row[col.key];
            tableHTML += `<td>${col.format(value)}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-error' : 'loading';
    
    alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    
    if (type !== 'loading') {
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Blast Cost Analysis Tool with Date Filtering and Error Handling Loaded');
    
    // Add event listeners for new error handling buttons
    const errorButton = document.getElementById('errorButton');
    const exportErrorButton = document.getElementById('exportErrorButton');
    
    if (errorButton) {
        errorButton.addEventListener('click', showErrorRecords);
    }
    
    if (exportErrorButton) {
        exportErrorButton.addEventListener('click', exportErrorRecords);
    }
    
    // Add event listeners for filter controls
    const filterControls = ['chartType', 'dataType', 'yearStart', 'yearEnd', 'dateStart', 'dateEnd', 'costMin', 'costMax', 'tonnageMin', 'tonnageMax'];
    filterControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('change', updateVisualization);
        }
    });
    
    // Initialize error button state
    updateErrorButton();
});
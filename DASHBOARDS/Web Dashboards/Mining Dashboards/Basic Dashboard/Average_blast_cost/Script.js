let rawData = [];
        let processedData = [];
        let currentChart = null;
        let columnMapping = {};

        // Enhanced column detection patterns
        const columnPatterns = {
            totalExpCost: ['total exp cost', 'total explosive cost', 'total cost', 'blasting cost', 'explosion cost'],
            totalExplosiveKg: ['total explosive kg', 'explosive kg', 'explosive weight', 'explosive quantity', 'explosive amount'],
            blastAccessoriesDelayCost: ['blast accessories', 'delay cost', 'initiator cost', 'detonator cost', 'accessories cost'],
            drillingCost: ['drilling cost', 'drill cost', 'drilling expense', 'hole cost'],
            manPowerCost: ['man power cost', 'manpower cost', 'labor cost', 'labour cost', 'worker cost'],
            date: ['date', 'time', 'day', 'month', 'year', 'timestamp']
        };

        // File input handler
        document.getElementById('fileInput').addEventListener('change', handleFileUpload);
        document.getElementById('filterType').addEventListener('change', handleFilterTypeChange);
        
        // Add event listeners for record range filters
        document.getElementById('recordStart').addEventListener('input', updateVisualization);
        document.getElementById('recordEnd').addEventListener('input', updateVisualization);

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
                    dynamicTyping: false // Keep as strings initially for better control
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Convert to objects with headers
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
            // Filter out completely empty rows
            rawData = data.filter(row => {
                return Object.values(row).some(value => 
                    value !== null && value !== undefined && value !== "" && value !== 0
                );
            });

            if (rawData.length === 0) {
                showAlert('No valid data found in the file.', 'error');
                return;
            }

            // Detect and map columns
            detectColumns(rawData[0]);
            displayColumnMapping();
            
            // Process data with numeric conversion
            processedData = rawData.map(row => processRowWithNumericHandling(row));
            
            // Filter out records where total_exp_cost is 0, null, empty, or NaN
            const originalCount = processedData.length;
            processedData = processedData.filter(row => {
                const totalExpCost = row.totalExpCost;
                // Check if totalExpCost is valid and greater than 0
                return !isNaN(totalExpCost) && totalExpCost !== null && totalExpCost !== undefined && totalExpCost > 0;
            });

            if (processedData.length === 0) {
                showAlert('No valid records found with total explosive cost greater than 0.', 'error');
                return;
            }
            
            const filteredCount = originalCount - processedData.length;
            if (filteredCount > 0) {
                console.log(`Filtered out ${filteredCount} records with invalid or zero total explosive cost`);
            }
            
            // Initialize record range inputs with data bounds
            updateRecordRangeInputs();
            
            // Show all sections
            document.getElementById('columnMappingSection').classList.remove('hidden');
            document.getElementById('controlsSection').classList.remove('hidden');
            document.getElementById('recordRangeSection').classList.remove('hidden');
            document.getElementById('statsSection').classList.remove('hidden');
            document.getElementById('chartSection').classList.remove('hidden');
            document.getElementById('tableSection').classList.remove('hidden');
            
            // Initial visualization and table update
            updateVisualization();
            updateDataTable();
            
            const message = filteredCount > 0 ? 
                `Successfully processed ${processedData.length} valid records from ${rawData.length} total records! (${filteredCount} records filtered out due to invalid/zero total explosive cost)` :
                `Successfully processed ${processedData.length} valid records from ${rawData.length} total records!`;
            
            showAlert(message, 'success');
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
                totalExpCost: 'Total Explosive Cost',
                totalExplosiveKg: 'Total Explosive (Kg)',
                blastAccessoriesDelayCost: 'Blast Accessories/Delay Cost',
                drillingCost: 'Drilling Cost',
                manPowerCost: 'Manpower Cost',
                date: 'Date Column'
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
            
            // Convert relevant columns to numeric with error handling (like pandas to_numeric with errors='coerce')
            processed.totalExpCost = parseNumericValue(row[columnMapping.totalExpCost]);
            processed.totalExplosiveKg = parseNumericValue(row[columnMapping.totalExplosiveKg]);
            processed.blastAccessoriesDelayCost = parseNumericValue(row[columnMapping.blastAccessoriesDelayCost]);
            processed.drillingCost = parseNumericValue(row[columnMapping.drillingCost]);
            processed.manPowerCost = parseNumericValue(row[columnMapping.manPowerCost]);
            
            // Parse date if available
            if (columnMapping.date && row[columnMapping.date]) {
                processed.parsedDate = parseDate(row[columnMapping.date]);
            }
            
            return processed;
        }

        function parseNumericValue(value) {
            if (value === null || value === undefined || value === '') {
                return NaN;
            }
            
            // Handle string values that might contain currency symbols or commas
            if (typeof value === 'string') {
                // Remove currency symbols, commas, and extra spaces
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
                const date = new Date(dateValue);
                return isNaN(date.getTime()) ? null : date;
            } catch (e) {
                return null;
            }
        }

        function updateRecordRangeInputs() {
            const filteredData = getFilteredData();
            const totalRecords = filteredData.length;
            
            // Update max values and placeholders
            document.getElementById('recordStart').max = totalRecords;
            document.getElementById('recordEnd').max = totalRecords;
            document.getElementById('recordStart').placeholder = `1 to ${totalRecords}`;
            document.getElementById('recordEnd').placeholder = `1 to ${totalRecords}`;
            
            // Set default values if not already set
            if (!document.getElementById('recordStart').value) {
                document.getElementById('recordStart').value = 1;
            }
            if (!document.getElementById('recordEnd').value) {
                document.getElementById('recordEnd').value = Math.min(20, totalRecords);
            }
            
            // Update the info text
            document.getElementById('recordRangeInfo').textContent = `Total available records: ${totalRecords}`;
        }

        function handleFilterTypeChange() {
            const filterType = document.getElementById('filterType').value;
            
            // Hide all filter inputs
            ['yearStartGroup', 'yearEndGroup', 'dateStartGroup', 'dateEndGroup', 'costMinGroup', 'costMaxGroup']
                .forEach(id => document.getElementById(id).style.display = 'none');
            
            // Show relevant inputs
            if (filterType === 'year') {
                document.getElementById('yearStartGroup').style.display = 'block';
                document.getElementById('yearEndGroup').style.display = 'block';
            } else if (filterType === 'date') {
                document.getElementById('dateStartGroup').style.display = 'block';
                document.getElementById('dateEndGroup').style.display = 'block';
            } else if (filterType === 'cost') {
                document.getElementById('costMinGroup').style.display = 'block';
                document.getElementById('costMaxGroup').style.display = 'block';
            }
            
            // Update record range after filter change
            setTimeout(() => {
                updateRecordRangeInputs();
                updateVisualization();
            }, 100);
        }

        function getFilteredData() {
            const filterType = document.getElementById('filterType').value;
            
            if (filterType === 'none') {
                return processedData;
            }
            
            return processedData.filter(row => {
                if (filterType === 'year' && row.parsedDate) {
                    const year = row.parsedDate.getFullYear();
                    const startYear = parseInt(document.getElementById('yearStart').value);
                    const endYear = parseInt(document.getElementById('yearEnd').value);
                    
                    if (startYear && year < startYear) return false;
                    if (endYear && year > endYear) return false;
                }
                
                if (filterType === 'date' && row.parsedDate) {
                    const startDate = new Date(document.getElementById('dateStart').value);
                    const endDate = new Date(document.getElementById('dateEnd').value);
                    
                    if (startDate && row.parsedDate < startDate) return false;
                    if (endDate && row.parsedDate > endDate) return false;
                }

                if (filterType === 'cost') {
                    const minCost = parseFloat(document.getElementById('costMin').value);
                    const maxCost = parseFloat(document.getElementById('costMax').value);
                    const totalCost = row.totalExpCost || 0;
                    
                    if (minCost && totalCost < minCost) return false;
                    if (maxCost && totalCost > maxCost) return false;
                }
                
                return true;
            });
        }

        function getRecordRangeData() {
            const filteredData = getFilteredData();
            const startRecord = parseInt(document.getElementById('recordStart').value) || 1;
            const endRecord = parseInt(document.getElementById('recordEnd').value) || filteredData.length;
            
            // Validate range
            const validStart = Math.max(1, Math.min(startRecord, filteredData.length));
            const validEnd = Math.max(validStart, Math.min(endRecord, filteredData.length));
            
            // Update inputs if they were invalid
            if (startRecord !== validStart) {
                document.getElementById('recordStart').value = validStart;
            }
            if (endRecord !== validEnd) {
                document.getElementById('recordEnd').value = validEnd;
            }
            
            // Return sliced data (convert to 0-based indexing)
            return filteredData.slice(validStart - 1, validEnd);
        }

        function updateVisualization() {
            const filteredData = getFilteredData();
            const chartType = document.getElementById('chartType').value;
            
            // Update record range inputs first
            updateRecordRangeInputs();
            
            // Update statistics with all filtered data
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
                                } else {
                                    label += typeof context.parsed === 'object' ? 
                                            '₹' + (context.parsed.y || context.parsed).toFixed(2) :
                                            '₹' + context.parsed.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            };

            // Add scales for non-pie charts
            if (!['pie', 'doughnut', 'radar'].includes(chartType)) {
                chartOptions.scales = {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toFixed(0);
                            }
                        }
                    }
                };
            }
            
            currentChart = new Chart(ctx, {
                type: chartType,
                data: chartData,
                options: chartOptions
            });
        }

        function updateStatistics(filteredData) {
            // Calculate statistics - all data here already has valid totalExpCost > 0
            const validData = filteredData.filter(row => 
                !isNaN(row.totalExpCost) && row.totalExpCost > 0
            );

            document.getElementById('totalRecords').textContent = validData.length;
            
            if (validData.length > 0) {
                // Average Blasting Cost - all records have valid totalExpCost
                const avgBlastingCost = validData.reduce((sum, row) => sum + row.totalExpCost, 0) / validData.length;
                
                // Total Explosive Used
                const totalExplosiveKg = validData
                    .map(row => row.totalExplosiveKg)
                    .filter(kg => !isNaN(kg))
                    .reduce((sum, kg) => sum + kg, 0);
                
                // Total Initiator Cost
                const totalInitiatorCost = validData
                    .map(row => row.blastAccessoriesDelayCost)
                    .filter(cost => !isNaN(cost))
                    .reduce((sum, cost) => sum + cost, 0);
                
                // Total Drilling Cost
                const totalDrillingCost = validData
                    .map(row => row.drillingCost)
                    .filter(cost => !isNaN(cost))
                    .reduce((sum, cost) => sum + cost, 0);
                
                // Total Manpower Cost
                const totalManpowerCost = validData
                    .map(row => row.manPowerCost)
                    .filter(cost => !isNaN(cost))
                    .reduce((sum, cost) => sum + cost, 0);

                // Update display
                document.getElementById('avgBlastingCost').textContent = `₹${avgBlastingCost.toFixed(2)}`;
                document.getElementById('totalExplosive').textContent = `${totalExplosiveKg.toFixed(2)} kg`;
                document.getElementById('totalInitiatorCost').textContent = `₹${totalInitiatorCost.toFixed(2)}`;
                document.getElementById('totalDrillingCost').textContent = `₹${totalDrillingCost.toFixed(2)}`;
                document.getElementById('totalManpowerCost').textContent = `₹${totalManpowerCost.toFixed(2)}`;
            } else {
                // Reset to zeros if no valid data
                ['avgBlastingCost', 'totalExplosive', 'totalInitiatorCost', 'totalDrillingCost', 'totalManpowerCost']
                    .forEach(id => document.getElementById(id).textContent = id === 'totalExplosive' ? '0 kg' : '₹0');
            }
        }

        function prepareChartData(data, chartType) {
            if (chartType === 'pie' || chartType === 'doughnut') {
                // Cost breakdown pie chart - use all filtered data (all have valid totalExpCost > 0)
                const totalExplosive = data.reduce((sum, row) => sum + row.totalExpCost, 0);
                const totalInitiator = data.map(row => row.blastAccessoriesDelayCost).filter(v => !isNaN(v)).reduce((sum, v) => sum + v, 0);
                const totalDrilling = data.map(row => row.drillingCost).filter(v => !isNaN(v)).reduce((sum, v) => sum + v, 0);
                const totalManpower = data.map(row => row.manPowerCost).filter(v => !isNaN(v)).reduce((sum, v) => sum + v, 0);
                
                return {
                    labels: ['Explosive Cost', 'Initiator/Accessories', 'Drilling Cost', 'Manpower Cost'],
                    datasets: [{
                        data: [totalExplosive, totalInitiator, totalDrilling, totalManpower],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                };
            }
            
            if (chartType === 'radar') {
                // Multi-metric radar chart - use all filtered data
                const validCostData = data.filter(row => !isNaN(row.totalExpCost) && row.totalExpCost > 0);
                const avgExplosive = validCostData.reduce((sum, row) => sum + row.totalExpCost, 0) / validCostData.length;
                
                const validInitiatorData = data.filter(row => !isNaN(row.blastAccessoriesDelayCost));
                const avgInitiator = validInitiatorData.length > 0 ? 
                    validInitiatorData.reduce((sum, row) => sum + row.blastAccessoriesDelayCost, 0) / validInitiatorData.length : 0;
                
                const validDrillingData = data.filter(row => !isNaN(row.drillingCost));
                const avgDrilling = validDrillingData.length > 0 ? 
                    validDrillingData.reduce((sum, row) => sum + row.drillingCost, 0) / validDrillingData.length : 0;
                
                const validManpowerData = data.filter(row => !isNaN(row.manPowerCost));
                const avgManpower = validManpowerData.length > 0 ? 
                    validManpowerData.reduce((sum, row) => sum + row.manPowerCost, 0) / validManpowerData.length : 0;
                
                const validExplosiveKgData = data.filter(row => !isNaN(row.totalExplosiveKg));
                const avgExplosiveKg = validExplosiveKgData.length > 0 ? 
                    validExplosiveKgData.reduce((sum, row) => sum + row.totalExplosiveKg, 0) / validExplosiveKgData.length : 0;
                
                return {
                    labels: ['Explosive Cost', 'Initiator Cost', 'Drilling Cost', 'Manpower Cost', 'Explosive Quantity'],
                    datasets: [{
                        label: 'Average Values',
                        data: [avgExplosive, avgInitiator, avgDrilling, avgManpower, avgExplosiveKg * 10], // Scale explosive kg for visibility
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(76, 175, 80, 1)'
                    }]
                };
            }
            
            if (chartType === 'scatter') {
                // Scatter plot: Explosive quantity vs Total cost - use record range data
                const rangeData = getRecordRangeData();
                const scatterData = rangeData
                    .filter(row => !isNaN(row.totalExplosiveKg) && !isNaN(row.totalExpCost) && row.totalExpCost > 0)
                    .map(row => ({
                        x: row.totalExplosiveKg,
                        y: row.totalExpCost
                    }));
                
                return {
                    datasets: [{
                        label: 'Explosive Kg vs Total Cost',
                        data: scatterData,
                        backgroundColor: 'rgba(76, 175, 80, 0.6)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 1
                    }]
                };
            }
            
            // Bar and Line charts - use record range data (all have valid totalExpCost > 0)
            const rangeData = getRecordRangeData();
            const startRecord = parseInt(document.getElementById('recordStart').value) || 1;
            const labels = rangeData.map((_, index) => `Record ${startRecord + index}`);
            
            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Explosive Cost',
                        data: rangeData.map(row => row.totalExpCost || 0),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: chartType === 'line' ? false : true
                    },
                    {
                        label: 'Drilling Cost',
                        data: rangeData.map(row => row.drillingCost || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: chartType === 'line' ? false : true
                    },
                    {
                        label: 'Manpower Cost',
                        data: rangeData.map(row => row.manPowerCost || 0),
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2,
                        fill: chartType === 'line' ? false : true
                    },
                    {
                        label: 'Initiator/Accessories Cost',
                        data: rangeData.map(row => row.blastAccessoriesDelayCost || 0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: chartType === 'line' ? false : true
                    }
                ]
            };
        }

        function updateDataTable() {
            const filteredData = getFilteredData();
            const tableContainer = document.getElementById('tableContainer');

            if (filteredData.length === 0) {
                tableContainer.innerHTML = '<p>No data to display</p>';
                return;
            }

            // Headers including S.No
            const headers = [
                'S.No',
                'Blast Date',
                'Total Exp Cost (Processed)',
                'Total Explosive Kg (Processed)',
                'Blast Accessories Cost (Processed)',
                'Drilling Cost (Processed)',
                'Manpower Cost (Processed)'
            ];

            // Build the table header
            let tableHTML = '<table><thead><tr>';
            headers.forEach(h => {
                tableHTML += `<th style="background-color:#e8f5e8;">${h}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';

            // Iterate over all records (all have valid totalExpCost > 0)
            filteredData.forEach((row, index) => {
                const prettyDate = row.BlastDate ? row.BlastDate : 'N/A';

                const processedValues = [
                    index + 1, // S.No
                    prettyDate,
                    `₹${row.totalExpCost.toFixed(2)}`, // We know this is valid and > 0
                    isFinite(row.totalExplosiveKg) ? `${row.totalExplosiveKg.toFixed(2)} kg` : 'N/A',
                    isFinite(row.blastAccessoriesDelayCost) ? `₹${row.blastAccessoriesDelayCost.toFixed(2)}` : 'N/A',
                    isFinite(row.drillingCost) ? `₹${row.drillingCost.toFixed(2)}` : 'N/A',
                    isFinite(row.manPowerCost) ? `₹${row.manPowerCost.toFixed(2)}` : 'N/A'
                ];

                tableHTML += '<tr>';
                processedValues.forEach(val => {
                    tableHTML += `<td style="background-color:#f8fff8;">${val}</td>`;
                });
                tableHTML += '</tr>';
            });

            tableHTML += '</tbody></table>';
            tableContainer.innerHTML = tableHTML;
        }

        function showAlert(message, type) {
            const alertContainer = document.getElementById('alertContainer');
            const alertClass = type === 'error' ? 'alert-error' : 
                              type === 'success' ? 'alert-success' : '';
            
            alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
            
            if (type !== 'loading') {
                setTimeout(() => {
                    alertContainer.innerHTML = '';
                }, 5000);
            }
        }
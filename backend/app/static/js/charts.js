console.log("Charts.js loaded!");

let accessChart = null;
let hourlyChart = null;
let airlineChart = null;


function updateAccessChart() {
    console.log("Updating access chart...");
    const tbody = document.querySelector('#dataTable tbody');
    
    if (!tbody) {
        console.log("No data table found");
        return;
    }

    const accessCounts = {
        'Priority Pass': 0,
        'Lounge Key': 0,
        'Business SkyTeam': 0,
        'Elite+': 0
    };

    Array.from(tbody.rows).forEach(row => {
        const accessMethod = row.cells[2].textContent.trim();
        const guestCount = parseInt(row.cells[4].textContent) || 0;
        
        if (accessCounts.hasOwnProperty(accessMethod)) {
            accessCounts[accessMethod] += (1 + guestCount);
        }
    });

    const canvas = document.getElementById('accessChart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (accessChart) {
        accessChart.destroy();
    }

    // Create new chart
    accessChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(accessCounts).map((key, index) => 
                key + '\n' + Object.values(accessCounts)[index]
            ),
            datasets: [{
                label: 'Number of PAX',
                data: Object.values(accessCounts),
                backgroundColor: '#4CAF50',
                borderWidth: 1,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            height: 300,
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: '#E5E5E5'
                    },
                    ticks: {
                        stepSize: 5,
                        font: {
                            size: 14
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 5,
                        font: {
                            size: 14
                        },
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateHourlyChart() {
    console.log("Updating hourly chart...");
    const tbody = document.querySelector('#dataTable tbody');
    
    if (!tbody) {
        console.log("No data table found");
        return;
    }

    // Initialize counts for all 24 hours
    const hourlyData = Array(24).fill(0);

    Array.from(tbody.rows).forEach(row => {
        const entryTime = row.cells[6].textContent.trim();
        const guestCount = parseInt(row.cells[4].textContent) || 0;
        
        const hour = parseInt(entryTime.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
            hourlyData[hour] += (1 + guestCount);
        }
    });

    const canvas = document.getElementById('hourlyChart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (hourlyChart) {
        hourlyChart.destroy();
    }

    // Create new chart
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
            datasets: [{
                label: 'PAX per Hour',
                data: hourlyData,
                borderColor: '#4a90e2',
                backgroundColor: '#4a90e2',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            height: 300,
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: '#E5E5E5'
                    },
                    ticks: {
                        stepSize: 5,
                        font: {
                            size: 14
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        maxRotation: 0,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Set up interval for updates
setInterval(() => {
    updateAccessChart();
    updateHourlyChart();
    updateAirlineChart();
    if (document.getElementById('mainTab').style.display !== 'none') {
        updateShowerDashboard();
    }
}, 60000); // Update every minute

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing charts...");
    updateAccessChart();
    updateHourlyChart();
    updateAirlineChart();
});

function updateAirlineChart() {
    console.log("Updating airline chart...");
    const tbody = document.querySelector('#dataTable tbody');
    
    if (!tbody) {
        console.log("No data table found");
        return;
    }

    const LOUNGE_CAPACITY = 160;
    const SKYTEAM_AIRLINES = ['AR', 'AM', 'DL', 'AF', 'KL'];
    const AIRLINE_NAMES = {
        'LA': 'LATAM',
        'H2': 'SKY',
        'AR': 'Aerolineas',
        'AM': 'Aeromexico',
        'DL': 'Delta',
        'AF': 'Air France',
        'KL': 'KLM'
    };

    const AIRLINE_COLORS = {
        'LA': '#2E7D32', // Dark green
        'H2': '#81C784', // Light green
        'AR': '#1565C0', // Dark blue
        'AM': '#64B5F6', // Light blue
        'DL': '#3F51B5', // Royal blue
        'AF': '#283593', // Navy blue
        'KL': '#03A9F4'  // Sky blue
    };

    const airlineCounts = {};

    // Count active PAX by airline
    Array.from(tbody.rows).forEach(row => {
        const flightStatus = row.cells[9].textContent.trim();
        
        // Skip if PAX has departed
        if (['SALIDO', 'ULTIMA LLAMADA', 'PUERTA CERRADA'].includes(flightStatus)) {
            return;
        }

        // Check if within 4-hour limit
        const currentTime = new Date();
        const exitTimeStr = row.cells[7].textContent.trim();
        const [exitHour, exitMinute] = exitTimeStr.split(':').map(Number);
        const exitTime = new Date();
        exitTime.setHours(exitHour, exitMinute);

        if (exitTime < currentTime) {
            return;
        }

        // Get airline code and guest count
        const airlineCode = row.cells[3].textContent.trim().substring(0, 2);
        const guestCount = parseInt(row.cells[4].textContent) || 0;
        
        // Initialize or increment airline count
        airlineCounts[airlineCode] = (airlineCounts[airlineCode] || 0) + (1 + guestCount);
    });

    // Calculate total occupancy
    const totalOccupancy = Object.values(airlineCounts).reduce((sum, count) => sum + count, 0);
    const occupancyPercentage = (totalOccupancy / LOUNGE_CAPACITY * 100).toFixed(1);

    // Prepare data for chart - only include airlines with PAX
    const data = Object.entries(airlineCounts)
        .filter(([_, count]) => count > 0)
        .map(([code, count]) => ({
            name: AIRLINE_NAMES[code] || code,
            value: count,
            percentage: ((count / LOUNGE_CAPACITY) * 100).toFixed(1),
            color: AIRLINE_COLORS[code]
        }));

    const canvas = document.getElementById('airlineChart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (airlineChart) {
        airlineChart.destroy();
    }

    // Create new chart
    airlineChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => `${item.name} (${item.percentage}%)`),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: data.map(item => item.color),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => ({
                                    text: label,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: isNaN(data.datasets[0].data[i]),
                                    lineCap: 'butt',
                                    lineDash: [],
                                    lineDashOffset: 0,
                                    lineJoin: 'miter',
                                    lineWidth: 1,
                                    strokeStyle: '#fff',
                                    pointStyle: 'circle',
                                    rotation: 0
                                }));
                            }
                            return [];
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Total Occupancy: ${occupancyPercentage}% (${totalOccupancy}/${LOUNGE_CAPACITY})`,
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function updateAverageStayTimes() {
    const tbody = document.querySelector('#dataTable tbody');
    if (!tbody) return;

    const AIRLINE_NAMES = {
        'LA': 'LATAM',
        'H2': 'SKY',
        'AR': 'Aerolineas',
        'AM': 'Aeromexico',
        'DL': 'Delta',
        'AF': 'Air France',
        'KL': 'KLM'
    };

    const AIRLINE_COLORS = {
        'LA': '#2E7D32', // Dark green
        'H2': '#81C784', // Light green
        'AR': '#1565C0', // Dark blue
        'AM': '#64B5F6', // Light blue
        'DL': '#3F51B5', // Royal blue
        'AF': '#283593', // Navy blue
        'KL': '#03A9F4'  // Sky blue
    };

    // Initialize stay time tracking
    const stayTimes = {};
    const stayCounters = {};

    Array.from(tbody.rows).forEach(row => {
        const status = row.cells[9].textContent.trim();
        const flightTime = row.cells[8].textContent.trim();
        
        // Only count PAX who have actually departed
        if (status === 'SALIDO' && flightTime !== 'SALIDO') {
            const airlineCode = row.cells[3].textContent.trim().substring(0, 2);
            const entryTime = row.cells[6].textContent.trim();
            
            // Create Date objects for comparison
            const entryDateTime = new Date(`2025-02-14 ${entryTime}`);
            const flightDateTime = new Date(`2025-02-14 ${flightTime}`);
            
            // If flight time is earlier than entry time, it's probably next day
            if (flightDateTime < entryDateTime) {
                flightDateTime.setDate(flightDateTime.getDate() + 1);
            }

            const stayDuration = (flightDateTime - entryDateTime) / (1000 * 60 * 60); // Convert to hours

            // Only count reasonable stay times (between 0.5 and 8 hours)
            if (stayDuration > 0.5 && stayDuration < 8) {
                if (!stayTimes[airlineCode]) {
                    stayTimes[airlineCode] = 0;
                    stayCounters[airlineCode] = 0;
                }
                stayTimes[airlineCode] += stayDuration;
                stayCounters[airlineCode]++;
            }
        }
    });

    // Calculate averages and format table
    const stayTimeTable = document.querySelector('.stay-time-table tbody');
    stayTimeTable.innerHTML = '';

    Object.keys(AIRLINE_NAMES).forEach(airlineCode => {
        if (stayCounters[airlineCode]) {
            const avgTime = stayTimes[airlineCode] / stayCounters[airlineCode];
            const hours = Math.floor(avgTime);
            const minutes = Math.round((avgTime - hours) * 60);
            
            const tr = document.createElement('tr');
            tr.style.borderLeft = `4px solid ${AIRLINE_COLORS[airlineCode]}`; // Add color indicator
            tr.innerHTML = `
                <td>${AIRLINE_NAMES[airlineCode]}</td>
                <td>${hours}h ${minutes}m</td>
            `;
            stayTimeTable.appendChild(tr);
        }
    });
}

// Add to your update cycle
setInterval(() => {
    updateAccessChart();
    updateHourlyChart();
    updateAirlineChart();
    updateAverageStayTimes();
    if (document.getElementById('mainTab').style.display !== 'none') {
        updateShowerDashboard();
    }
}, 60000);

// Add to your DOM content loaded event
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing charts...");
    updateAccessChart();
    updateHourlyChart();
    updateAirlineChart();
    updateAverageStayTimes();
});
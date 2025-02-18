console.log("Alerts.js loaded!");

// Global variables
let activeAlerts = [];
const DEPARTURE_STATUSES = ['SALIDO', 'ULTIMA LLAMADA', 'PUERTA CERRADA'];

// Alert Management Functions
window.resolveAlert = function(alertId) {
    const initials = prompt("Enter your initials:");
    if (!initials) return;

    activeAlerts = activeAlerts.filter(alert => alert.id !== alertId);
    renderAlerts();
};

window.addNote = function(alertId) {
    const initials = prompt("Enter your initials:");
    if (!initials) return;
    
    const noteText = prompt("Enter your note:");
    if (!noteText) return;

    const alert = activeAlerts.find(a => a.id === alertId);
    if (alert) {
        if (!alert.notes) {
            alert.notes = [];
        }
        alert.notes.push({
            text: noteText,
            initials: initials,
            timestamp: new Date()
        });
        renderAlerts();
    }
};

function hasActiveAlert(type, paxName) {
    return activeAlerts.some(alert => 
        alert.type === type && 
        alert.data.paxName === paxName
    );
}

function createAlert(type, data) {
    activeAlerts.push({
        id: data.id,
        type: type,
        data: data,
        notes: []
    });
}

// Main Alert Check Functions 
function checkStayLimitAlerts() {
    const tbody = document.querySelector('#dataTable tbody');
    if (!tbody) {
        console.log('No tbody found');
        return;
    }

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    console.log(`Current time: ${currentHour}:${currentMinute}`);
    
    Array.from(tbody.rows).forEach(row => {
        const status = row.cells[9].textContent.trim();
        const paxName = row.cells[1].textContent.trim();
        const exitTimeStr = row.cells[7].textContent.trim();
        
        console.log(`Checking PAX: ${paxName}`);
        console.log(`Status: ${status}`);
        console.log(`Exit time: ${exitTimeStr}`);
        
        // Skip if PAX has departed
        if (DEPARTURE_STATUSES.includes(status)) {
            console.log(`Skipping ${paxName} - departed`);
            return;
        }

        const [exitHour, exitMinute] = exitTimeStr.split(':').map(Number);
        const exitInMinutes = exitHour * 60 + exitMinute;
        const currentInMinutes = currentHour * 60 + currentMinute;
        
        console.log(`Exit time in minutes: ${exitInMinutes}`);
        console.log(`Current time in minutes: ${currentInMinutes}`);
        console.log(`Has active alert: ${hasActiveAlert('stayLimit', paxName)}`);

        // If exit time is in the past and no active alert exists
        if (exitInMinutes < currentInMinutes && !hasActiveAlert('stayLimit', paxName)) {
            console.log(`Creating alert for ${paxName}`);
            const guestCount = parseInt(row.cells[4].textContent) || 0;
            
            createAlert('stayLimit', {
                paxName: paxName,
                guestCount: guestCount,
                alertTime: new Date(),
                id: Date.now()
            });
        } else {
            console.log(`No alert needed for ${paxName}`);
        }
    });

    console.log('Active alerts:', activeAlerts);
    renderAlerts();
}

function renderAlerts() {
    const alertsContainer = document.getElementById('activeAlerts');
    if (!alertsContainer) return;
    
    alertsContainer.innerHTML = '';

    activeAlerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        
        if (alert.type === 'stayLimit') {
            const guestText = alert.data.guestCount > 0 ? 
                ` and their ${alert.data.guestCount} guest${alert.data.guestCount > 1 ? 's' : ''}` : 
                '';
            
            const latestNote = alert.notes && alert.notes.length > 0 ? 
                alert.notes[alert.notes.length - 1] : null;
            
            alertElement.innerHTML = `
                <div class="alert-content">
                    <strong>! Action Needed:</strong> ${alert.data.paxName}${guestText} has reached their 4 hour limit
                    ${latestNote ? `
                        <div class="alert-note">
                            <strong>Note (${latestNote.initials}):</strong> 
                            ${latestNote.text}
                            <span class="note-time">${new Date(latestNote.timestamp).toLocaleTimeString()}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="alert-buttons">
                    <button class="resolve-btn" onclick="window.resolveAlert(${alert.id})">Resolve</button>
                    <button class="note-btn" onclick="window.addNote(${alert.id})">Leave Note</button>
                </div>
            `;
        }
        
        alertsContainer.appendChild(alertElement);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing alerts system...");
    // Initial check
    checkStayLimitAlerts();
    // Set up periodic checks
    setInterval(checkStayLimitAlerts, 60000); // Check every minute
});
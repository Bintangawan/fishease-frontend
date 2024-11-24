// Get token from AuthService
const token = authService.getToken();

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // formats as DD/MM/YYYY
}

// Function to update profile UI
function updateProfileUI(userData) {
    document.querySelector('.user-info').innerHTML = `
        <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
        <p><strong>Account Created:</strong> ${formatDate(userData.created_at) || 'N/A'}</p>
        <p><strong>Phone Number:</strong> ${userData.phone || 'N/A'}</p>
    `;
}

// Function to update entry count
function updateEntryCount(totalScans) {
    document.querySelector('.entry-stat h1').textContent = totalScans;
}

// Function to fetch user data
async function fetchUserData() {
    try {
        const response = await fetch('http://localhost:3000/user/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const { data } = await response.json();
        updateProfileUI(data);

    } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error - maybe show an error message to user
    }
}

// Function to fetch scan history
async function fetchScanHistory() {
    try {
        const response = await fetch('http://localhost:3000/user/scan-history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch scan history');
        }

        const data = await response.json();
        updateEntryCount(data.total_scans);

    } catch (error) {
        console.error('Error fetching scan history:', error);
        // Handle error - maybe show an error message to user
    }
}

// Check if user is logged in before fetching data
if (authService.isLoggedIn()) {
    // Fetch both user data and scan history when page loads
    fetchUserData();
    fetchScanHistory();
} else {
    // Redirect to login page if not logged in
    window.location.href = '/admin-login/login.html';
}
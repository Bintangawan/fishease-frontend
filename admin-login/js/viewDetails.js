document.addEventListener('DOMContentLoaded', function() {
    // Get token from AuthService
    const token = authService.getToken();

    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // formats as DD/MM/YYYY
    }

    // Function to fetch entry details
    async function fetchEntryDetails(entryId) {
        try {
            const response = await fetch(`http://localhost:3000/scan-history/${entryId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch entry details');
            }

            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching entry details:', error);
            return null;
        }
    }

    // Function to fetch disease information
    async function fetchDiseaseInfo(diseaseName) {
        try {
            const response = await fetch('http://localhost:3000/disease-info', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ disease_name: diseaseName })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch disease information');
            }

            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching disease information:', error);
            return null;
        }
    }

    // Function to update UI with entry and disease details
    function updateDetailsUI(entryDetails, diseaseInfo) {
        // Update entry info box
        document.querySelector('.entry-info-box').innerHTML = `
            <p><strong>Entry ID:</strong> #${entryDetails.id_entry}</p>
            <p><strong>Identified Disease:</strong> ${entryDetails.disease_name}</p>
            <p><strong>Date:</strong> ${formatDate(entryDetails.created_at)}</p>
        `;

        // Update confidence box
        document.querySelector('.confidence-box div h1').textContent = 
            `${(entryDetails.confidence_score * 100).toFixed(0)}%`;

        // Update image
        const imageElement = document.querySelector('.image-section img');
        imageElement.src = entryDetails.img_url || 'images/placeholder.jpg';
        imageElement.alt = `${entryDetails.disease_name} Image`;

        // Update description section
        document.querySelector('.description-section p').textContent = 
            diseaseInfo.description || 'No description available.';

        // Update affected species
        const affectedSpeciesList = document.querySelector('.affected-species ul');
        affectedSpeciesList.innerHTML = diseaseInfo.affected_fish
            .split(',')
            .map(species => `<li>${species.trim()}</li>`)
            .join('');
    }

    // Main initialization function
    async function initViewDetails() {
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const entryId = urlParams.get('entryId');
        const diseaseName = urlParams.get('diseaseName');

        if (!entryId || !diseaseName) {
            console.error('Missing entry ID or disease name');
            return;
        }

        // Fetch entry and disease details
        const entryDetails = await fetchEntryDetails(entryId);
        const diseaseInfo = await fetchDiseaseInfo(diseaseName);

        if (entryDetails && diseaseInfo) {
            updateDetailsUI(entryDetails, diseaseInfo);
        } else {
            // Handle error case
            document.querySelector('.main-content').innerHTML = `
                <div class="error-message">
                    <p>Unable to load entry details. Please try again later.</p>
                </div>
            `;
        }
    }

    // Check if user is logged in before initializing
    if (authService.isLoggedIn()) {
        initViewDetails();
    } else {
        // Redirect to login page if not logged in
        window.location.href = '/login.html';
    }
});
// Wait for the DOM to be fully loaded before attaching event listeners and running scripts*
document.addEventListener('DOMContentLoaded', function() {
    // Create dialog elements*
    function createDialogs() {
        // Confirmation Dialog*
        const confirmDialog = document.createElement('dialog');
        confirmDialog.id = 'confirm-delete-dialog';
        confirmDialog.innerHTML = `
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this entry?</p>
            <form method="dialog">
                <div class="dialog-actions">
                    <button type="button" id="cancel-delete-btn">Cancel</button>
                    <button type="button" id="confirm-delete-btn">Confirm</button>
                </div>
            </form>
        `;
        document.body.appendChild(confirmDialog);

        // Success Dialog*
        const successDialog = document.createElement('dialog');
        successDialog.id = 'success-dialog';
        successDialog.innerHTML = `
            <h2>Deletion Successful</h2>
            <p id="success-message">The entry has been deleted.</p>
            <form method="dialog">
                <button>OK</button>
            </form>
        `;
        document.body.appendChild(successDialog);

        // Style the dialogs*
        const style = document.createElement('style');
        style.textContent = `
            dialog {
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 400px;
                width: 90%;
            }
            dialog::backdrop {
                background-color: rgba(0,0,0,0.5);
            }
            .dialog-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            }
            dialog button {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            #cancel-delete-btn {
                background-color: #f0f0f0;
                color: black;
            }
            #confirm-delete-btn {
                background-color: #f44336;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Get token from AuthService*
    const token = authService.getToken();

    // Function to format date*
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // formats as DD/MM/YYYY*
    }

    // Function to update profile UI*
    function updateProfileUI(userData) {
        const userInfoElement = document.querySelector('.user-info');
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
                <p><strong>Account Created:</strong> ${formatDate(userData.created_at) || 'N/A'}</p>
                <p><strong>Phone Number:</strong> ${userData.phone || 'N/A'}</p>
            `;
        }
    }

    // Function to create entry item HTML*
    function createEntryItemHTML(entry) {
        return `
        <div class="entry-item">
            <div class="entry-info" data-entry-id="${entry.id_entry}">
                <p><strong>Entry ID:</strong> #${entry.id_entry}</p>
                <p><strong>Disease:</strong> ${entry.disease_name}</p>
                <p><strong>Confidence:</strong> ${(entry.confidence_score * 100).toFixed(0)}%</p>
                <p><strong>Date:</strong> ${formatDate(entry.created_at)}</p>
            </div>
            <div class="entry-actions">
                <a href="#" data-action="delete"><i class="fa-solid fa-trash"></i></a>
                <a href="viewDetails.html?entryId=${entry.id_entry}">
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </div>
        `;
    }

    // Function to render scan history*
    function renderScanHistory(scans) {
        const entryHistoryContainer = document.querySelector('.main-content');
        const titleElement = entryHistoryContainer.querySelector('.title');
        
        if (!entryHistoryContainer || !titleElement) {
            console.error('Required elements not found');
            return;
        }
        
        // Remove existing entry items*
        const existingEntryItems = entryHistoryContainer.querySelectorAll('.entry-item');
        existingEntryItems.forEach(item => item.remove());

        // Render each scan entry*
        scans.forEach(entry => {
            const entryHTML = createEntryItemHTML(entry);
            titleElement.insertAdjacentHTML('afterend', entryHTML);
        });
    }

    // Function to update entry count*
    function updateEntryCount(totalScans) {
        const entryCountElement = document.querySelector('.entry-stat h1');
        if (entryCountElement) {
            entryCountElement.textContent = totalScans;
        }
    }

    // Function to fetch user data*
    async function fetchUserData() {
        try {
            const response = await fetch('http://localhost:3000/userInfo', {
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
        }
    }

    // Function to fetch scan history*
    async function fetchScanHistory() {
        try {
            const response = await fetch('http://localhost:3000/scan-history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch scan history');
            }
            const { total_scans, data } = await response.json();
            
            // Update entry count*
            updateEntryCount(total_scans);

            // Render scan history*
            renderScanHistory(data);
        } catch (error) {
            console.error('Error fetching scan history:', error);
            updateEntryCount(0);
        }
    }

    // Function to delete an entry*
    async function deleteEntry(event) {
        event.preventDefault();
        
        // Find the closest entry item and its ID*
        const entryItem = event.target.closest('.entry-item');
        const entryInfoElement = entryItem.querySelector('.entry-info');
        
        if (!entryInfoElement) {
            console.error('Entry ID not found');
            return;
        }
        
        const entryId = entryInfoElement.getAttribute('data-entry-id');
        const entryDisease = entryInfoElement.querySelector('p:nth-child(2)').textContent.replace('Disease: ', '');
        
        // Get dialog elements*
        const confirmDialog = document.getElementById('confirm-delete-dialog');
        const successDialog = document.getElementById('success-dialog');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        
        // Set dialog message*
        confirmDialog.querySelector('p').textContent = 
            `Are you sure you want to delete the entry for ${entryDisease}?`;
        
        // Show confirmation dialog*
        confirmDialog.showModal();
        
        // Wait for user action*
        const confirmPromise = new Promise((resolve, reject) => {
            // Confirm button*
            confirmDeleteBtn.onclick = async () => {
                confirmDialog.close();
                
                try {
                    const response = await fetch(`http://localhost:3000/scan-history/${entryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete entry');
                    }

                    // Remove the entry item from the DOM*
                    entryItem.remove();

                    // Refresh scan history to update the count*
                    await fetchScanHistory();

                    // Update success dialog message*
                    successDialog.querySelector('#success-message').textContent = 
                        `The entry for ${entryDisease} has been successfully deleted.`;

                    // Show success dialog*
                    successDialog.showModal();

                } catch (error) {
                    console.error('Error deleting entry:', error);
                    
                    // Update success dialog message for error*
                    successDialog.querySelector('#success-message').textContent = 
                        'Failed to delete entry. Please try again.';
                    successDialog.showModal();
                }
            };
            
            // Cancel button*
            cancelDeleteBtn.onclick = () => {
                confirmDialog.close();
            };
        });
    }

    createDialogs();

   // Add event delegation for delete buttons*
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('click', function(event) {
            // Check if the clicked element is inside a delete button*
            const deleteButton = event.target.closest('a[data-action="delete"]');
            if (deleteButton) {
                deleteEntry(event);
            }
        });
    }


    // Check if user is logged in before fetching data*
    if (authService.isLoggedIn()) {
        // Fetch both user data and scan history when page loads*
        fetchUserData();
        fetchScanHistory();
    } else {
        // Redirect to login page if not logged in*
        window.location.href = '/login.html';
    }
});
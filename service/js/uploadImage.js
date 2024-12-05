API_URL = 'http://localhost:3000'; // Change in prod

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.querySelector('.upload-form');
    const fileInput = document.getElementById('fish-image');

    // Create loading overlay
    function createLoadingOverlay() {
       const overlay = document.createElement('div');
       overlay.innerHTML = `
       <link rel="stylesheet" href="css/loading.css" />
        <div class="loading-overlay">
         <div class="spinner">
          <div class="spinner-inner"></div>
         </div>
         <p>Analyzing image...</p>
        </div>
       `;
       document.body.appendChild(overlay);
       return overlay;
      }
  
    // Remove loading overlay
    function removeLoadingOverlay(overlay) {
     if (overlay) overlay.remove();
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select an image to upload');
            return;
        }

        const loadingOverlay = createLoadingOverlay();

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URL}/service/predict`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to details page with entry and disease information
                window.location.href = `viewDetails.html?entryId=${result.entryId}&diseaseName=${encodeURIComponent(result.diseaseName)}`;
            } else {
                throw new Error(result.message || 'Prediction failed');
            }
        } 

        catch (error) {
            console.error('Upload error:', error);
            alert(`Error: ${error.detail || error.message || error}\nPlease try again later or try another image`);
        }

        finally {
            removeLoadingOverlay(loadingOverlay);
        }
    });
});

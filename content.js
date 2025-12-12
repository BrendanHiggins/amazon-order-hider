// Finds all saved order IDs on the page and hides their corresponding order card elements
function hideMatchingOrders() {
    console.log('[Amazon Order Hider] --- Running hideMatchingOrders ---');

    // Get the locally saved list of order objects.
    chrome.storage.local.get({hiddenOrders: []}, (data) => {
        const hiddenOrders = data.hiddenOrders; 
        
        // Create a simple array of just the IDs.
        const hiddenOrderIds = hiddenOrders.map(order => order.id);

        if (hiddenOrderIds.length === 0) {
            return;
        }

        // Based on your HTML: <div class="yohtmlc-order-id">
        const orderIdElements = document.querySelectorAll('.yohtmlc-order-id');
        
        orderIdElements.forEach(element => {
            const textContent = element.innerText || '';
            // Regex to find 123-1234567-1234567 format
            const match = textContent.match(/(\d{3}-\d{7}-\d{7})/);

            if (match) {
                const matchedId = match[0];
                
                if (hiddenOrderIds.includes(matchedId)) {

                    const orderCard = element.closest('.order-card');
                    
                    if (orderCard) {
                        orderCard.style.display = 'none';
                        console.log(`[Amazon Order Hider] SUCCESS: Hid order ${matchedId}`);
                    } else {
                        console.warn(`[Amazon Order Hider] FAILED: Matched ID ${matchedId} but could not find parent .order-card`);
                    }
                }
            }
        });
    });
}

// --- Dynamic Content Handling ---
console.log('[Amazon Order Hider] Content script loaded.');
hideMatchingOrders();

const observer = new MutationObserver((mutations) => {
    let timeoutId;
    clearTimeout(timeoutId);
    // Debounce slightly to avoid running on every single DOM node insertion
    timeoutId = setTimeout(() => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
            hideMatchingOrders();
        }
    }, 500);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

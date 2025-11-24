/**
* Finds all saved order IDs on the page and hides their corresponding order card elements.
*/
function hideMatchingOrders() {
    console.log('[Amazon Order Hider] --- Running hideMatchingOrders ---');

    // Get the locally saved list of order objects.
    chrome.storage.local.get({hiddenOrders: []}, (data) => {
        // This is now an array of objects: [{id, dateAdded}, ...]
        const hiddenOrders = data.hiddenOrders; 
        
        // Create a simple array of just the IDs from the list of objects.
        const hiddenOrderIds = hiddenOrders.map(order => order.id);

        console.log(`[Amazon Order Hider] Step 1: Retrieved ${hiddenOrderIds.length} order ID(s) to hide:`, hiddenOrderIds);

        if (hiddenOrderIds.length === 0) {
            return;
        }

        // Find all potential elements on the page that might contain an order ID.
        const orderIdElements = document.querySelectorAll('.yohtmlc-order-id');
        
        console.log(`[Amazon Order Hider] Step 2: Found ${orderIdElements.length} potential order ID elements.`);

        orderIdElements.forEach(element => {
            const textContent = element.innerText || '';
            const match = textContent.match(/(\d{3}-\d{7}-\d{7})/);

            if (match) {
                const matchedId = match[0];
                
                // --- UPDATED LOGIC ---
                // Check if the extracted ID is in our new list of IDs.
                if (hiddenOrderIds.includes(matchedId)) {
                    console.log(`[Amazon Order Hider] MATCH FOUND! Hiding order: ${matchedId}`);
                    
                    const orderListItem = element.closest('.order-card');
                    
                    if (orderListItem) {
                        orderListItem.style.display = 'none';
                        console.log(`[Amazon Order Hider] SUCCESS: Hid parent '.order-card' for order ${matchedId}`);
                    } else {
                        console.error(`[Amazon Order Hider] FAILED: Could not find parent '.order-card' for order ${matchedId}`);
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
    timeoutId = setTimeout(() => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
            console.log('[Amazon Order Hider] Page changed, re-running hide check.');
            hideMatchingOrders();
        }
    }, 500);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('[Amazon Order Hider] Mutation observer is now active.');

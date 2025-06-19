document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const orderIdInput = document.getElementById('orderIdInput');
    const saveButton = document.getElementById('saveButton');
    const statusEl = document.getElementById('status');
    const orderList = document.getElementById('orderList');

    /**
     * Renders the full list of hidden orders to the UI.
     * @param {Array<object>} [orders=[]] - The array of order objects to display.
     */
    const displayOrders = (orders = []) => {
        orderList.innerHTML = ''; // Clear the current list
        
        // Sort orders by date, newest first
        const sortedOrders = orders.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        sortedOrders.forEach(order => {
            const li = document.createElement('li');
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'order-details';

            const idSpan = document.createElement('span');
            idSpan.className = 'order-id';
            idSpan.textContent = order.id;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'order-date';
            dateSpan.textContent = `Hidden on: ${new Date(order.dateAdded).toLocaleDateString()}`;

            detailsDiv.appendChild(idSpan);
            detailsDiv.appendChild(dateSpan);
            
            const removeBtn = document.createElement('button');
            removeBtn.title = 'Stop hiding this order';
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => removeOrder(order.id);

            li.appendChild(detailsDiv);
            li.appendChild(removeBtn);
            orderList.appendChild(li);
        });
    };

    /**
     * Loads all orders from chrome.storage and triggers the display function.
     */
    const loadAndDisplay = () => {
        chrome.storage.local.get({ hiddenOrders: [] }, (data) => {
            displayOrders(data.hiddenOrders);
        });
    };

    /**
     * Sanitizes, validates, and saves a new order ID and the current date to storage.
     */
    const saveOrder = () => {
        const rawInput = orderIdInput.value;
        
        // --- NEW: Sanitize and Validate Input ---
        // Use a regular expression to find the valid order ID pattern within the input string.
        const match = rawInput.match(/\d{3}-\d{7}-\d{7}/);

        // If no match is found, the format is invalid.
        if (!match) {
            statusEl.textContent = 'Invalid Order ID format.';
            statusEl.style.color = '#f56565'; // Red
            setTimeout(() => statusEl.textContent = '', 3000);
            return; // Exit the function.
        }

        // The actual, clean order ID is the first (and only) item in the match array.
        const orderId = match[0];

        chrome.storage.local.get({ hiddenOrders: [] }, (data) => {
            const orders = data.hiddenOrders;
            // Check if an order with this ID already exists
            const alreadyExists = orders.some(order => order.id === orderId);

            if (!alreadyExists) {
                // Add a new object with the id and the current date
                orders.push({ 
                    id: orderId, 
                    dateAdded: new Date().toISOString() 
                });

                chrome.storage.local.set({ hiddenOrders: orders }, () => {
                    statusEl.textContent = 'Order saved!';
                    statusEl.style.color = '#48bb78'; // Green
                    orderIdInput.value = '';
                    loadAndDisplay();
                    setTimeout(() => statusEl.textContent = '', 2000);
                });
            } else {
                statusEl.textContent = 'Order ID is already hidden.';
                statusEl.style.color = '#f56565'; // Red
                setTimeout(() => statusEl.textContent = '', 2000);
            }
        });
    };

    /**
     * Removes an order object from storage based on its ID.
     * @param {string} orderIdToRemove - The ID of the order to remove.
     */
    const removeOrder = (orderIdToRemove) => {
        chrome.storage.local.get({ hiddenOrders: [] }, (data) => {
            const filteredOrders = data.hiddenOrders.filter(order => order.id !== orderIdToRemove);
            chrome.storage.local.set({ hiddenOrders: filteredOrders }, () => {
                loadAndDisplay();
            });
        });
    };

    // --- Event Listeners ---
    saveButton.addEventListener('click', saveOrder);
    
    orderIdInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            saveOrder();
        }
    });

    // --- Initial Load ---
    loadAndDisplay();
});

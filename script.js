const API_URL = 'http://localhost:5000/api/items'; 

async function displayItems() {
    const response = await fetch(API_URL);
    items = await response.json();
    const itemsContainer = document.getElementById('item-list');
    itemsContainer.innerHTML = '';

    if (Array.isArray(items)) {
        console.log("Items is an array:", items);
    } else {
        items = Object.values(items);
    }

    const totalItems = items.length;
    const itemsPerPage = 5; 
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = 1;

    const paginationInfo = document.getElementById('pagination-info');
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;


    items = items[0];

    // pull relative api analytics and display them here as well
    fetch(`http://localhost:5000/api/analytics/`, {
        method: 'GET'
    })
    .then(response => {
        if (response.ok) {
        return response.json(); 
        } else {
        throw new Error("Failed to fetch analytics: " + response.statusText);
        }
    })
    .then(analyticsData => {
        console.log("Analytics data:", analyticsData);
        console.log("Item analytics:", analyticsData[0]['name']);

        // Display analytics data on the page for each item
        const analyticsContainer = document.getElementById('analytics');
        analyticsContainer.innerHTML = '<h3>Analytics</h3>';
        analyticsData.forEach(itemAnalytics => {
            const itemAnalyticsElement = document.createElement('div');
            itemAnalyticsElement.className = 'item-analytics';
            itemAnalyticsElement.innerHTML = `
                <h4>${itemAnalytics['name']}</h4>
                <p>Total Vendors: ${itemAnalytics.vendorCount}</p>
                <p>Average Price: $${itemAnalytics.avgPrice}</p>
                <p>Cheapest Vendor: ${itemAnalytics.cheapestVendor}</p>
            `;
            analyticsContainer.appendChild(itemAnalyticsElement);
        });
    })
    .catch(error => {
        console.error("Error fetching analytics:", error);
    });

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = 
        `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <ul>
                ${item.vendors.map(vendor => `<li>${vendor.name}: $${vendor.price}</li>`).join('')}
            </ul>
            <button onclick="updateItem('${item._id}')">Update</button>
            <button onclick="deleteItem('${item._id}')">Delete</button>
        `;
        itemsContainer.appendChild(itemElement);
    });

}

async function addItem(event) {
    event.preventDefault();
    console.log("Adding item...");
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('description').value;
    const vendorsInput = document.getElementById('vendors').value;

    const vendors = vendorsInput.split(',').map(v => v.trim()).filter(v => v);
    const prices = document.getElementById('price').value.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));

    const newItem = {
        name,
        description,
        vendors: vendors.map((vendor, index) => ({ name: vendor, price: prices[index] || 0 }))
    };

    // Post the new item to the server
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            const createdItem = await response.json();
            console.log("Item created:", createdItem);
            displayItems(); // Refresh the item list
        } else {
            console.error("Failed to create item:", response.statusText);
        }
    } catch (error) {
        console.error("Error creating item:", error);
    }
}

function updateItem(id) {
    // ask user for new details and send update request to the server
    const name = prompt("Enter new item name:");
    const description = prompt("Enter new item description:");
    const vendorsInput = prompt("Enter new vendors (comma-separated):");
    const pricesInput = prompt("Enter respective prices (comma-separated):");

    const vendors = vendorsInput.split(',').map(v => v.trim()).filter(v => v);
    const prices = pricesInput.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));

    const updatedItem = {
        name,
        description,
        vendors: vendors.map((vendor, index) => ({ name: vendor, price: prices[index] || 0 }))
    };

    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedItem)
    })
    .then(response => {
        if (response.ok) {
            console.log("Item updated successfully!");
            displayItems(); // Refresh the item list
        } else {
            console.error("Failed to update item:", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error updating item:", error);
    });
}


function deleteItem(id) {
    // send delete request to the server
    fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log("Item deleted successfully!");
            displayItems(); // Refresh the item list
        } else {
            console.error("Failed to delete item:", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error deleting item:", error);
    });
}

function searchItems() {

    const searchTerm = document.getElementById('search').value;
    fetch(`${API_URL}?search=${encodeURIComponent(searchTerm)}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to search items: " + response.statusText);
        }
    })
    .then(items => {
        console.log("Search results:", items);
        // Update the item list with search results
        const itemsContainer = document.getElementById('item-list');
        itemsContainer.innerHTML = '';
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.innerHTML = 
            `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <ul></ul>
                    ${item.vendors.map(vendor => `<li>${vendor.name}: $${vendor.price}</li>`).join('')}
                </ul>
                <button onclick="updateItem('${item._id}')">Update</button>
                <button onclick="deleteItem('${item._id}')">Delete</button>
            `;
            itemsContainer.appendChild(itemElement);
        });
    })
    .catch(error => {
        console.error("Error searching items:", error);
    });
}

// Initial display of items when the page loads

displayItems();



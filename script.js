class Repository {
    constructor() {
        this.items = new Map();
        this.currentId = 1;
    }

    add(item) {
        const id = this.currentId++;
        this.items.set(id, {
            id,
            createdAt: new Date(),
            ...item
        });
        return id;
    }

    getById(id) {
        if (!this.items.has(id)) {
            throw new Error(`Item with ID ${id} not found`);
        }
        return this.items.get(id);
    }

    getAll() {
        return Array.from(this.items.values());
    }

    update(id, updatedItem) {
        if (!this.items.has(id)) {
            throw new Error(`Item with ID ${id} not found`);
        }
        
        const existingItem = this.items.get(id);
        this.items.set(id, {
            ...existingItem,
            ...updatedItem,
            id,
            updatedAt: new Date()
        });
        return this.items.get(id);
    }

    delete(id) {
        if (!this.items.has(id)) {
            throw new Error(`Item with ID ${id} not found`);
        }
        return this.items.delete(id);
    }

    isNameUnique(name) {
        return !Array.from(this.items.values()).some(item => item.name.toLowerCase() === name.toLowerCase());
    }

    isEmpty() {
        return this.items.size === 0;
    }
}

// Initialize repository
const repo = new Repository();

// UI Functions
function addItem() {
    const name = document.getElementById('itemName').value.trim();
    const imageFile = document.getElementById('itemImage').files[0];
    
    if (!name) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a name',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!repo.isNameUnique(name)) {
        Swal.fire({
            title: 'Duplicate Item',
            text: 'An item with this name already exists',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            const id = repo.add({ name, imageData });
            addItemToDisplay({ id, name, imageData, createdAt: new Date() });
            clearForm();
            Swal.fire({
                title: 'Success!',
                text: 'Item added successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        };
        reader.readAsDataURL(imageFile);
    } else {
        const id = repo.add({ name });
        addItemToDisplay({ id, name, createdAt: new Date() });
        clearForm();
        Swal.fire({
            title: 'Success!',
            text: 'Item added successfully (without image)',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
}

function addItemToDisplay(item) {
    const itemsList = document.getElementById('itemsList');
    const itemElement = document.createElement('div');
    itemElement.className = 'item';
    itemElement.id = `item-${item.id}`;
    itemElement.innerHTML = `
        <div class="item-content">
            <div class="item-image">
                ${item.imageData ? `<img src="${item.imageData}" alt="${item.name}">` : '<div class="no-image">No Image</div>'}
            </div>
            <div class="item-details">
                <strong>${item.name}</strong><br>
                <small>Created: ${item.createdAt.toLocaleString()}</small>
            </div>
        </div>
        <div class="item-actions">
            <button class="edit" onclick="editItem(${item.id})">Edit</button>
            <button class="delete" onclick="deleteItem(${item.id})">Delete</button>
        </div>
    `;
    itemsList.appendChild(itemElement);
    itemElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function deleteItem(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            repo.delete(id);
            const itemElement = document.getElementById(`item-${id}`);
            if (itemElement) {
                itemElement.remove();
            }
            Swal.fire(
                'Deleted!',
                'Your item has been deleted.',
                'success'
            );
        }
    });
}

function editItem(id) {
    const item = repo.getById(id);
    Swal.fire({
        title: 'Edit Item',
        html: `
            <input id="swal-input1" class="swal2-input" value="${item.name}">
            <input id="swal-input2" type="file" class="swal2-file" accept="image/*">
            ${item.imageData ? `<img src="${item.imageData}" alt="Current Image" style="max-width: 100%; max-height: 200px; margin-top: 10px;">` : ''}
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                name: document.getElementById('swal-input1').value,
                imageFile: document.getElementById('swal-input2').files[0]
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { name, imageFile } = result.value;
            if (!name) {
                Swal.fire('Error!', 'Name cannot be empty', 'error');
                return;
            }
            if (name !== item.name && !repo.isNameUnique(name)) {
                Swal.fire('Error!', 'An item with this name already exists', 'error');
                return;
            }
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageData = e.target.result;
                    const updatedItem = repo.update(id, { name, imageData });
                    updateItemInDisplay(updatedItem);
                    Swal.fire('Updated!', 'Your item has been updated.', 'success');
                };
                reader.readAsDataURL(imageFile);
            } else {
                const updatedItem = repo.update(id, { name });
                updateItemInDisplay(updatedItem);
                Swal.fire('Updated!', 'Your item has been updated.', 'success');
            }
        }
    });
}

function updateItemInDisplay(item) {
    const itemElement = document.getElementById(`item-${item.id}`);
    if (itemElement) {
        itemElement.innerHTML = `
            <div class="item-content">
                <div class="item-image">
                    ${item.imageData ? `<img src="${item.imageData}" alt="${item.name}">` : '<div class="no-image">No Image</div>'}
                </div>
                <div class="item-details">
                    <strong>${item.name}</strong><br>
                    <small>Created: ${item.createdAt.toLocaleString()}</small>
                    ${item.updatedAt ? `<br><small>Updated: ${item.updatedAt.toLocaleString()}</small>` : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="edit" onclick="editItem(${item.id})">Edit</button>
                <button class="delete" onclick="deleteItem(${item.id})">Delete</button>
            </div>
        `;
    }
}

function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

// Image preview function
function previewImage(event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" style="max-width: 100%; max-height: 200px;">`;
        }
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '';
    }
}

// Add event listener for image preview
document.getElementById('itemImage').addEventListener('change', previewImage);

// Initial display
repo.getAll().forEach(item => addItemToDisplay(item));
  ///////////////////////////////////////
 /// Source script for functions def ///
///////////////////////////////////////

// Updates the data and time by id = datetime
function updateDateTime() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${dd}.${mm}.${yy} ${hh}:${min}:${ss}`;
    document.getElementById('datetime').textContent = formattedDateTime;
}


  ///////////////////////////////////////
 /// Menu functions open/close

function openMenu(loc){
    id = 'menu-'+loc;
    const menu = document.getElementById(id);
    menu.classList.add('open');
}

function closeMenu(loc){
    id = 'menu-'+loc;
    const menu = document.getElementById(id);
    menu.classList.remove('open');
}
function closeAllMenus(){
    closeMenu("top");
    closeMenu("left");
    closeMenu("right");
}


  ///////////////////////////////////////
 /// Menu functions open/close

 function toggleMenu(){
    const menu = document.getElementById('collapsed-menu');
    menu.classList.toggle('hidden'); // Toggle the "hidden" class
 }



  ///////////////////////////////////////
 /// Top menu - layout management

// Open main edit menu (Top menu)
function openEdit(){
    openMenu("top");
    const menu = document.getElementById('edit-buttons');
    menu.classList.add('edit-menu');
    const layouts = document.getElementById('layout-management'); 
    layouts.classList.remove('hidden');
    renderLayoutList();
    
}

function closeButton(){
    const menu = document.getElementById('edit-buttons');
    if (window.appState.state == "viewing"){
        closeMenu("top");
        menu.classList.remove('edit-menu');
        cancelNewLayout();
        setTimeout(() => {
            const layouts = document.getElementById('layout-management'); 
            layouts.classList.add('hidden');
        }, 700); // Same delay as the .menu transition duration
    } else if (window.appState.state == "editing"){
        closeAllMenus();
        menu.classList.remove('edit-active');
        const layout = document.getElementById('layout');
        layout.classList.remove('editing');
        window.appState.state = "viewing";
    }else if(window.appState.state == "adding-widget"){
        closeMenu("top");
        window.appState.state = "editing";
        menu.classList.remove('edit-widget');
        menu.classList.add('edit-active');
        const layouts = document.getElementById('widget-selection'); 
        layouts.classList.add('hidden');
        if(clonedWidget){
            clonedWidget.remove(); // Remove the widget if it was not placed
            clonedWidget = null; // Reset the reference
        }
    }
}

function finishButton(){
    closeButton();
}

// Function to render the list of layouts to #layouts-main
// Pass star_layout here to render it with the label "Starred"
function renderLayoutList(){
    fetch(`/layout_list?current_layout=${encodeURIComponent(String(window.appState.currentLayout))}&star_layout=${encodeURIComponent(String(localStorage.getItem("star_layout")))}`)
    .then(response => response.text())
    .then(html => {
        const container = document.getElementById('layouts-main');
        container.innerHTML = html;

        if (!container.innerHTML.trim()) {
            container.innerHTML = '<span>None to display.</span>';
        }
    })
    .catch(error => {
        console.error('Error fetching layout list:', error);
    });

}



function selectLayout(name){
    window.appState.currentLayout = name;
    renderLayoutList();
    // ADD contents loading logic here
}

function newLayout(name){
    new_name = "New Layout";
    if(name){new_name = name;}
    fetch(`/create_layout?name=${encodeURIComponent(new_name)}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to create layout');
            return response.json();
        })
        .then(data => {
            console.log('Layout created: ', data);
            renderLayoutList(); // Refresh layout list
        })
        .catch(error => {
            console.error('Error: ', error);
        });
}

// Create layout button, naming, and confirm/cancel
function createLayout(){
    const createNewLayoutDiv = document.getElementById("create-new-layout");
    createNewLayoutDiv.classList.add("open");
}
function confirmNewLayout() {
    const layoutName = document.getElementById("name-new-layout").value;
    if (layoutName.trim() === "") {
        alert("Please enter a layout name.");
        return;
    }
    console.log("New layout confirmed:", layoutName);
    const createNewLayoutDiv = document.getElementById("create-new-layout");
    createNewLayoutDiv.classList.remove("open");
    newLayout(layoutName); // Call the function to create a new layout
}
function cancelNewLayout() {
    document.getElementById("name-new-layout").value = ""; // Clear the input box
    console.log("New layout creation canceled.");
    const createNewLayoutDiv = document.getElementById("create-new-layout");
    createNewLayoutDiv.classList.remove("open");
}

function editLayout(name){
    closeAllMenus();
    const menu = document.getElementById('edit-buttons');
    menu.classList.remove('edit-menu');
    menu.classList.add('edit-active');
    window.appState.state = "editing";
    window.appState.currentLayout = name;
    const layout = document.getElementById('layout');
    layout.classList.add('editing');
    const layouts = document.getElementById('layout-management');
    layouts.classList.add('hidden');
}

function deleteLayout(name) {
    // Show a confirmation dialog
    const userConfirmed = confirm(`Are you sure you want to delete the layout "${name}"? This action cannot be undone.`);
    if (!userConfirmed) {
        console.log("Layout deletion canceled.");
        return; // Exit the function if the user cancels
    }

    // Proceed with deletion if the user confirms
    fetch(`/delete_layout?layout_name=${encodeURIComponent(name)}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete layout');
            return response.json();
        })
        .then(data => {
            console.log('Layout deleted: ', data);
            renderLayoutList(); // Refresh the layout list
        })
        .catch(error => {
            console.error('Error: ', error);
        });
}

function starLayout(name){
    localStorage.setItem("star_layout", name); 
    renderLayoutList(); // Refresh the layout list
}


// Widget management
function loadWidgetLibrary(){
    fetch(`/widget_library`)
    .then(response => response.text())
    .then(html => {
        const container = document.getElementById('widget-library');
        container.innerHTML = html;

        if (!container.innerHTML.trim()) {
            container.innerHTML = '';
            console.log('No widgets available.');
        }
    })
    .catch(error => {
        console.error('Error loading widget library:', error);
    });
}

function addWidget() {
    const menu = document.getElementById('edit-buttons'); // Ensure menu is defined
    if (menu) {
        menu.classList.remove('edit-menu');
        menu.classList.add('edit-add-widget');
    } else {
        console.error('Menu element not found.');
    }
}

function openWidgetSelection(){
    window.appState.state = "adding-widget";
    const widgets = document.getElementById("widget-selection");
    widgets.classList.remove("hidden");
    openMenu("top");
    const menu = document.getElementById('edit-buttons');
    menu.classList.add('edit-widget');

}

let isPlacingWidget = false;
let clonedWidget = null;
// When ADD button is clicked, place the widget
function createWidget(event) {
    event.stopPropagation(); 
    closeAllMenus();

    // Get the button that was clicked
    const button = event.target;

    // Find the closest .widget-container (the parent container)
    const widgetContainer = button.closest('.widget-container');

    // Access the .widget element inside the container
    const widget = widgetContainer.querySelector('.widget');
    clonedWidget = widget.cloneNode(true); // Deep clone the widget
    clonedWidget.style.position = "absolute"; // Make it positionable
    clonedWidget.style.pointerEvents = "none"; // Disable interaction while dragging

    // Append the cloned widget to the #layout div immediately
    const layoutDiv = document.getElementById("layout");
    if (layoutDiv) {
        layoutDiv.appendChild(clonedWidget);
    }

    // Start following the mouse
    isPlacingWidget = true;
    document.addEventListener("mousemove", moveWidgetWithMouse);
    document.addEventListener("click", placeWidget);
}

// Function to move the cloned widget with the mouse
function moveWidgetWithMouse(event) {
    if (clonedWidget && isPlacingWidget) {
        const layoutDiv = document.getElementById("layout");
        if (layoutDiv) {
            const rect = layoutDiv.getBoundingClientRect();
            const xPixels = event.pageX - rect.left; // Mouse X position relative to the container
            const yPixels = event.pageY - rect.top;  // Mouse Y position relative to the container

            // Round the position to the nearest 20 pixels
            const roundedX = Math.round(xPixels / 10) * 10;
            const roundedY = Math.round(yPixels / 10) * 10;

            // Set the widget's position in pixels
            clonedWidget.style.left = `${roundedX}px`;
            clonedWidget.style.top = `${roundedY}px`;
        }
    }
}

// Function to add the editing controls div to the widget's #editing-controls
function addEditingControls(widget) {
    const templateControls = document.getElementById("template-controls");
    const editingControls = widget.querySelector('.editing-controls');
    editingControls.innerHTML = templateControls.innerHTML; // Clone the template buttons
}

// Function to place the widget at the current mouse position
function placeWidget(event) {
    if (clonedWidget && isPlacingWidget) {
        // Enable interaction with the widget
        clonedWidget.style.pointerEvents = "auto";
        isPlacingWidget = false;

        // Remove the mousemove and click listeners
        document.removeEventListener("mousemove", moveWidgetWithMouse);
        document.removeEventListener("click", placeWidget);
        
        console.log("Widget placed at:", event.pageX, event.pageY);

        addEditingControls(clonedWidget); // Add editing controls to the placed widget
        
        clonedWidget= null; // Reset the reference
        closeButton();
    }
}

function moveWidget() {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let currentWidget = null;

    // Start dragging when the move button is clicked
    document.addEventListener("mousedown", (event) => {
        const moveButton = event.target.closest(".move-widget");
        if (moveButton) {
            isDragging = true;

            // Get the parent widget of the move button
            currentWidget = moveButton.closest(".widget");

            // Calculate the offset between the mouse and the widget's top-left corner
            const rect = currentWidget.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;

            // Disable pointer events for smoother dragging
            currentWidget.style.pointerEvents = "none";

            // Add mousemove and mouseup listeners dynamically
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
    });

    // Function to handle mouse movement
    function onMouseMove(event) {
        if (isDragging && currentWidget) {
            const layoutDiv = document.getElementById("layout");
            const rect = layoutDiv.getBoundingClientRect();

            // Calculate the new position relative to the layout container
            const xPixels = event.clientX - rect.left - offsetX;
            const yPixels = event.clientY - rect.top - offsetY;

            // Snap to the nearest 10 pixels (optional)
            const roundedX = Math.round(xPixels / 10) * 10;
            const roundedY = Math.round(yPixels / 10) * 10;

            // Update the widget's position
            currentWidget.style.left = `${roundedX}px`;
            currentWidget.style.top = `${roundedY}px`;
        }
    }

    // Function to stop dragging
    function onMouseUp() {
        if (isDragging && currentWidget) {
            isDragging = false;

            // Re-enable pointer events
            currentWidget.style.pointerEvents = "auto";

            // Remove mousemove and mouseup listeners
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            // Clear the current widget reference
            currentWidget = null;
        }
    }
}

function scaleWidget() {
    let isScaling = false;
    let currentWidget = null;
    let startWidth = 0;
    let startHeight = 0;
    let startX = 0;
    let startY = 0;
    // Define minimum size constraints
    const minWidth = 0; // Minimum width in pixels
    const minHeight = 0;

    // Start scaling when the scale button is clicked
    document.addEventListener("mousedown", (event) => {
        const scaleButton = event.target.closest(".scale-widget");
        if (scaleButton) {
            isScaling = true;

            // Get the parent widget of the scale button
            currentWidget = scaleButton.closest(".widget");

            // Store the initial dimensions and mouse position
            const rect = currentWidget.getBoundingClientRect();
            startWidth = rect.width;
            startHeight = rect.height;
            startX = event.clientX;
            startY = event.clientY;

            // Disable pointer events for smoother scaling
            currentWidget.style.pointerEvents = "none";

            // Add mousemove and mouseup listeners dynamically
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
    });

    // Function to handle mouse movement
    function onMouseMove(event) {
        if (isScaling && currentWidget) {
            // Calculate the change in mouse position
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;

            // Calculate the new dimensions
            let newWidth = startWidth + deltaX;
            let newHeight = startHeight + deltaY;
            // Enforce minimum size constraints
            newWidth = Math.max(newWidth, minWidth);
            newHeight = Math.max(newHeight, minHeight)
            // Snap to the nearest 10 pixels
            newWidth = Math.round(newWidth / 10) * 10;
            newHeight = Math.round(newHeight / 10) * 10;

            // Update the widget's dimensions
            currentWidget.style.width = `${newWidth}px`;
            currentWidget.style.height = `${newHeight}px`;
        }
    }

    // Function to stop scaling
    function onMouseUp() {
        if (isScaling && currentWidget) {
            isScaling = false;

            // Re-enable pointer events
            currentWidget.style.pointerEvents = "auto";

            // Remove mousemove and mouseup listeners
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            // Clear the current widget reference
            currentWidget = null;
        }
    }
}


function removeWidget(event) {
    // Find the parent widget of the remove button
    const removeButton = event.target.closest(".remove-widget");
    if (removeButton) {
        const widget = removeButton.closest(".widget");
        if (widget) {
            widget.remove(); // Remove the widget from the DOM
            console.log("Widget removed.");
        }
    }
}

function editWidget(event) {
    // Find the parent widget of the edit button
    const editButton = event.target.closest(".edit-widget");
    if (editButton) {
        const widget = editButton.closest(".widget");
        if (widget) {
            openMenu("right");
        }
    }
}


// Testing:
menus = false;
function openMenus() {
    const leftMenu = document.getElementById('menu-left');
    const rightMenu = document.getElementById('menu-right');
    const topMenu = document.getElementById('menu-top');
    if (menus==false){
        rightMenu.classList.add('open');
        leftMenu.classList.add('open');
        topMenu.classList.add('open');
        menus=true;
        window.appState.editing = true;
    }
    else{
        rightMenu.classList.remove('open');
        leftMenu.classList.remove('open');
        topMenu.classList.remove('open');
        menus=false;
        window.appState.editing = false;
    }
    
    console.log(window.appState);
    console.log("test")

}




function enablePeriodicScrolling(containerSelector) {
    const containers = document.querySelectorAll(containerSelector);

    containers.forEach(container => {
        const textElement = container.querySelector('.scroll-text');

        // Check if the text overflows the container
        if (textElement.scrollWidth > container.clientWidth) {
            const scrollDuration = textElement.scrollWidth / 50; // Adjust speed (50px per second)

            // Dynamically set the animation duration
            textElement.style.animationDuration = `${scrollDuration * 2}s`; // Double the duration for smooth return
            textElement.style.animationPlayState = 'running'; // Ensure animation runs
        } else {
            // Disable animation if text fits
            textElement.style.animation = 'none';
        }
    });
}
// Call the function on page load
//document.addEventListener('DOMContentLoaded', () => {
//    enablePeriodicScrolling('.scroll-container');
//});


// Function to open settings (to be implemented later)
function openSettings() {
    console.log("Settings button clicked. Implement settings functionality here.");
}


















// Old functions to rework:

function loadPage(page, subsystem) {
    state.page = page;
    state.subsystem = subsystem;
    //if (state.isLoading) return; // Prevent overlap
    state.isLoading = true;
    size=3;

    //console.log("Calling  loadPage in Index...");
    fetch(`/table_partial?page=${page}&subsystem=${encodeURIComponent(subsystem)}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('table-container').innerHTML = html;
        })
        .finally(() => {
            console.log("loadPage .finally");
            //state.isLoading = false;
        });
    fetch(`/table_ids?page=${page}&subsystem=${encodeURIComponent(subsystem)}&size=${size}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('special-data').innerHTML = html;
        })
        .finally(() => {
            console.log("loadPage .finally");
            state.isLoading = false;
        }); 
    
}



function alarm_test() {          
    fetch(`/alarm-test`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('alarm-test').innerHTML = html;
        })
}



async function fetchList() {
    const res = await fetch('/get');
    const data = await res.json();
    renderList(data.parameter_ids);
}

function renderList(ids) {
    const list = document.getElementById('paramList');
    list.innerHTML = '';
    ids.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id + ' ';

        const button = document.createElement('button');
        button.textContent = 'Remove';
        button.onclick = () => removeParam(id);

        li.appendChild(button);
        list.appendChild(li);
    });
}

async function addParam(id) {
    const val = id; /*parseInt(document.getElementById('paramInput').value);*/
    if (!isNaN(val)) {
        await fetch('/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({parameter_id: val})
        });
        fetchList();
    }
}

async function removeParam(id) {
    await fetch('/remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({parameter_id: id})
    });
    fetchList();
}

async function toggleParam(id) {
    const val = id;
    if (!isNaN(val)) {
        const res = await fetch('/get');
        const data = await res.json();
        const alreadyExists = data.parameter_ids.includes(val);

        const url = alreadyExists ? '/remove' : '/add';

        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({parameter_id: val})
        });

        fetchList();
    }
}


function pin_param(id){
    addParam(id);
}

function toggleAlarms(){
    alarm_box = document.getElementById("alarm-box")
    if(alarm_box.classList.contains('gone')){
        alarm_box.classList.remove('gone');
    }else{
        alarm_box.classList.add('gone');
    }
}



function change_subsystem(clicked_elem, chosen_subsystem) {
    categories.forEach(category => {
        category.classList.remove('selected');
    });
    clicked_elem.classList.add('selected');
    cur_subsystem = chosen_subsystem
    loadPage(0, chosen_subsystem)
}





// Test adding data components
function duplicateElement(elementId, times) {
    const element = document.getElementById(elementId);
    if (element) {
        for (let i = 0; i < times; i++) {
            const clone = element.cloneNode(true);
            document.getElementById("data").appendChild(clone);
        }
    }
}


/*
 *  This function is called whenever the page is loaded in order 
 *  to check if there are data to restore.
 */
window.onload = function() { 

	// 1. Load the locally stored data
	var reloaded = sessionStorage.getItem("reloaded");
	var current_obj_cells = sessionStorage.getItem("current_obj_cells");
	var current_cells = sessionStorage.getItem("current_cells");

	//NEW:
	var current_hw_types_per_cell = sessionStorage.getItem("current_hw_types_per_cell");

	//APPLICATION JSON Editor
	var current_obj = sessionStorage.getItem("current_obj");
	
	//BROKERS JSON Editor
	var current_obj_brokers = sessionStorage.getItem("current_obj_brokers");
	var current_brokers = sessionStorage.getItem("current_brokers");

	// 2. Check if the page is loaded after a refresh
	if (reloaded == "true") {
		// 3. Read the previously stored contents
		obj_cells = JSON.parse(current_obj_cells);
		cells = JSON.parse(current_cells);
		hw_types_per_cell = JSON.parse(current_hw_types_per_cell);

		// 4. Refresh the view
		if (cells.length != 0) {
			selected_cell = 1;                      
		}
		updateCellsTable();
		updateDropDownList();

		//APPLICATION JSON EDITOR
		// 3. Read the previously stored contents
		obj = JSON.parse(current_obj);

		// 4. Refresh the view
		updateApplicationTable();
		addTableRowHandler();
		
		//BROKERS JSON EDITOR
		obj_brokers = JSON.parse(current_obj_brokers);
		brokers = JSON.parse(current_brokers);
		if (brokers.length != 0) {
			selected_broker = 1;
		}
		updateBrokersTable();
		updateBrokerDropDownList();
		
		//If no Cells are defined this function call fails
		updateHwTypesTable();
	}
}

/* 
 * This function is called before reloading the page in order
 * to store the previous work made by the user.
 */ 
window.onbeforeunload = function() {

	// 1. Define that a page refresh has been performed
	sessionStorage.setItem("reloaded", "true");

	// 2. Store the current work locally in the current session
	var current_obj_cells = JSON.stringify(obj_cells);
	var current_cells = JSON.stringify(cells);
	sessionStorage.setItem("current_obj_cells", current_obj_cells);
	sessionStorage.setItem("current_cells", current_cells);

	//NEW:
	var current_hw_types_per_cell = JSON.stringify(hw_types_per_cell);
	sessionStorage.setItem("current_hw_types_per_cell", current_hw_types_per_cell);

	//APPLICATION JSON EDITOR
	var current_obj = JSON.stringify(obj);
	sessionStorage.setItem("current_obj", current_obj);
	
	//BROKERS JSON EDITOR
	var current_obj_brokers = JSON.stringify(obj_brokers);
	var current_brokers = JSON.stringify(brokers);
	sessionStorage.setItem("current_brokers", current_brokers);
	sessionStorage.setItem("current_obj_brokers", current_obj_brokers);
}

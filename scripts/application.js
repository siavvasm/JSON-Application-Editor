// Initialize the global variables
var obj = { "Number of Applications": 0, "Minimum and Maximum Jobs Per Second": [], "Applications": [] };
var selected = 0;// The selected application entry
var save = false;
var imported = false;

// Validaion 
var apps_schema = '{ "title":"Application set", "Number of Applications":{ "type":"number" }, "Minimum and Maximum Jobs Per Second":{ "type":"array" }, "Applications":{ "type":"array", "items": { "title":"Application", "type":"object", "properties": { "ApplicationID": { "type": "number" }, "Number of Available Implementations": { "type": "number" }, "Available Implementations": { "type": "array" }, "Minimum - Maximum Instructions Per App": { "type": "array" }, "Minimum - Maximum VMs Per App":{ "type":"array" }, "Minimum - Maximum vCPUs Per VM":{ "type":"array" }, "Minimum - Maximum Memory Per VM": { "type": "array" }, "Minimum - Maximum Storage Per VM": { "type": "array" }, "Minimum - Maximum Network Per VM": { "type": "array" }, "Type of Actual Utilization (vCPU,Memory,Network)": { "type": "array" }, "Minimum - Maximum Actual vCPU Utilization": { "type": "array" }, "Minimum - Maximum Actual Memory Utilization": { "type": "array" }, "Minimum - Maximum Actual Network Utilization": { "type": "array" }, "Accelerator support": { "type": "array" }, "Rho for accelerator execution per Implementation": { "type": "array" } } } } }';
var apps_message = "";

/**
* This function is called when the Parse button is clicked, and
* is responsible for parsing a given JSON string that contains the
* desired applications.
*/
function parseJSON() {

   // 0. Initialization
   selected = 0;
   hidePropertiesViewAndEdit();

   // 1. Get the JSON string
   var jsonInput = document.getElementById("import-field").value;
   imported = true; // State that importation is attempted by the user

   if (jsonInput.includes('{') && jsonInput.includes('}')) {
		if (validateApplicationJsonSchema(jsonInput)) {
			alert("valid");
		   // 2. Parse the content of the JSON string
		   obj = JSON.parse(jsonInput);

		   // 3. Update the tables 
		   updateApplicationTable();
		   addTableRowHandler();
		} else {    
		   // 1. Define the default error message
		   var error_message = "The JSON string is not valid.\nPlease provide a valid JSON file as an input.";

		   // 2. If the error occured due to invalid fields, provide an indicator to the user
		   if (apps_message != "") {
			   error_message += "\n\nCheck the error logs below in order to identify which entries violate the JSON schema:\n\n" + apps_message;
		   } 

		   // 3. Display the final error message
		   alert(error_message);
		}
   } else {
	   alert("Please provide a valid json string before clicking the Parse button!");
   }
}

/**
* This function is called when the Import button is clicked, and
* in responsile for importing a file that contains the deired JSON 
* string.
*/
function importJSONFile() {

   // 0. Initialization
   selected = 0;
   hidePropertiesViewAndEdit();

   // Import the file content as text
   loadFileContent();

   // Update the tables
   imported = true; // State that importation is attempted by the user
   updateApplicationTable();
   addTableRowHandler();


}

/**
 * This function is responsible for updating the GUI appropriatelly
 */
function hidePropertiesViewAndEdit() {
   document.getElementById("prop-table-full").setAttribute("style", "display: none;");
   document.getElementById("prop-edit").setAttribute("style", "display: none;");
   document.getElementById("button-group-2").style.display = "none";
   document.getElementById("save-button").style.display = "none";
   document.getElementById("add-button").style.display = "none";
   document.getElementById("cancel-button").style.display = "";
   document.getElementById("app-num").innerHTML = "";
}


/**
* This function is responsible for parsing the content of the 
* file that contains the desired JSON.
*/
function loadFileContent() {

   // 1. Get the name of the desired file and update the value of the Import field.
   var fileToLoad = document.getElementById("fileToLoad").files[0];
  

   // Create a new FileReader object.
   var fileReader = new FileReader();

   /**
	* Define what the FileReader object should do, when the desired file is loaded.
	*/
   fileReader.onload = function (fileLoadedEvent) {
   
		   // 1. Load the String and print it to the console
		   var textFromFileLoaded = fileLoadedEvent.target.result;
		   console.log(textFromFileLoaded);
	   
		   if (validateApplicationJsonSchema(textFromFileLoaded)) {
			   alert("valid");
				document.getElementById("import-field").value = fileToLoad["name"];
			   // 2. Parse the JSON string into a JavaScript object
			   obj = JSON.parse(textFromFileLoaded);
			   console.log(obj);

			   // 3. Update everything 
			   updateApplicationTable();
			   addTableRowHandler();
		   } else {
			   
			   // 1. Define the default error message
			   var error_message = "The JSON string is not valid.\nPlease provide a valid JSON file as an input.";
			   
			   // 2. If the error occured due to invalid fields, provide an indicator to the user
			   if (apps_message != "") {
				   error_message += "\n\nCheck the error logs below in order to identify which entries violate the JSON schema:\n\n" + apps_message;
			   } 
			   
			   // 3. Display the final error message
			   alert(error_message);
		   }
	   // 4. Clear the list with the files (to allow re-importation of the same file)
	   document.getElementById('fileToLoad').value = "";

   };

   // Read the content of the file
   fileReader.readAsText(fileToLoad, "UTF-8");
}

/**
* This function is called when the Export button pressed, in order
* to export the final list of applications as a JSON String.
*/
function exportJSON() {

   if (getJobsPerSecAndValidate()) {

	   // 0. Define the overall values
	   obj["Number of Applications"] = obj["Applications"].length;

	   // 1. Convert the data into a JSON String
	   var json = neatJSON(obj, { 'sort': false, 'wrap': 40, 'aligned': true, 'around_colon': 1 });

	   // 2. Write the string to the desired textfield
	   document.getElementById("export-field").value = JSON.stringify(obj);
	   document.getElementById("export-area").value = json;
   }
}

/**
* This function updates the Applications table based on the objects stored
* inside the Applications array of the desired JSON. In particular, it 
* creates one row for each Application object found in this JavaScript 
* array.
*/
function updateApplicationTable() {

   // 1. Clean the contents of the table
   var table = document.getElementById("app-table")
   table.innerHTML = "";

   // 2. Get the array that contains the application objects
   var appArray = obj["Applications"];

   // 3. Create one row for each application object
   for (var i = 0, len = appArray.length; i < len; i++) {

	   var application = appArray[i];

	   var tr = document.createElement("tr");

	   var t1 = document.createElement("td");
	   var c1 = document.createTextNode(i + 1)
	   t1.appendChild(c1);

	   var t2 = document.createElement("td");
	   var c2 = document.createTextNode("App" + (i + 1))
	   t2.appendChild(c2);

	   tr.appendChild(t1);
	   tr.appendChild(t2);

	   table.appendChild(tr);
   }
   
}


/**
* This function adds an "onclick" handler to the rows of the Application Table.
* Whenever an Application entry is clicked the "selected" variable is updated in
* order to point to the selected application entry, and the Properties table is
* updated in order to display its details.
*/
function addTableRowHandler() {

   // 1. Get the rows of the first html table
   var table = document.getElementById("app-table");
   var rows = table.getElementsByTagName("tr");

   // 2. Add the desired listener to the rows of the table
   for (var i = 0, len = rows.length; i < len; i++) {

	   rows[i].onclick = function () {

		   // 1. Reset the color of the table rows
		   for (var i = 0, len = rows.length; i < len; i++) {
			   rows[i].className = "";
		   }

		   // 2. Highlight the selected row
		   var sel = this.className;

		   if (sel == "") {
			   this.className = "highlight";
		   } else {
			   this.className = "";
		   }

		   // 3. Update the Properties Table or the Edit Form with the details of the selected App
		   x = this.getElementsByTagName("td");
		   selected = parseInt(x[0].textContent);
		   if (imported || document.getElementById("prop-table-full").style.display != "none") {

			   // Check if it is the first time after the importation
			   if (imported) {
				   // Make the properties table visible and reset the imported flag.
				   document.getElementById("prop-table-full").style.display = "";
				   imported = false;
			   }

			   // Update the contents of the Properties Table.
			   updatePropertiesTable();

		   } else {
			   // The row was clicked during edit phase
			   editButtonPressed();
		   }
	   }
   }

}

/**
* This function is responsible for updating the content of the Properties html table
* with the details of the Application object that the "selected" global variable
* points to.         
*/
function updatePropertiesTable() {

   // 0. Hide the buttons
   document.getElementById("button-group-2").style.display = "none";

   // 1. Clean the contents of the table
   var table = document.getElementById("prop-table");
   table.innerHTML = "";

   // 2. Get the selected application
   var applications = obj["Applications"];
   selObj = applications[selected - 1];

   // 3. Add one row for each key value found in the application object
   var i = 1;
   for (key in selObj) {

	   var tr = document.createElement("tr");

	   var t1 = document.createElement("td");
	   var c1 = document.createTextNode(i)
	   t1.appendChild(c1);

	   var t2 = document.createElement("td");
	   var c2 = document.createTextNode(key)
	   t2.appendChild(c2);

	   var t3 = document.createElement("td");
	   var c3 = document.createTextNode(selObj[key])
	   t3.appendChild(c3);

	   tr.appendChild(t1);
	   tr.appendChild(t2);
	   tr.appendChild(t3);

	   table.appendChild(tr);

	   i++;
   }
   
   // 4. Change the title of the table
   document.getElementById("app-num").innerHTML = selected;
   
   if(selected == 0) document.getElementById("app-num").innerHTML = "";
}

/**
* This function is responsible for displaying an empty New/Edit Application
* form.
*/
function newButtonPressed() {

   // 0. Show the Add button
   document.getElementById("button-group-2").style.display = "";
   document.getElementById("save-button").style.display = "none";
   document.getElementById("add-button").style.display = "";

   // 1. Hide the table and display the form
   document.getElementById("prop-table-full").setAttribute("style", "display: none;");
   document.getElementById("prop-edit").setAttribute("style", "");

   // 2. Clear all the text fields
   clearTextFields();
   clearCheckboxes();
   resetFields();
}

/**
* This function is responsible for clearing the fields 
* of the New/Edit Application form.
*/
function clearTextFields() {

   // Retrieve all the input fields of the Application Form
   var appForm = document.getElementById("prop-edit");
   var fields = appForm.getElementsByTagName("input");

   // Clear all the fields
   for (i = 0, length = fields.length; i < length; i++) {
	   fields[i].value = "";
   }

}

/**
* This fucntion is called when the Cancel button is pressed
* in order to present the table with the details of the 
* Application entries.
*/
function cancelButtonPressed() {

   // 0. Hide the buttons
   document.getElementById("button-group-2").style.display = "none";

   // 0. Clear the checkboxes
   clearCheckboxes();

   // 1. Hide the New Application form and display the table with the selected application contents
   document.getElementById("prop-edit").setAttribute("style", "display: none;");
   document.getElementById("prop-table-full").setAttribute("style", "");

}

/** 
* This function is called when the Add button is pressed and 
* it is responsible for adding the new Application entry
* to the array with the other applications. The new application
* entry is verified before added to the list.
*/
function addButtonPressed() {

   // 1. Create an empty application
   var newApp = {};

   // 2. Retrieve the key values from the text fields
   newApp = createApplicationFromFields();

   // 3. Check if its values are valid and add it to the list
   if (validNewApplication(newApp)) {

	   // Add it to the list
	   obj["Applications"][obj["Applications"].length] = newApp;

	   // 1. Mark the new Application as the selected one
	   selected = obj["Applications"].length;

	   // 2. Update the Tables
	   updateApplicationTable();
	   updatePropertiesTable();
	   addTableRowHandler();

	   // 3. Highlight the newly entered app
	   var table = document.getElementById("app-table");
	   var rows = table.getElementsByTagName("tr");
	   rows[rows.length - 1].className = "highlight";

	   // 4. Display the table with the details of the newly added application
	   cancelButtonPressed();
   }

}

/**
* This function is responsible for verifying whether the 
* details of the given applications are valid.
*/
function validNewApplication(newApp) {

   // 1. Assume that the details are correct
   valid = true;
   errorMessage = "";

   // 2. Check the details
   i = 1;

   if (newApp["Available Implementations"].length != 0) {

	   if (newApp["Accelerator support"].length != newApp["Available Implementations"].length) {
		   valid = false;
		   errorMessage += i + ". Provide " + newApp["Available Implementations"].length + " elements at the Accelerator Support text field. \n";
		   i++;
	   }

	   if (newApp["Rho for accelerator execution per Implementation"].length != newApp["Available Implementations"].length) {
		   valid = false;
		   errorMessage += i + ". Provide " + newApp["Available Implementations"].length + " elements at the Rho for accelerator execution per Implementation text field. \n";
		   i++;
	   }

   } else {
	   valid = false;
	   errorMessage += i + ". Please select at least one from the available implementations. \n";
	   i++;
   }

   if (newApp["Type of Actual Utilization (vCPU,Memory,Network)"].length != 3) {
	   valid = false;
	   errorMessage += i + ". Provide 3 elements at the Type of Actual Utilization (vCPU,Memory,Network) text field. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Instructions Per App"][0] > newApp["Minimum - Maximum Instructions Per App"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum instructions per app that you defined are larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum VMs Per App"][0] > newApp["Minimum - Maximum VMs Per App"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum VMs per app that you defined are larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum vCPUs Per VM"][0] > newApp["Minimum - Maximum vCPUs Per VM"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum vCPUs per VM that you defined are larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Memory Per VM"][0] > newApp["Minimum - Maximum Memory Per VM"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum memory per VM that you defined is larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Storage Per VM"][0] > newApp["Minimum - Maximum Storage Per VM"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum storage per VM that you defined is larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Network Per VM"][0] > newApp["Minimum - Maximum Network Per VM"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum network per VM that you defined is larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Actual vCPU Utilization"][0] > newApp["Minimum - Maximum Actual vCPU Utilization"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum actual vCPU utilization that you defined is larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Actual Memory Utilization"][0] > newApp["Minimum - Maximum Actual Memory Utilization"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum actual memory utilization that you defined is larger than the maximum. \n";
	   i++;
   }

   if (newApp["Minimum - Maximum Actual Network Utilization"][0] > newApp["Minimum - Maximum Actual Network Utilization"][1]) {
	   valid = false;
	   errorMessage += i + ". The minimum actual network utilization that you defined is larger than the maximum. \n";
	   i++;
   }

   for (var k = 0; k < newApp["Accelerator support"].length; k++) {
	   temp = newApp["Accelerator support"][k];
	   //alert("temp: " + temp);
	   if ((temp != 0) && (temp != 1)) {
		   valid = false;
		   errorMessage += i + ". The Accelerator Support fields accept only integer values between 0 and 1. \n";
		   i++;
		   break;
	   }
   }

   for (var k = 0; k < newApp["Rho for accelerator execution per Implementation"].length; k++) {
	   temp = newApp["Rho for accelerator execution per Implementation"][k];
	   if ((temp < 0) || (temp > 1)) {
		   valid = false;
		   errorMessage += i + ". The 'Rho for accelerator execution per Implementation' fields accept only values that lie in the interval [0,1]. \n";
		   i++;
		   break;
	   }
   }

   // Check for NaNs
   var editSection = document.getElementById("prop-edit");
   var fields = editSection.getElementsByClassName("form-control");

   for (var k = 0; k < fields.length; k++) {
	   if ((!fields[k].readOnly) && (fields[k].value == "")) {
		   valid = false;
		   errorMessage += i + ". Please complete all the fields of the form. \n";
		   i++;
		   break;
	   }
   }
   
   for (var k = 0; k < fields.length; k++) {
	   if (isNaN(fields[k].value)) {
		   valid = false;
		   errorMessage += i + ". Ensure that you have provided only numeric values to the fields of the given form. \n";
		   i++;
		   break;
	   }
   }

   // 3. Check if there was at least one error
   if (!valid) {
	   alert(errorMessage);
   }

   // 4. Return the outcome of the validation
   return valid;

}

/**
* This function is responsible for retrieving the IDs of the 
* implementations that were selected by the user through the
* available checkboxes.
*/
function retrieveAvailImpl() {

   // 1. Initialize the necessary variables 
   var availImpl = [];
   var k = 0;
   var list = document.getElementById("av-im").getElementsByTagName("input");

   // 2. Get the selected implementations and add them to a list
   for (var i = 0, length = list.length; i < length; i++) {
	   if (list[i].checked) {
		   availImpl[k] = i + 1;
		   k++;
	   }
   }

   // 3. Return the list with the selected implementations
   return (availImpl);
}

/*
* This function is responsible for unchecking the checkboxes
* of the New/Edit form that correspond to the Available Implementations  
* of the Cloudlightning simulator. 
*/
function clearCheckboxes() {
   // 1. Retrieve the checkboxes 
   var list = document.getElementById("av-im").getElementsByTagName("input");
   
   // 2. Uncheck the checkboxes
   for (var i = 0, length = list.length; i < length; i++) {
	   list[i].checked = false;
   }
}

/*
* This function creates a new Application object from the values
* provided to the form's fields by the user.
*/
function createApplicationFromFields() {

   // 1. Create an empty application
   var newApp = {};

   /*
   * 2. Add the values from the fields
   */

   // Set the ID of the newly added application
   newApp["ApplicationID"] = obj["Applications"].length + 1;

   // Define the selected implementations and their number
   var availImpl = retrieveAvailImpl();
   newApp["Number of Available Implementations"] = availImpl.length;
   newApp["Available Implementations"] = availImpl;

   // Set the min and max values of the appropriate fields
   newApp["Minimum - Maximum Instructions Per App"] = [parseFloat(document.getElementById("ipa-min").value), parseFloat(document.getElementById("ipa-max").value)];
   newApp["Minimum - Maximum VMs Per App"] = [parseInt(document.getElementById("vpa-min").value), parseInt(document.getElementById("vpa-max").value)];
   newApp["Minimum - Maximum vCPUs Per VM"] = [parseInt(document.getElementById("cpu-min").value), parseInt(document.getElementById("cpu-max").value)];
   newApp["Minimum - Maximum Memory Per VM"] = [parseInt(document.getElementById("mpv-min").value), parseInt(document.getElementById("mpv-max").value)];
   newApp["Minimum - Maximum Storage Per VM"] = [parseFloat(document.getElementById("spv-min").value), parseFloat(document.getElementById("spv-max").value)];
   newApp["Minimum - Maximum Network Per VM"] = [parseFloat(document.getElementById("npv-min").value), parseFloat(document.getElementById("npv-max").value)];
   newApp["Minimum - Maximum Actual vCPU Utilization"] = [parseFloat(document.getElementById("acu-min").value), parseFloat(document.getElementById("acu-max").value)];
   newApp["Minimum - Maximum Actual Memory Utilization"] = [parseFloat(document.getElementById("amu-min").value), parseFloat(document.getElementById("amu-max").value)];
   newApp["Minimum - Maximum Actual Network Utilization"] = [parseFloat(document.getElementById("anu-min").value), parseFloat(document.getElementById("anu-max").value)];

   // Type of Actual Utilization (vCPU, Memory, Network)
   var typeActUtil = [];
   typeActUtil[0] = parseFloat(document.getElementById("vcpu-util").value);
   typeActUtil[1] = parseFloat(document.getElementById("mem-util").value);
   typeActUtil[2] = parseFloat(document.getElementById("net-util").value);
   newApp["Type of Actual Utilization (vCPU,Memory,Network)"] = typeActUtil;

   // Accelerator Support
   var accSupport = [];
   for (var i = 0; i < availImpl.length; i++) {
	   accSupport[i] = parseFloat(document.getElementById("acc-sup-imp" + availImpl[i]).value);
	   //alert(accSupport[i]);
   }
   newApp["Accelerator support"] = accSupport;

   // Rho for accelerator execution per Implementation
   var rho = [];
   for (var i = 0; i < availImpl.length; i++) {
	   rho[i] = parseFloat(document.getElementById("rho-imp" + availImpl[i]).value);
   }
   newApp["Rho for accelerator execution per Implementation"] = rho;

   // 3. Return the Application object
   return newApp;
}

/**
* This function is responsible for deleting a selected application
* entry from the list with the applications.
*/
function deleteButtonPressed() {

   // Ensure that a specific entry is selected
   if (selected != 0) {

	   // Ask confirmation from the user to avoid accidental deletion
	   var answer = confirm("This entry will be permanently deleted! Proceed with the action?");

	   if (answer) {

		   // 1. Remove the application object from the array
		   obj["Applications"].splice(selected - 1, 1);

		   // 2. Update the IDs of the remaining applications
		   for (var i = 0, len = obj["Applications"].length; i < len; i++) {
			   obj["Applications"][i]["ApplicationID"] = i + 1;
		   }

		   // 3. Diselect the applications
		   selected = 0;

		   // 4. Update the tables
		   updateApplicationTable();
		   updatePropertiesTable();
		   addTableRowHandler();
		   cancelButtonPressed();
	   }

   } else {
	   alert("Please select an application entry to delete!");
   }
}

/** 
* This function is responsible for displaying the New/Edit Application form
* with its fields containing the details of the selected application entry.
*/
function editButtonPressed() {

   // Ensure that an application entry is previously selected
   if (selected != 0) {

	   // 0. Display the Save button
	   document.getElementById("button-group-2").style.display = "";
	   document.getElementById("save-button").style.display = "";
	   document.getElementById("add-button").style.display = "none";

	   // 0. Clear the checkboxes and reset the Accelerator Support and Rho fields
	   clearCheckboxes();
	   resetFields();

	   // 1. Hide the Properties Table and present the form
	   document.getElementById("prop-table-full").setAttribute("style", "display: none;");
	   document.getElementById("prop-edit").setAttribute("style", "");

	   // 2. Get the selected application
	   var selObj = obj["Applications"][selected - 1];

	   // 3. Complete the text fields of the form with the details of the selected application
	   document.getElementById("ipa-min").value = selObj["Minimum - Maximum Instructions Per App"][0];
	   document.getElementById("ipa-max").value = selObj["Minimum - Maximum Instructions Per App"][1];
	   document.getElementById("vpa-min").value = selObj["Minimum - Maximum VMs Per App"][0];
	   document.getElementById("vpa-max").value = selObj["Minimum - Maximum VMs Per App"][1];

	   // Check the appropriate checkboxes based on the selected implementations
	   for (var i = 0, length = selObj["Available Implementations"].length; i < length; i++) {
		   document.getElementById("" + selObj["Available Implementations"][i]).checked = true;
	   }

	   // Enable the appropriate Acc Sup and RhO fields based on the selected implementations
	   refreshFields();

	   // Complete the values of the min-max text fields with the appropriate values
	   document.getElementById("cpu-min").value = selObj["Minimum - Maximum vCPUs Per VM"][0];
	   document.getElementById("cpu-max").value = selObj["Minimum - Maximum vCPUs Per VM"][1];
	   document.getElementById("mpv-min").value = selObj["Minimum - Maximum Memory Per VM"][0];
	   document.getElementById("mpv-max").value = selObj["Minimum - Maximum Memory Per VM"][1];
	   document.getElementById("spv-min").value = selObj["Minimum - Maximum Storage Per VM"][0];
	   document.getElementById("spv-max").value = selObj["Minimum - Maximum Storage Per VM"][1];
	   document.getElementById("npv-min").value = selObj["Minimum - Maximum Network Per VM"][0];
	   document.getElementById("npv-max").value = selObj["Minimum - Maximum Network Per VM"][1];
	   document.getElementById("acu-min").value = selObj["Minimum - Maximum Actual vCPU Utilization"][0];
	   document.getElementById("acu-max").value = selObj["Minimum - Maximum Actual vCPU Utilization"][1];
	   document.getElementById("amu-min").value = selObj["Minimum - Maximum Actual Memory Utilization"][0];
	   document.getElementById("amu-max").value = selObj["Minimum - Maximum Actual Memory Utilization"][1];
	   document.getElementById("anu-min").value = selObj["Minimum - Maximum Actual Network Utilization"][0];
	   document.getElementById("anu-max").value = selObj["Minimum - Maximum Actual Network Utilization"][1];

	   // Update the values of Accelerator Support and Rho fields
	   for (var i = 0; i < selObj["Available Implementations"].length; i++) {
		   document.getElementById("acc-sup-imp" + selObj["Available Implementations"][i]).value = selObj["Accelerator support"][i];
		   document.getElementById("rho-imp" + selObj["Available Implementations"][i]).value = selObj["Rho for accelerator execution per Implementation"][i];
	   }

	   // Update the values of the 'Type of Actual Utilization (vCPU,Memory,Network)' fields
	   document.getElementById("vcpu-util").value = selObj["Type of Actual Utilization (vCPU,Memory,Network)"][0];
	   document.getElementById("mem-util").value = selObj["Type of Actual Utilization (vCPU,Memory,Network)"][1];
	   document.getElementById("net-util").value = selObj["Type of Actual Utilization (vCPU,Memory,Network)"][2];

   } else {
	   alert("Please select an application first!");
   }
}

/**
* This function is responsible for saving the changes made to the selected 
* application entry.
*/
function saveButtonPressed() {
   
   // 0. Declare that the Save button is pressed
   save = true;

   // 1. Create a new Application object
   var newApp = {}

   // 2. Retrieve the values of the Application from the fields and set its ID
   newApp = createApplicationFromFields();
   newApp["ApplicationID"] = obj["Applications"][selected - 1]["ApplicationID"];

   // 3. Check if it is valid and update the selected application
   if (validNewApplication(newApp)) {

	   // Update the selected object
	   obj["Applications"][selected - 1] = newApp;

	   // Update the Tables
	   updateApplicationTable();
	   updatePropertiesTable();
	   addTableRowHandler();

	   // TODO: Remove this print
	   console.log(newApp)

	   // Highlight the selected app
	   var table = document.getElementById("app-table");
	   var rows = table.getElementsByTagName("tr");
	   rows[selected - 1].className = "highlight";

	   // Display the table
	   cancelButtonPressed();

	   // Clear the checkboxes
	   clearCheckboxes();
   }
}

/*
* This function is responsible for verifying the min and max Jobs per Second
* of the overall simulation that are given by the user.
*/
function getJobsPerSecAndValidate() {

   // 1. Get the values from the fields
   var min = document.getElementById("jobs-min").value;
   var max = document.getElementById("jobs-max").value;

   // 2. Check and set or inform          
   if (min == "" || max == "") {
	   alert("Please define the desired minimum and maximum jobs per second before exporting the JSON.");
	   return false;
   }

   if (parseInt(min) <= parseInt(max)) {
	   obj["Minimum and Maximum Jobs Per Second"][0] = parseInt(min);
	   obj["Minimum and Maximum Jobs Per Second"][1] = parseInt(max);
	   return true;
   } else {
	   alert("The minimum jobs per second are more than the maximum.");
	   return false;
   }
}

/**
* These functions are responsible for exporting the final applications list
* in a JSON format.
*/
function exportJSONtoFile2() {
   if (getJobsPerSecAndValidate()) {
	   document.getElementById("download-anchor").click();
   }
}

function exportJSONFile() {
   if (getJobsPerSecAndValidate()) {
	   obj["Number of Applications"] = obj["Applications"].length;
	   var json = neatJSON(obj, { 'sort': false, 'wrap': 40, 'aligned': true, 'around_colon': 1 });

	   document.getElementById("download-anchor").setAttribute("href", "data:application/octet-stream;," + encodeURIComponent(json));
   }
}

/**
* This function is responsible for enabling the corresponding fields 
* of the 'Accelerator Support' and 'Rho' properties based on the 
* checkboxes selected by the user.
*/
function refreshFields() {

   // 0. Disable all the fields
   disableFields();

   // 1. Retrieve the selected implementations
   availImpl = retrieveAvailImpl();

   // 2. Refresh the text fields
   for (var i = 0; i < availImpl.length; i++) {
	   switch (availImpl[i]) {
		   case 1:
			   document.getElementById("acc-sup-imp1").value = 0;
			   document.getElementById("rho-imp1").value = 0;
			   break;
		   default:
			   // Automatically set the values of the accelerator support fields to 1
			   document.getElementById("acc-sup-imp" + availImpl[i]).value = 1;
			   document.getElementById("rho-imp" + availImpl[i]).readOnly = false;
			   break;
	   }
   }
}

/**
* This function is responsible for disabling all the fields of the
* 'Accelerator Support' and 'Rho' properties.
*/
function disableFields() {

   // Clear the fields that correspond to the first implementation
   for (var i = 1; i < 5; i++) {
	   document.getElementById("acc-sup-imp" + i).value = "";
   }

   document.getElementById("rho-imp1").value = "";

   // Disable all the fields 
   for (var i = 1; i < 5; i++) {
	   document.getElementById("acc-sup-imp" + i).readOnly = true;
	   document.getElementById("rho-imp" + i).readOnly = true;
   }
}

/**
* This function is responsible for reseting the values of the fields
* that correspond to the 'Accelerator Support' and 'Rho' properties.
*/
function resetFields() {
   for (var i = 1; i < 5; i++) {
	   document.getElementById("acc-sup-imp" + i).readOnly = true;
	   document.getElementById("rho-imp" + i).readOnly = true;
	   document.getElementById("acc-sup-imp" + i).value = "";
	   document.getElementById("rho-imp" + i).value = "";
   }
}

/**
* This function is responsible for validating the conformance of the
* given JSON string to the predifined schema.
*/
function validateApplicationJsonSchema(json) {

	 // 1. Turn the schema into a JavaScript object
	 json = JSON.parse(json);
	 schema = JSON.parse(apps_schema);

	 // 2. Keep only the application schema
	 app_schema = schema["Applications"]["items"];

	 // 3. Create the validator
	 env = new djv();

	 // 5. Add the schema to the validator
	 env.addSchema('app', app_schema);

	 // 6. Validate each application entry against the schema
	 apps_message = "";
	 var valid = true;
	 
	 // Check the case that a completely different JSON file has been provided as an input
	 if(json["Applications"] == undefined) {
		 valid = false;
		 return valid;
	 } 
	 for (var i = 0; i < json["Applications"].length; i++) {

		// Validate the application against the schema
		var temp = env.validate('app', json["Applications"][i]);

		// Check if there is any violation
		if (temp != undefined) {
			valid = false;
			apps_message += "Application_" + (i+1) + ": " + temp + "\n";
		} 
	 }
   
	return valid;
}
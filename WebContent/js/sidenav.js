
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('contentnavcontainer')) {
	    	closeNav();
	    }
	}
})
function openNav() {
	document.getElementById("contentnavcontainer").style.width = '100%';
    document.getElementById("contentnav").style.width = '450px';
    displayVehicles();
}

function closeNav() {
	document.getElementById("contentnavcontainer").style.width = '0';
    document.getElementById("contentnav").style.width = '0';
}

/*function openTab(evt, tabName) {
	 var i, x, tablinks;
		  x = document.getElementsByClassName("tab-selected-data");
		  for (i = 0; i < x.length; i++) {
		     x[i].style.display = "none";
		  }
	tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" tab-border-red", "");
	}
	//document.getElementById(tabName).style.display = "block";
	evt.currentTarget.firstElementChild.className += " tab-border-red";
	  
	//fetch relevant data from server
	fetchAndDisplayData(tabName);
}*/

function unSelectAllTabs(){
	var tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" tab-border-red", "");
	}
}

function displayVehicles(){
	unSelectAllTabs();
	document.getElementById("vehicles-tab").className += " tab-border-red";
	fetchData('vehicle');
}

function displayDrivers(){
	unSelectAllTabs();
	document.getElementById("drivers-tab").className += " tab-border-red";
	fetchData('driver');
}

function showDriverData(username){
	closeNav();
	fetchAndDisplayDriverData(username); //in leftnav.js
}

function showVehicleData(uniqueId){
	closeNav();
	fetchAndDisplayVehicleData(uniqueId); //in leftnav.js
}

/**
 * Fetch data from server
 * @param type
 * @returns
 */
function fetchData(type){
	document.getElementById('tab-loading-data').style.display='block';
	var dataDiv = document.getElementById('tab-result');
	dataDiv.innerHTML='';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
        	document.getElementById('tab-loading-data').style.display='none';
            try {
                var resp = JSON.parse(request.response);
                
                if(type === 'driver'){
                	displayDriversData(dataDiv, resp);
                } else if (type === 'vehicle'){
                	displayVehiclesData(dataDiv, resp);
                }
                } catch (e){
	                var resp = {
	                    status: 'error',
	                    data: e.message
	                };
	                notifyUser(resp.status + ': ' + resp.data);
            }
            
        }
    };

    request.open ("GET", "http://localhost:8080/AngelTwo/rest/"+type, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
}

function displayVehiclesData(dataDiv, resp){
	var str = "<ul><div onclick='openVehicleModal();'><li style='padding-top:30px; height:50px;'><span class='name'>Add New Vehicle</span></li></div>";
	if(resp.result != 'error'){
    	var vehiclesArray = resp.result;
    	
    	str+="<li style='padding-top:30px; height:60px;'><span class='name' style='color:#4CAF50'>"+vehiclesArray.length+" vehicles found</span></li></ul><ul style='height:600px;'>";
    	
    	for(var i = 0; i < vehiclesArray.length; i++){
    		var vehicle = vehiclesArray[i];
    		str+="<div onclick=showVehicleData('"+vehicle.uniqueId+"');><li><img class='profile_image' src='http://localhost:8080/AngelTwo/AngelTwo/uploads/vehicle_images/"+vehicle.uniqueId+".png' alt='"
    				+ vehicle.registrationNumber+"'/>"	+ "<span class='name'>" + vehicle.registrationNumber + "</span><br/><span class='userdetails'>" + " Current Location " + "</span></li></div>"
    	}
        
    	str+="</ul>";
    	dataDiv.innerHTML=str;
    	} else {
    		str+="<ul><li style='padding-top:30px;'><span class='name' style='color:#f44336'>"+resp.error_message+"</span></li></ul>";
    		dataDiv.innerHTML = str;
    	}
}

function displayDriversData(dataDiv, resp){
	var str = "<ul><div onclick='openDriverModal();'><li style='padding-top:30px; height:50px;'><span class='name'>Add New Driver</span></li></div>";
	if(resp.result != 'error'){
    	var driversArray = resp.result;
    	
    	str+="<li style='padding-top:30px; height:60px;'><span class='name' style='color:#4CAF50'>"+driversArray.length+" drivers found</span></li></ul><ul style='height:600px;'>";
    	
    	for(var i = 0; i < driversArray.length; i++){
    		var driver = driversArray[i];
    		str+="<div onclick=showDriverData('"+driver.username+"');><li><img class='profile_image' src='http://localhost:8080/AngelTwo/AngelTwo/uploads/driver_images/"+driver.username+".png' alt='"+driver.username+"'/>"
    			+"<span class='name'>"+driver.name+"</span><br/><span class='userdetails'>"+driver.contactNumber+"</span></li></div>"
    	}
        
    	str+="</ul>";
    	dataDiv.innerHTML=str;
    	} else {
    		str+="<li style='padding-top:30px'><span class='name'  style='color:#f44336'>"+resp.error_message+"</span></li></ul>";
    		dataDiv.innerHTML = str;
    	}
}
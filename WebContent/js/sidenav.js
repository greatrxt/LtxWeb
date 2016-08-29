
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
/*	window.onclick = function(event) {
	    if (event.target == document.getElementById('contentnavcontainer')) {
	    	toggleNav();
	    }
	}*/
})
function openNav() {
	document.getElementById("contentnavcontainer").style.width = '370px';
	document.getElementById("sideNavCloseButton").className = 'fa fa-chevron-right';
    document.getElementById("contentnav").style.width = '350px';
    displayVehicles();
}

$(document).ready(function(){
	openNav();		
});

function toggleNav(){
	if(document.getElementById("contentnav").style.width === '0px'){
		openNav();
	} else {
		closeNav();
	}
}

function closeNav() {
	document.getElementById("contentnavcontainer").style.width = '23px';
	document.getElementById("sideNavCloseButton").className = 'fa fa-chevron-left';
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
	//closeNav();
	fetchAndDisplayDriverData(username); //in leftnav.js
}

function showVehicleData(uniqueId){
	//closeNav();
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

    request.open ("GET", "http://localhost:8080/AngelTwo/"+type, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
}

function displayVehiclesData(dataDiv, resp){
	var str = "<ul><div onclick='openVehicleModal();'><li class='muteItem' style='height:25px;'><span class='name'>Add New Vehicle</span></li></div>";
	if(resp.result != 'error'){
    	var vehiclesArray = resp.result;
    	
    	if(vehiclesArray.length === 0){
    		str+="<li class='infoItem' style='padding-top:30px; height:25px;'><span class='name' style='color:#4CAF50'>No Vehicle Found</span></li></ul><ul style='height:600px;'>";
    	} else if (vehiclesArray.length === 1){
    		str+="<li class='infoItem' style='padding-top:30px; height:25px;'><span class='name' style='color:#4CAF50'>"+vehiclesArray.length+" Vehicle Found</span></li></ul><ul style='height:600px;'>";
    	} else {
    		str+="<li class='infoItem' style='padding-top:30px; height:25px;'><span class='name' style='color:#4CAF50'>"+vehiclesArray.length+" Vehicles Found</span></li></ul><ul style='height:600px;'>";
    	}
    	for(var i = 0; i < vehiclesArray.length; i++){
    		var vehicle = vehiclesArray[i];
    		str+="<div onclick=showVehicleData('"+vehicle.uniqueId+"');><li class='activeItem'><img class='profile_image' src='" + base_url +vehicle.image+"' alt='"
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
	var str = "<ul><div onclick='openDriverModal();'><li class='muteItem' style='height:25px;'><span class='name'>Add New Driver</span></li></div>";
	if(resp.result != 'error'){
    	var driversArray = resp.result;
    	
    	str+="<li class='infoItem' style='padding-top:30px; height:25px;'><span class='name' style='color:#4CAF50'>"+driversArray.length+" drivers found</span></li></ul><ul style='height:600px;'>";
    	
    	for(var i = 0; i < driversArray.length; i++){
    		var driver = driversArray[i];
    		str+="<div onclick=showDriverData('"+driver.username+"');><li class='activeItem'><img class='profile_image' src='" + base_url + driver.image+"' alt='"+driver.username+"'/>"
    			+"<span class='name'>"+driver.name+"</span><br/><span class='userdetails'>"+driver.contactNumber+"</span></li></div>"
    	}
        
    	str+="</ul>";
    	dataDiv.innerHTML=str;
    	} else {
    		str+="<li style='padding-top:30px'><span class='name'  style='color:#f44336'>"+resp.error_message+"</span></li></ul>";
    		dataDiv.innerHTML = str;
    	}
}
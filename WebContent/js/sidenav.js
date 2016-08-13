
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

function fetchData(type){
	document.getElementById('tab-loading-data').style.display='block';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
        	document.getElementById('tab-loading-data').style.display='none';
        	var dataDiv = document.getElementById('tab-result');
            try {
                var resp = JSON.parse(request.response);
                if(resp.result != 'error'){
                	var str = "<ul><li style='padding-top:30px'><span class='name'>Add New Driver</span></li>";
                	var driversArray = resp.result;
                	
                	for(var i = 0; i < driversArray.length; i++){
                		var driver = driversArray[i];
                		str+="<li><img class='profile_image' src='http://localhost:8080/AngelTwo/AngelTwo/uploads/driver_images/"+driver.username+".png' alt='"+driver.username+"'/>"
                			+"<span class='name'>"+driver.name+"</span><br/><span class='userdetails'>"+driver.contactNumber+"</span></li>"
                	}
	                /**
						result.put("name", driver.getName());
						result.put("username", driver.getUsername());
						result.put("contactNumber", driver.getContactNumber());
						result.put("recordCreationTime", driver.getRecordCreationTime());
						result.put("dateOfJoining", driver.getDateOfJoining());
						result.put("image", driver.getImage());
						<li><img class="profile_image" src="photos/1.jpg" alt="acds"/><span class="name">sfsfsd</span><br/><span class="userdetails">sfsdfs</span></li>
	                 */
	                
                	str+="</ul>";
                	dataDiv.innerHTML=str;
                	}
                } catch (e){
                var resp = {
                    status: 'error',
                    data: 'Unknown error occurred: [' + request.responseText + ']'
                };
            }
            console.log(resp.status + ': ' + resp.data);
        }
    };

    request.upload.addEventListener('progress', function(e){
    	_progress.style.display='block';
    	_progress_outer.style.display='block';
        _progress.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
    }, false);

    request.open ("GET", "http://localhost:8080/AngelTwo/rest/"+type, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
}
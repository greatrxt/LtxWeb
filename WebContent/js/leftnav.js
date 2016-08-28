function setMinToDate(){
	var minDate = document.getElementById("vehicle-display-from-date").value;
	document.getElementById("vehicle-display-to-date").min = minDate;
}

function setMaxFromDate(){
	var maxDate = document.getElementById("vehicle-display-to-date").value;
	document.getElementById("vehicle-display-from-date").max = maxDate;
}

function fetchAndDisplayDriverData(username) {
	closeLeftNav();
    document.getElementById("leftnav").style.width = "450px";
    //document.getElementById("wrapper").style.marginLeft = "450px";
    document.getElementById('nav-loading-data').style.display='block';
    document.getElementById('driver-data-display').style.display='none';
    document.getElementById('vehicle-data-display').style.display='none';
    document.getElementById('driver-nav-image').style.display='none';
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
        	document.getElementById('nav-loading-data').style.display='none';
        	document.getElementById('driver-data-display').style.display='block';
        	document.getElementById('driver-nav-image').style.display='block';
            try {
                var resp = JSON.parse(request.response);
                document.getElementById('driver-nav-image').src='http://localhost:8080/AngelTwo/AngelTwo/uploads/driver_images/'+resp.result[0].username+".png";
                document.getElementById('driver-display-name').value=resp.result[0].name;
                document.getElementById('driver-display-username').value=resp.result[0].username;
                document.getElementById('driver-display-contact').value=resp.result[0].contactNumber;
                } catch (e){
                var resp = {
                    status: 'error',
                    data: 'Unknown error occurred: [' + request.responseText + ']'
                };
            }
        }
    };

    request.open ("GET", "http://localhost:8080/AngelTwo/rest/driver/"+username, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
    
}

function fetchAndDisplayVehicleData(uniqueId){
	closeLeftNav();
    document.getElementById("leftnav").style.width = "450px";
    //document.getElementById("wrapper").style.marginLeft = "450px";
    document.getElementById('nav-loading-data').style.display='block';
    document.getElementById('driver-data-display').style.display='none';
    document.getElementById('vehicle-data-display').style.display='none';
    document.getElementById('vehicle-nav-image').style.display='none';
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
        	document.getElementById('nav-loading-data').style.display='none';
        	document.getElementById('vehicle-data-display').style.display='block';
        	document.getElementById('vehicle-nav-image').style.display='block';
            try {
	                var resp = JSON.parse(request.response);
	                document.getElementById('vehicle-nav-image').src='http://localhost:8080/AngelTwo/AngelTwo/uploads/vehicle_images/'+resp.result[0].uniqueId+".png";
	                document.getElementById('vehicle-display-registration').value=resp.result[0].registrationNumber;
	                document.getElementById('vehicle-display-uniqueId').value=resp.result[0].uniqueId;
	                //document.getElementById('vehicle-display-driver').value=resp.result[0].driver;
                } catch (e){
	                var resp = {
	                    status: 'error',
	                    data: 'Unknown error occurred: [' + request.responseText + ']'
                };
            }
        }
    };

    request.open ("GET", "http://localhost:8080/AngelTwo/rest/vehicle/"+uniqueId, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
    
    //set max fromDate and toDate as today
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
     if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 

    today = yyyy+'-'+mm+'-'+dd;
    document.getElementById("vehicle-display-to-date").setAttribute("max", today);
    document.getElementById("vehicle-display-from-date").setAttribute("max", today);
} 

function closeLeftNav() {
    document.getElementById("leftnav").style.width = "0";
    //document.getElementById("wrapper").style.marginLeft= "0";
    document.getElementById('driver-nav-image').value='';
    document.getElementById('driver-display-name').value='';
	document.getElementById('driver-display-username').value='';
	document.getElementById('driver-display-contact').value='';
	document.getElementById('vehicle-nav-image').value='';
	document.getElementById('vehicle-display-registration').value='';
	document.getElementById('vehicle-display-uniqueId').value='';
	document.getElementById('vehicle-display-from-date').value='';
	document.getElementById('vehicle-display-to-date').value='';
	document.getElementById("vehicle-display-to-date").min = '';
	document.getElementById("vehicle-display-from-date").max = '';
	reset();
}
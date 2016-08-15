function fetchAndDisplayDriverData(username) {
    document.getElementById("leftnav").style.width = "450px";
    document.getElementById("wrapper").style.marginLeft = "450px";
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
    document.getElementById("leftnav").style.width = "450px";
    document.getElementById("wrapper").style.marginLeft = "450px";
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
} 

function closeLeftNav() {
    document.getElementById("leftnav").style.width = "0";
    document.getElementById("wrapper").style.marginLeft= "0";
}
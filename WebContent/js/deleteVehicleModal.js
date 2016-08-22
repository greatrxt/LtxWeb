
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('vehicleModal')) {
	    	closeVehicleModal();
	    }
	}
})


function openDeleteVehicleModal() {
	document.getElementById('deleteVehicleModal').style.display = "block";
    document.getElementById('vehicle-data-delete-progress').style.visibility = 'hidden';
    var registration = document.getElementById('vehicle-display-registration').value;
    document.getElementById('confrmDeleteText').textContent = "Are you sure you want to delete Vehicle with registration number '"+registration+"' ?";
}

function closeDeleteVehicleModal(){
	document.getElementById('deleteVehicleModal').style.display = 'none';
}


function deleteVehicleData(){
	document.getElementById('vehicle-data-delete-progress').style.visibility = 'visible';
	var vehicleUniqueId = document.getElementById('vehicle-display-uniqueId').value;
	
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result === 'success'){
                	closeDeleteVehicleModal();
                	notifyUser('Vehicle Deleted Successfully');
                	closeLeftNav();
                } else {
                	notifyUser(resp.error_message);
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

    request.open ("DELETE", "http://localhost:8080/AngelTwo/rest/vehicle/" + vehicleUniqueId, true);
    request.send();
}



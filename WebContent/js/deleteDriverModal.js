
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('driverModal')) {
	    	closeDriverModal();
	    }
	}
})


function openDeleteDriverModal() {
	document.getElementById('deleteDriverModal').style.display = "block";
    document.getElementById('driver-data-delete-progress').style.visibility = 'hidden';
    var username = document.getElementById('driver-display-username').value;
    document.getElementById('confrmDeleteText').textContent = "Are you sure you want to delete Driver with username '"+username+"' ?";
}

function closeDeleteDriverModal(){
	document.getElementById('deleteDriverModal').style.display = 'none';
}


function deleteDriverData(){
	document.getElementById('driver-data-delete-progress').style.visibility = 'visible';
	var driverusername = document.getElementById('driver-display-username').value;
	
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result === 'success'){
                	closeDeleteDriverModal();
                	notifyUser('Driver Deleted Successfully');
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

    request.open ("DELETE", "http://localhost:8080/AngelTwo/rest/driver/" + driverusername, true);
    request.send();
}



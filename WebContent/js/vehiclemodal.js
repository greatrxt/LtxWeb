
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('vehicleModal')) {
	    	closeVehicleModal();
	    }
	}
})

var vehicleImageInBase64;


function notifyUser(message){
	$('.notification').text(message).fadeIn(400).delay(3000).fadeOut(400);
}

function openVehicleModal() {
	document.getElementById('vehicleModal').style.display = "block";
    document.getElementById('clearVehicleImageButton').style.display='none';
    document.getElementById('vehicle-image-capture').style.display='block';
    document.getElementById('vehicle-data-submit-progress').style.visibility = 'hidden';
}

function closeVehicleModal(){
	document.getElementById('vehicleModal').style.display = 'none';
	document.getElementById('vehicle-registration').value='';
	document.getElementById('vehicle-uniqueId').value='';
	document.getElementById('vehicle-image-capture').value='';
	document.getElementById('vehicle-image').src='';
	document.getElementById('_progress_outer').style.display='none';
	document.getElementById('_progress').style.display='none';
}


function submitVehicleData(){
	document.getElementById('vehicle-edit-data-submit-progress').style.visibility = 'visible';
	var _submit = document.getElementById('submitVehicle'), 
	_file = document.getElementById('vehicle-image-capture'), 
	_progress = document.getElementById('_progress');
	_progress_outer = document.getElementById('_progress_outer');
/*    if(_file.files.length === 0){
        return;
    }*/

    var vehicle = new Object();
    vehicle.registration = document.getElementById('vehicle-registration').value;
    vehicle.uniqueId = document.getElementById('vehicle-uniqueId').value;
    vehicle.image = vehicleImageInBase64;
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result === 'success'){
                	closeVehicleModal();
                	notifyUser('Vehicle added');
                	fetchData('vehicle')
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

    request.upload.addEventListener('progress', function(e){
    	_progress.style.display='block';
    	_progress_outer.style.display='block';
        _progress.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
    }, false);

    request.open ("POST", "http://localhost:8080/AngelTwo/vehicle/", true);
    request.setRequestHeader("accept", "application/json");
    request.send(JSON.stringify(vehicle));
}


function clearVehicleImage(){
    $('#vehicle-image')
    .attr('src', '');
	document.getElementById('vehicle-image-capture').value='';
	vehicleImageInBase64 = '';
    document.getElementById('clearVehicleImageButton').style.display='none';
    document.getElementById('vehicle-image-capture').style.display='block';
}

function readVehicleImageURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#vehicle-image')
                .attr('src', e.target.result);
            
            vehicleImageInBase64 = e.target.result;
            document.getElementById('clearVehicleImageButton').style.display='block';
            document.getElementById('vehicle-image-capture').style.display='none';
        };

        reader.readAsDataURL(input.files[0]);
    }
}

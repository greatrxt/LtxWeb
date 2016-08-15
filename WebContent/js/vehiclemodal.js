
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('vehicleModal')) {
	    	closeVehicleModal();
	    }
	}
})

function notifyUser(message){
	$('.notification').text(message).fadeIn(400).delay(3000).fadeOut(400);
}

function openVehicleModal() {
	document.getElementById('vehicleModal').style.display = "block";
}

function closeVehicleModal(){
	document.getElementById('vehicleModal').style.display = "none";
	document.getElementById('vehicle-registration').value='';
	document.getElementById('vehicle-uniqueId').value='';
	document.getElementById('vehicle-image-capture').value='';
	document.getElementById('vehicle-image').src='';
	document.getElementById('vehicle-image').style.width=0;
	document.getElementById('vehicle-image').style.height=0;
	document.getElementById('_progress_outer').style.display='none';
	document.getElementById('_progress').style.display='none';
}

//Upload image to server
//http://stackoverflow.com/questions/25204621/send-image-to-server-using-file-input-type
//http://codular.com/javascript-ajax-file-upload-with-progress


function submitVehicleData(){

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

    request.open ("POST", "http://localhost:8080/AngelTwo/rest/vehicle/form", true);
    request.setRequestHeader("accept", "application/json");
    request.send(JSON.stringify(vehicle));
}

var vehicleImageInBase64;

function readVehicleImageURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#vehicle-image')
                .attr('src', e.target.result)
                .width(200);
                //.height(200);
            
            vehicleImageInBase64 = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

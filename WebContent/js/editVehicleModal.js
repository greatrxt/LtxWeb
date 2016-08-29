var image = '1'; // image = 1 stands for unchanged, image =  0 stands for deleted. If new image is set, then image = the base64 code of the image

/**
 * For editing existing vehicle 
 * @returns
 */
function editVehicleData(){
	var uniqueId = document.getElementById('vehicle-display-uniqueId').value;	//get username before closing left nav 
	closeLeftNav();
	
	var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result != 'error'){
                	var vehicle = resp.result[0];
                	document.getElementById('edit-vehicle-registration').value = vehicle.registrationNumber;
                	document.getElementById('edit-vehicle-uniqueId').value = vehicle.uniqueId;
                	document.getElementById('edit-vehicle-image').src = base_url +vehicle.image;
                    document.getElementById('clearEditVehicleImageButton').style.display='block';
                    document.getElementById('edit-vehicle-image-capture').style.display='none';
                	openEditVehicleModal();
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

    request.open ("GET", "http://localhost:8080/AngelTwo/vehicle/" + uniqueId, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
}

/**
 * Update vehicle data with new info
 * @returns
 */
function submitEditedVehicleData(){
	var newRegistrationNumber = document.getElementById('edit-vehicle-registration').value;
	var uniqueId = document.getElementById('edit-vehicle-uniqueId').value;
	
	document.getElementById('vehicle-edit-data-submit-progress').style.visibility = 'visible';
	
	var _submit = document.getElementById('submitVehicle'), 
	_file = document.getElementById('vehicle-image-capture'), 
	_progress = document.getElementById('_progress');
	_progress_outer = document.getElementById('_progress_outer');

    var vehicle = new Object();
    vehicle.registration = newRegistrationNumber;
    vehicle.uniqueId = uniqueId;
    vehicle.image = image;
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result === 'success'){
                	closeVehicleModal();
                	notifyUser('Vehicle Data Modified');
                	//fetchData('vehicle')
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
            closeEditVehicleModal();
        }
    };

    request.upload.addEventListener('progress', function(e){
    	_progress.style.display='block';
    	_progress_outer.style.display='block';
        _progress.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
    }, false);

    request.open ("PUT", "http://localhost:8080/AngelTwo/vehicle/", true);
    request.setRequestHeader("accept", "application/json");
    request.send(JSON.stringify(vehicle));
}

function openEditVehicleModal() {
	document.getElementById('editVehicleModal').style.display = "block";
	document.getElementById('vehicle-edit-data-submit-progress').style.visibility = 'hidden';
}

function closeEditVehicleModal(){
	document.getElementById('editVehicleModal').style.display = "none";
	document.getElementById('edit-vehicle-registration').value='';
	document.getElementById('edit-vehicle-uniqueId').value='';
	document.getElementById('edit-vehicle-image-capture').value='';
	document.getElementById('edit-vehicle-image').src='';
	document.getElementById('_progress_outer').style.display='none';
	document.getElementById('_progress').style.display='none';
}

function clearEditVehicleImage(){
    $('#edit-vehicle-image')
    .attr('src', '');
	document.getElementById('edit-vehicle-image-capture').value='';
    image = '0';
    document.getElementById('clearEditVehicleImageButton').style.display='none';
    document.getElementById('edit-vehicle-image-capture').style.display='block';
}

function readNewVehicleImageURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#edit-vehicle-image')
                .attr('src', e.target.result);
            
            image = e.target.result;
            document.getElementById('clearEditVehicleImageButton').style.display='block';
            document.getElementById('edit-vehicle-image-capture').style.display='none';
        };

        reader.readAsDataURL(input.files[0]);
    }
}

var editDriverImage = '1'; // image = 1 stands for unchanged, image =  0 stands for deleted. If new image is set, then image = the base64 code of the image

/**
 * For editing existing driver 
 * @returns
 */
function editDriverData(){
	var username = document.getElementById('driver-display-username').value;	//get username before closing left nav 
	closeLeftNav();
	
	var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result != 'error'){
                	var driver = resp.result[0];
                	document.getElementById('edit-driver-name').value = driver.name;
                	document.getElementById('edit-driver-username').value = driver.username;
                	document.getElementById('edit-driver-contact').value = driver.contactNumber;
                	if(driver.hasOwnProperty('dateOfJoining')){
                		document.getElementById('edit-driver-doj').value = driver.dateOfJoining;
                	}
                	document.getElementById('edit-driver-image').src = base_url +driver.image;
                    document.getElementById('clearEditDriverImageButton').style.display='block';
                    document.getElementById('edit-driver-image-capture').style.display='none';
                	openEditDriverModal();
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

    request.open ("GET", "http://localhost:8080/AngelTwo/driver/" + username, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
}

/**
 * Update driver data with new info
 * @returns
 */
function submitEditedDriverData(){
	document.getElementById('edit-driver-data-submit-progress').style.visibility = 'visible';
	
/*	var _submit = document.getElementById('submitDriver'), 
	_file = document.getElementById('driver-image-capture'), 
	_progress = document.getElementById('_progress');
	_progress_outer = document.getElementById('_progress_outer');*/

    var driver = new Object();
    driver.name = document.getElementById('edit-driver-name').value;
    driver.username = document.getElementById('edit-driver-username').value;
    driver.contactNumber = document.getElementById('edit-driver-contact').value;
    driver.dateOfJoining = document.getElementById('edit-driver-doj').value;
    driver.password = document.getElementById('edit-driver-password').value;
    driver.image = editDriverImage;
    
    if(driver.name === ''){
    	notifyUser('Name cannot be empty');
    	return;
    }
    
    if(driver.username === ''){
    	notifyUser('Username cannot be empty');
    	return;
    }    
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result === 'success'){
                	closeDriverModal();
                	notifyUser('Driver Data Modified');
                	//fetchData('driver')
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
            closeEditDriverModal();
        }
    };

/*    request.upload.addEventListener('progress', function(e){
    	_progress.style.display='block';
    	_progress_outer.style.display='block';
        _progress.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
    }, false);*/

    request.open ("PUT", "http://localhost:8080/AngelTwo/driver/", true);
    request.setRequestHeader("accept", "application/json");
    request.send(JSON.stringify(driver));
}

function openEditDriverModal() {
	document.getElementById('editDriverModal').style.display = "block";
	document.getElementById('edit-driver-data-submit-progress').style.visibility = 'hidden';
}

function closeEditDriverModal(){
	document.getElementById('editDriverModal').style.display = "none";
	document.getElementById('edit-driver-username').value='';
	document.getElementById('edit-driver-password').value='';
	document.getElementById('edit-driver-image-capture').value='';
	document.getElementById('edit-driver-image').src='';
	document.getElementById('_progress_outer').style.display='none';
	document.getElementById('_progress').style.display='none';
}

function clearEditDriverImage(){
    $('#edit-driver-image')
    .attr('src', '');
	document.getElementById('edit-driver-image-capture').value='';
	editDriverImage = '0';
    document.getElementById('clearEditDriverImageButton').style.display='none';
    document.getElementById('edit-driver-image-capture').style.display='block';
}

function readEditDriverImageURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#edit-driver-image')
                .attr('src', e.target.result);
            
            editDriverImage = e.target.result;
            document.getElementById('clearEditDriverImageButton').style.display='block';
            document.getElementById('edit-driver-image-capture').style.display='none';
        };

        reader.readAsDataURL(input.files[0]);
    }
}

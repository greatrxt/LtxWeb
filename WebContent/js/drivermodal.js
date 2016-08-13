
$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('driverModal')) {
	    	closeDriverModal();
	    }
	}
})

function notifyUser(message){
	$('.notification').text(message).fadeIn(400).delay(3000).fadeOut(400);
}

function openDriverModal() {
	document.getElementById('driverModal').style.display = "block";
}

function closeDriverModal(){
	document.getElementById('driverModal').style.display = "none";
	document.getElementById('driver-name').value='';
	document.getElementById('driver-username').value='';
	document.getElementById('driver-password').value='';
	document.getElementById('driver-confirmpassword').value='';
	document.getElementById('driver-contact').value='';
	document.getElementById('driver-doj').value='';
	document.getElementById('driver-image-capture').value='';
	document.getElementById('driver-image').src='';
	document.getElementById('driver-image').style.width=0;
	document.getElementById('driver-image').style.height=0;
	document.getElementById('_progress_outer').style.display='none';
	document.getElementById('_progress').style.display='none';
}

//Upload image to server
//http://stackoverflow.com/questions/25204621/send-image-to-server-using-file-input-type
//http://codular.com/javascript-ajax-file-upload-with-progress


function submitDriverData(){

	var _submit = document.getElementById('submitDriver'), 
	_file = document.getElementById('driver-image-capture'), 
	_progress = document.getElementById('_progress');
	_progress_outer = document.getElementById('_progress_outer');
/*    if(_file.files.length === 0){
        return;
    }*/

    var driver = new Object();
    driver.name = document.getElementById('driver-name').value;
    driver.username = document.getElementById('driver-username').value;
    driver.password = document.getElementById('driver-password').value;
    driver.contact = document.getElementById('driver-contact').value;
    driver.doj = document.getElementById('driver-doj').value;
    driver.image = driverImageInBase64;
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4/* && request.status == 200*/){
            try {
                var resp = JSON.parse(request.response);
                if(resp.result === 'success'){
                	closeDriverModal();
                	notifyUser('Driver added');
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

    request.open ("POST", "http://localhost:8080/AngelTwo/rest/driver/form", true);
    request.setRequestHeader("accept", "application/json");
    request.send(JSON.stringify(driver));
}

var driverImageInBase64;

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#driver-image')
                .attr('src', e.target.result)
                .width(200)
                .height(200);
            
            driverImageInBase64 = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}
/*$(document).ready(function(){			
	// Get the modal
	var modal = document.getElementById('vehicleModal');
	
	// Get the button that opens the modal
	var btn = document.getElementById("openVehicleModalButton");
	
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];
	
	// When the user clicks the button, open the modal
	btn.onclick = function() {
	    modal.style.display = "block";
	}
	
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}
	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
})*/


$(document).ready(function(){	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == document.getElementById('driverModal')) {
	    	closeDriverModal();
	    }
	}
})

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
}

//Upload image to server
//http://stackoverflow.com/questions/25204621/send-image-to-server-using-file-input-type
//http://codular.com/javascript-ajax-file-upload-with-progress

/*
var uploadDriverImage = function(){

	var _submit = document.getElementById('submitDriver'), 
	_file = document.getElementById('driver-image-capture'), 
	_progress = document.getElementById('_progress');
	
    if(_file.files.length === 0){
        return;
    }

    var data = new FormData();
    data.append('file', _file.files[0]);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4 && xmlhttp.status == 200){
            try {
                var resp = JSON.parse(request.response);
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
        _progress.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
    }, false);

    request.open('POST', 'http://localhost:8080/AngelTwo/rest/file/upload');
    request.setRequestHeader("enctype", "multipart/form-data"); 
    request.send(data);
}*/

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#driver-image')
                .attr('src', e.target.result)
                .width(200)
                .height(200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

var RotateIcon = function(options){
    this.options = options || {};
    this.rImg = options.img || new Image();
    this.rImg.src = this.rImg.src || this.options.url || '';
    this.options.width = this.options.width || this.rImg.width || 100;
    this.options.height = this.options.height || this.rImg.height || 60;
    canvas = document.createElement("canvas");
    canvas.width = this.options.width;
    canvas.height = this.options.height;
    this.context = canvas.getContext("2d");
    this.canvas = canvas;
};

RotateIcon.makeIcon = function(url) {
    return new RotateIcon({url: url});
};

RotateIcon.prototype.setRotation = function(options){
    var canvas = this.context,
        angle = options.deg ? options.deg * Math.PI / 180:
            options.rad,
        centerX = this.options.width/2,
        centerY = this.options.height/2;

    canvas.clearRect(0, 0, this.options.width, this.options.height);
    canvas.save();
    canvas.translate(centerX, centerY);
    canvas.rotate(angle);
    canvas.translate(-centerX, -centerY);
    canvas.drawImage(this.rImg, 0, 0);
    canvas.restore();
    return this;
};

RotateIcon.prototype.getUrl = function(){
    return this.canvas.toDataURL('image/png');
};

var map;
var allVehicleBounds;
function addOsmSupport(){
    var element = document.getElementById("map");

    /*
    Build list of map types.
    You can also use var mapTypeIds = ["roadmap", "satellite", "hybrid", "terrain", "OSM"]
    but static lists sucks when google updates the default list of map types.
    */
    var mapTypeIds = [];
    for(var type in google.maps.MapTypeId) {
        mapTypeIds.push(google.maps.MapTypeId[type]);
    }
    mapTypeIds.push("OSM");

    map = new google.maps.Map(element, {
        center: new google.maps.LatLng(19, 73),
        zoom: 10,
        mapTypeId: "OSM",
        mapTypeControlOptions: {
            mapTypeIds: mapTypeIds
        }
    });

    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            // See above example if you need smooth wrapping at 180th meridian
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));
}

function initiateSearch(){
	$('#search-text').fsearch();
}

function clearMarkerAndBearingForVehicle(key) {
	if(key in vehiclesHashmap){
		vehiclesHashmap[key].setMap(null);
		delete vehiclesHashmap[key];
		delete vehiclesHashmapBearing[key];
	}
}

var vehiclesHashmap = {};
var vehiclesHashmapBearing = {};

function moveVehicleIconTo(vehicleUniqueId, toLat, toLng, bearing, registration, speed, time){
	if(vehicleUniqueId in vehiclesHashmap){
		var oldMarker = vehiclesHashmap[vehicleUniqueId];
		var fromLat = oldMarker.position.lat();
		var fromLng = oldMarker.position.lng();
		var fromBearing = vehiclesHashmapBearing[vehicleUniqueId];
		
		 // store a LatLng for each step of the animation
	      frames = [];
	      for (var percent = 0; percent < 1; percent += 0.01) {
	        var curLat = fromLat + percent * (toLat - fromLat);
	        var curLng = fromLng + percent * (toLng - fromLng);
	        var curBearing = fromBearing + percent * (bearing - fromBearing);
	        var location = new Object();
	        location.latitude = curLat;
	        location.longitude = curLng;
	        location.bearing = curBearing;
	        
	        frames.push(location);
	      }
	
	      //recursive function
	      move = function(index, lat, lng, bearing, registration, speed, time){
	    	  
	    	  addVehicleIcon(vehicleUniqueId, lat, lng, bearing, registration, speed, time);
	    	  
	    	  if(index!=frames.length - 1){
	    		  setTimeout(function(){
	    			  move(index+1, frames[index+1].latitude, frames[index+1].longitude, frames[index+1].bearing, registration, speed, time);
	    		  }, 40);
	    	  } 
	      };
	      
	      move(0, frames[0].latitude, frames[0].longitude, frames[0].bearing, registration, speed, time);
	      
	} else {
		addVehicleIcon(vehicleUniqueId, toLat, toLng, bearing, registration, speed, time);	
	}
}

function addVehicleIcon(vehicleUniqueId, toLat, toLng, bearing, registration, speed, time){
	
	var marker = new google.maps.Marker({
		position:new google.maps.LatLng(toLat, toLng),
		icon: {
	        url: RotateIcon
	            .makeIcon(
	                'images/vehicle-icon.png')
	            .setRotation({deg: bearing})
	            .getUrl()
	    }
	});
	
	addEventListenersToMarker(marker, "Registration - "+registration + "<br />Date - " + time.split(" ")[0] + 
			"<br />Time - " + time.split(" ")[1] + "<br />Speed - " + ( speed * 3.6 ) + " kmph", true);
	marker.setMap(map);
	clearMarkerAndBearingForVehicle(vehicleUniqueId);//clear old markers
	saveMarkerAndBearingForVehicle(vehicleUniqueId, marker, bearing);
}

function saveMarkerAndBearingForVehicle(vehicleUniqueId, marker, bearing){
	vehiclesHashmap[vehicleUniqueId] = marker;
	vehiclesHashmapBearing[vehicleUniqueId] = bearing;
}

function showLastKnownLocationForAllVehicles(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
//            try {
                var resp = JSON.parse(request.response);
                var result = resp.result;
                
                if(result!='error'){
                	allVehicleBounds = new google.maps.LatLngBounds();
                	for(var l = 0; l < result.length; l++){
                		var vehicleJson = result[l];
                		
                		var vehicleUniqueId = vehicleJson.uniqueId;
                		var registration = vehicleJson.registration;
                		var latitude = vehicleJson.location.mLatitude;
                		var longitude = vehicleJson.location.mLongitude;
                		var bearing = vehicleJson.location.mBearing;
                		var speed = vehicleJson.location.mSpeed;
                		var time = vehicleJson.location.mTime;
                		
                		if(latitude > 0 && longitude > 0){
                			moveVehicleIconTo(vehicleUniqueId, latitude, longitude, bearing, registration, speed, time);
//                			clearVehicleIconsOverlay(vehicleUniqueId);
/*                			var marker = new google.maps.Marker({
                				position:new google.maps.LatLng(latitude, longitude),
                				icon: {
                			        url: RotateIcon
                			            .makeIcon(
                			                'images/vehicle-icon.png')
                			            .setRotation({deg: bearing})
                			            .getUrl()
                			    }
                			});
                			
                			addEventListenersToMarker(marker, "Registration - "+registration + "<br />Date - " + time.split(" ")[0] + 
                					"<br />Time - " + time.split(" ")[1] + "<br />Speed - " + ( speed * 3.6 ) + " kmph", true);
                			marker.setMap(map);
                			vehiclesHashmap[vehicleUniqueId] = marker;
                			allVehicleBounds.extend(new google.maps.LatLng(latitude, longitude)); 
                			map.fitBounds(allVehicleBounds);*/
                		}
                	}
                } else {
                	notifyUser(result.error_message);
                }
                
/*            } catch (e){
                var resp = {
                    status: 'error',
                    data: e.message
                };
                notifyUser(resp.status + ': ' + resp.data);
            }*/
        }
    };

    request.open ("GET", "http://localhost:8080/AngelTwo/rest/location", true);
    request.send();
}

$(document).ready(function(){
	addOsmSupport();	
	initiateSearch();	
	  timer = setInterval(function(){
		  showLastKnownLocationForAllVehicles();
	  }, 5000);		
});
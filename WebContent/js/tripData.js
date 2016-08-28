var showingRawPoints = true;
var showingSnappedPoints = false;
var showingOsrmPath = false;
var showingGooglePath = false;
var path;
var snappedPath;
var osrmPath;
var googlePath;
var map;
var mapBoundingDone;
var osrmLatLngArray = new Array();
var googleLatLngArray = new Array();
var osrmLimit = 90;
var tripBounds;
const min_speed = 1;
var timer;
var osrmRequestCounter, osrmResponseCounter, osrmFinalResponseIndex;
var markersArray = [];
/**
 * Loads data from status endpoint
 * @param map
 * @returns
 */
function loadDataOnMap() {
  reset();
  document.getElementById('loading-trip-data').style.visibility = 'visible';
  fetchVehicleData();
  refreshAutomaticallyIfTodaysDataShown();
}


function refreshAutomaticallyIfTodaysDataShown(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
     if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 

    today = yyyy+'-'+mm+'-'+dd;
    
    var toDate = document.getElementById('vehicle-display-to-date').value;
    if(toDate === today){
    	  timer = setInterval(function(){
    		  fetchVehicleData();
    	  }, 5000);
    }
}

function reset(){
	  if(map==null){
		  map = document.getElementById("map");
	  } else {
		  clearOverlays();
	  }
	  if(path!=null) {
		  path.setMap(null);
		  path=null
	  }
	  if(snappedPath!=null) {
		  snappedPath.setMap(null);
		  snappedPath=null
	  }
	  if(osrmPath!=null) {
		  osrmPath.setMap(null);
		  osrmPath=null
	  }
	  if(googlePath!=null) {
		  googlePath.setMap(null);
		  googlePath=null
	  }
	  
	  if(timer!=null){
		  clearInterval(timer);
	  }  
	  
	  mapBoundingDone = false;
	  
	  showingRawPoints = true; //show raw points by default
	  showingSnappedPoints = true;
	  showingOsrmPath = true;
	  showingGooglePath = true;
	  
	  toggleRawPoints();
	  toggleCalculatedRoute();
	  toggleGoogleRoute();
	  toggleSnappedPoints();
	  document.getElementById('loading-trip-data').style.visibility = 'hidden';
}
/**
 * Fetches vehicle data from server
 * @returns
 */
function fetchVehicleData(){
	  //var url = "http://localhost:8080/AngelTwo/rest/status/vehicle/100/10000";
	  var vehicleUniqueId = document.getElementById('vehicle-display-uniqueId').value;
	  var fromDate = document.getElementById('vehicle-display-from-date').value;
	  var toDate = document.getElementById('vehicle-display-to-date').value;
	  
	  if(fromDate == "" || toDate == ""){
		  notifyUser("Please Enter Valid Dates");
		  reset();
		  return;
	  }
	  var url = "http://localhost:8080/AngelTwo/rest/location/vehicle/" + vehicleUniqueId + "/" + fromDate + "/" + toDate;
	  var xmlhttp = new XMLHttpRequest();

	  xmlhttp.onreadystatechange = function() {
	      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	          var response = JSON.parse(xmlhttp.responseText);
	          //buildPathsWithoutSnapping(response);
	          if(Object.keys(response.result).length > 0){
	        	  drawSimplePolylineWithRawPoints(response);
	        	  document.getElementById('loading-trip-data').style.visibility = 'hidden';
	        	  //snapLatLngToRoadUsingGoogleRoadsApi(response);
		          //snapLatLngToRoadUsingOsrmRoadsApi(response);
	          } else {
	        	  //alert("No data");
	        	  notifyUser(" No Data Found Between Dates "+fromDate+" and "+toDate);
	        	  reset();
	          }
	      }
	  };
	  xmlhttp.open("GET", url, true);
	  xmlhttp.send();
}

/**
 * Snap lat-lng in data received to road using Google Roads API - Limit 2500 requests per day
 * @param response
 * @returns
 */
function snapLatLngToRoadUsingGoogleRoadsApi(response) {
  var locationArray = response.location;
  
  var googleRoadApiLimit = 90;
  var begin = 0;
  var end = googleRoadApiLimit;
  if(locationArray.length < googleRoadApiLimit){
	  end = locationArray.length;
  }
  
  googleLatLngArray.length = 0; //clear old data
  var allCoordinatesAdded = false;
  while(begin < locationArray.length){	  
	  var url = "https://roads.googleapis.com/v1/snapToRoads?key=AIzaSyCl660yK9AKtjaTj3xYwVksX7YWFJ9tni4&path=";
	  
	  for(var l = begin; l < end; l++){
		if(locationArray[l].mSpeed > min_speed){
			url+=locationArray[l].mLatitude+","+locationArray[l].mLongitude;
			if((l+1) != end){
				url+="|";
			}
		}
	  }	 
	  
	  if(url.charAt(url.length - 1) === '|'){
		  url = url.substring(0, url.length -1);
	  }
	  
	  makeRequestAndProcessResponse = function(url, callback, allCoordinatesAdded){
		  var xmlhttp = new XMLHttpRequest();
	       xmlhttp.onreadystatechange = function() {
	           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	             callback(xmlhttp.responseText, allCoordinatesAdded);   
	           } else if (xmlhttp.status == 429){
	        	   hideGoogleRouteButtonIfQuotaExceeded();
	           }
	       };
	       xmlhttp.open("GET", url, false);//false - calling synchronously now. Causes UI to freeze for a few milliseconds. Needs to be resolved.
	       xmlhttp.send();
	  }
	  
	  begin = end;
	  end = end + googleRoadApiLimit;
	  if(end > locationArray.length){
		  end = locationArray.length;
		  allCoordinatesAdded = true;
	  } 
	  
	  if(begin!=locationArray.length){
		  begin = begin -1;
	  }
	  
	  makeRequestAndProcessResponse(url, drawSimplePolylineWithGoogleApiSnappedPoints, allCoordinatesAdded);
  }
}

function hideGoogleRouteButtonIfQuotaExceeded(){
	//document.getElementById('googleRouteButton').style.visible = 'hidden';
	var googleRouteButton = document.getElementById("googleRouteButton");
	googleRouteButton.value = "Google Route unavailable";
	
}
/**
 * Snap lat lng received to road using OSRM server
 * @param response
 * @returns
 */

function snapLatLngToRoadUsingOsrmRoadsApi(response) {
  var locationArray = response.location;  
  
  var begin = 0;
  var end = osrmLimit;
  var allCoordinatesAdded = false;
  if(locationArray.length <= osrmLimit){
	  end = locationArray.length;
	  allCoordinatesAdded = true;
  }
  
  osrmLatLngArray.length = 0; //clear old data
  
  osrmRequestCounter = 0;
  osrmResponseCounter = 0;
  osrmFinalResponseIndex = -1;
  while(begin < locationArray.length){
	  var url = "http://127.0.0.1:5000/match/v1/driving/";
	  
	  for(var l = begin; l < end; l++){
		  if(locationArray[l].mSpeed > min_speed){
				url+=locationArray[l].mLongitude+","+locationArray[l].mLatitude;
				if((l+1) != end){
					url+=";";
				}
		  } else {
			  console.log("OSRM ignoring "+locationArray[l].mSpeed);
		  }
	  }
	 
	  if(url.charAt(url.length - 1) === ';'){
		  url = url.substring(0, url.length -1);
	  }
	  makeRequestAndProcessOsrmResponse = function(url, callback, allCoordinatesAdded, osrmRequestCounter){
		  var xmlhttp = new XMLHttpRequest();
	       xmlhttp.onreadystatechange = function() {
	           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	             callback(xmlhttp.responseText, allCoordinatesAdded, osrmRequestCounter);   
	           }
	       };
	       xmlhttp.open("GET", url, false);//false - calling synchronously now. Causes UI to freeze for a few milliseconds. Needs to be resolved.
	       xmlhttp.send();
	  }
	  
	  begin = end;
	  end = end + osrmLimit;
	  makeRequestAndProcessOsrmResponse(url, drawSimplePolylineWithOsrmSnappedPoints, allCoordinatesAdded, osrmRequestCounter);
	  if(end >= locationArray.length){
		  end = locationArray.length;
		  allCoordinatesAdded = true;
	  } 
	  
/*	  if(begin!=locationArray.length){
		  begin = begin -1;
	  }*/
	  
	    
	  osrmRequestCounter++;
  }
}

function clearOverlays() {
	  for (var i = 0; i < markersArray.length; i++ ) {
	    markersArray[i].setMap(null);
	  }
	  markersArray.length = 0;
}

/**
 * Draw polyline using raw coordinates
 * @param response
 * @returns
 */
function drawSimplePolylineWithRawPoints(response){
  var rawPoints = response.result;
  var latLngArray = new Array();
  var snappedLatLngArray = new Array();
  tripBounds = new google.maps.LatLngBounds();
  for(var l = 0; l < rawPoints.length; l++){
	  var locationJson = rawPoints[l];
	  var image = 'images/almost_transparent.png';
	  if(locationJson.mLatitude > 0 && locationJson.mLongitude > 0){
		  //var locationJson = rawPoints[l];	  
		  var marker;
		  
		  if(l == 0){
			  image = 'images/marker-green.png';
		  } else if (l == rawPoints.length -1){
			  image = 'images/marker-red.png';
		  }
		  if(locationJson.mSpeed > min_speed){
			  latLngArray.push(new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude));
			  if(locationJson.snappedLatitude > 0 && locationJson.snappedLongitude > 0){	  
				  snappedLatLngArray.push(new google.maps.LatLng(locationJson.snappedLatitude, locationJson.snappedLongitude));
				  marker=new google.maps.Marker({
					  position:new google.maps.LatLng(locationJson.snappedLatitude, locationJson.snappedLongitude),
					  icon:image
				  });
			  } else {
				  marker=new google.maps.Marker({
					  position:new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude),
					  icon:image
				  });
			  }

		  } else {
			  marker=new google.maps.Marker({
				  position:new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude),
				  icon:image
			  });
		  }
		  tripBounds.extend(new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude));  
	
		  marker.setMap(map);
		  markersArray.push(marker);
		  if(l == 0 || l == rawPoints.length -1){
			  var prefix;
			  if(l==0) 
				  prefix = "Begin - ";
			  else
				  prefix = "End - ";
			  addEventListenersToMarker(marker, prefix + locationJson.mTime, true); //show fixed markers for 1st and last point
		  } else {
			  addEventListenersToMarker(marker, " Driven by - " + locationJson.driver + "<br />  Date - " + locationJson.mTime.split(" ")[0] + "<br /> Time - " + locationJson.mTime.split(" ")[1] + "<br />Speed - " + (locationJson.mSpeed * 3.6) + " kmph", false);	//show temp marker for other points
		  }
	  
	  }
  }
  var arrow = {
	  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
  };
  
  if(latLngArray.length > 0){
	  if(path!=null){
		  path.setMap(null);
	  }
	  path = new google.maps.Polyline({
		  path:latLngArray,
		  strokeColor:"#1fbad6",
		  strokeOpacity:0.8,
		  strokeWeight:5,
		  icons: [{
	            icon: arrow,
	            repeat:'500px',
	            offset: '100%'}]
		  });
	  
	  if(showingRawPoints){
		  showingRawPoints = false;
		  toggleRawPoints();
		  path.setMap(map);
	  } else {
		  showingRawPoints = true;
		  toggleRawPoints();
		  path.setMap(null);
	  }
  }
  //path.setMap(map);
  

  if(snappedLatLngArray.length > 0){
	  
	  if(snappedPath!=null){
		  snappedPath.setMap(null);
	  }

	  
	  snappedPath = new google.maps.Polyline({
		  path:snappedLatLngArray,
		  strokeColor:"#0000FF",
		  strokeOpacity:0.8,
		  strokeWeight:3,
		  icons: [{
	            icon: arrow,
	            repeat:'300px',
	            offset: '100%'}]
		  });
  
	  if(showingSnappedPoints){
		  showingSnappedPoints = false;
		  toggleSnappedPoints();
		  snappedPath.setMap(map);
	  } else {
		  showingSnappedPoints = true;
		  toggleSnappedPoints();
		  snappedPath.setMap(null);
	  }
	  
  }
  
  
  //snappedPath.setMap(map);
  if(!mapBoundingDone){
	  map.fitBounds(tripBounds);
	  mapBoundingDone = true;
  }
//  toggleRawPoints();
//  toggleSnappedPoints();

}  

/**
 * Draw polyline using lat lng values received from OSRM server
 * @param snappedResponse
 * @returns
 */
function drawSimplePolylineWithOsrmSnappedPoints(snappedResponse, allCoordinatesAdded, requestIndex){
  var snappedPointsJson = JSON.parse(snappedResponse).tracepoints;
  
  for(var l = 0; l < snappedPointsJson.length; l++){
	  if(snappedPointsJson[l]!=null){
		  var locationJson = snappedPointsJson[l].location;
		  var insertIndex = (requestIndex * osrmLimit) + snappedPointsJson[l].waypoint_index;
		  //osrmLatLngArray.push(new google.maps.LatLng(locationJson[1], locationJson[0]));
		  osrmLatLngArray.splice(insertIndex, 0, new google.maps.LatLng(locationJson[1], locationJson[0]));
	  }
  }
  if(allCoordinatesAdded){
	  osrmFinalResponseIndex = requestIndex;
  }
  
  if(osrmResponseCounter == osrmFinalResponseIndex){
	  var osrmArrow = {
		        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	  };
	  
	  
	  if(osrmPath!=null){
		  osrmPath.setMap(null);
	  }
	  osrmPath = new google.maps.Polyline({
		  path:osrmLatLngArray,
		  strokeColor:"#008000",
		  //strokeColor:'#'+(Math.random(requestIndex)*0xFFFFFF<<0).toString(16),
		  strokeOpacity:0.8,
		  strokeWeight:4,
		  icons: [{
	            icon: osrmArrow,
	            repeat:'300px',
	            offset: '100%'}]
		  });

	  
	  if(showingOsrmPath){
		  showingOsrmPath = false;
		  toggleCalculatedRoute();
		  osrmPath.setMap(map);
	  } else {
		  showingOsrmPath = true;
		  toggleCalculatedRoute();
		  osrmPath.setMap(null);
	  }
  }
  osrmResponseCounter++;
}

/**
 * Draw polyline using lat lng values received from Google Roads API
 * @param googleResponse
 * @returns
 */
function drawSimplePolylineWithGoogleApiSnappedPoints(googleResponse, allCoordinatesAdded){
  var googleJson = JSON.parse(googleResponse).snappedPoints;
  
  for(var l = 0; l < googleJson.length; l++){
	  var googleLocationJson = googleJson[l].location;
	  googleLatLngArray.push(new google.maps.LatLng(googleLocationJson.latitude, googleLocationJson.longitude));
  }
  if(allCoordinatesAdded){
	  var googleRouteArrow = {
		        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	  };
	  if(googlePath!=null){
		  googlePath.setMap(null);
	  }
	  googlePath = new google.maps.Polyline({
		  path:googleLatLngArray,
		  strokeColor:"#0F0F00",
		  strokeOpacity:0.8,
		  strokeWeight:4,
		  icons: [{
	            icon: googleRouteArrow,
	            repeat:'300px',
	            offset: '100%'}]
		  });
	  googlePath.setMap(map);	
	  if(showingGooglePath){
		  showingGooglePath = false;
		  toggleGoogleRoute();
		  googlePath.setMap(map);
	  } else {
		  showingGooglePath = true;
		  toggleGoogleRoute();
		  googlePath.setMap(null);
	  }
  }
}

/**
 * Adds a transparent marker on map. Shows time when mouse hovers over
 * @param marker
 * @param time
 * @param fixed
 * @returns
 */
function addEventListenersToMarker(marker, time, fixed){	
  var infowindow = new google.maps.InfoWindow({
		  content:""
  });
  if(fixed){
	  google.maps.event.addDomListener(marker, 'center_changed', function() {
	      infowindow.setContent(time);
	      infowindow.open(map,marker);	
	  });
	  
	  google.maps.event.addDomListener(marker, 'mouseover', function() {
	      infowindow.setContent(time);
	      infowindow.open(map,marker);	
	  });  
/*			  google.maps.event.addDomListener(marker, 'center_changed', function() {
			      infowindow.close();	
			  });*/
  } else {
	  google.maps.event.addDomListener(marker, 'mouseover', function() {
	      infowindow.setContent(time);
	      infowindow.open(map,marker);	
	  });
	  
	  google.maps.event.addDomListener(marker, 'mouseout', function() {
		      infowindow.close();	
	  });
  }
}

/**
 * Toggle visibility of path drawn using raw points
 * @returns
 */
function toggleRawPoints(){
	var rawDataButton = document.getElementById("rawDataButton");
	if(path!=null){
		  if(showingRawPoints){
			  path.setMap(null);
			  //rawDataButton.value = "Show Raw Data";
			  rawDataButton.className = "standardNegativebutton";
		  } else {
			  path.setMap(map);
			  rawDataButton.className = "standardbutton";
		  }
		  showingRawPoints = !showingRawPoints;
	} else {
		rawDataButton.className = "standardMutebutton";
	}
}

/**
 * Toggle visibility of path drawn using snapped points
 * @returns
 */
function toggleSnappedPoints(){
	var snappedDataButton = document.getElementById("snappedDataButton");
	if(snappedPath!=null){
	  if(showingSnappedPoints){
		  snappedPath.setMap(null);
		  //snappedDataButton.value = "Show Snapped Data";
		  snappedDataButton.className = "standardNegativebutton";
	  } else {
		  snappedPath.setMap(map);
		  //snappedDataButton.value = "Hide Snapped Data";
		  snappedDataButton.className = "standardbutton";
	  }
	  showingSnappedPoints = !showingSnappedPoints;
	} else {
		snappedDataButton.className = "standardMutebutton";
	}
}
	
/**
 * Toggle visibility of path drawn using points received from Google Roads API
 * @returns
 */	
function toggleGoogleRoute(){
	var googleRouteButton = document.getElementById("googleRouteButton");
	if(googlePath!=null){
		googleRouteButton.value = "Google Route";
		  if(showingGooglePath){
			  googlePath.setMap(null);
			  //googleRouteButton.value = "Show Google Data";
			  googleRouteButton.className = "standardNegativebutton";
		  } else {
			  googlePath.setMap(map);
			  //googleRouteButton.value = "Hide Google Data";
			  googleRouteButton.className = "standardbutton";
		  }
		  showingGooglePath = !showingGooglePath;
	} else {
		googleRouteButton.className = "standardMutebutton";
	}
}

/**
 * Toggle visibility of path drawn using points received from OSRM server
 * @returns
 */
function toggleCalculatedRoute(){
	var calculatedRouteButton = document.getElementById("calculatedRouteButton");
	if(osrmPath!=null){
		calculatedRouteButton.value = "Calculated Route";
		  if(showingOsrmPath){
			  osrmPath.setMap(null);
			  //calculatedRouteButton.value = "Show Snapped Data";
			  calculatedRouteButton.className = "standardNegativebutton";
		  } else {
			  osrmPath.setMap(map);
			  //calculatedRouteButton.value = "Hide Snapped Data";
			  calculatedRouteButton.className = "standardbutton";
		  }
		  showingOsrmPath = !showingOsrmPath;
	} else {
		calculatedRouteButton.className = "standardMutebutton";
	}
}
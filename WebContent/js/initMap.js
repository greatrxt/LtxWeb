var showingRawPoints = true;
var showingSnappedPoints = true;
var showingOsrmPath = true;
var showingGooglePath = true;
var path;
var snappedPath;
var osrmPath;
var googlePath;
var map;

var osrmLatLngArray = new Array();
var googleLatLngArray = new Array();

var vehicleBounds;

/**
 * Loads data from status endpoint
 * @param map
 * @returns
 */
function loadDataOnMap(map) {
  //Loading vehicle information - refer http://www.w3schools.com/json/json_http.asp
  this.map = map;
  var url = "http://localhost:8080/AngelTwo/rest/status/vehicle/100/1000";
  
  setInterval(function(){
	  var xmlhttp = new XMLHttpRequest();

	  xmlhttp.onreadystatechange = function() {
	      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	          var response = JSON.parse(xmlhttp.responseText);
	          //buildPathsWithoutSnapping(response);
	          if(Object.keys(response.location).length > 0){
	        	  drawSimplePolylineWithRawPoints(response);
	        	  snapLatLngToRoadUsingGoogleRoadsApi(response);
		          snapLatLngToRoadUsingOsrmRoadsApi(response);
	          } else {
	        	  alert("No data");
	          }
	      }
	  };
	  xmlhttp.open("GET", url, true);
	  xmlhttp.send();

  }, 10000);
}

/**
 * Snap lat-lng in data received to road using Google Roads API - Limit 2500 requests per day
 * @param response
 * @returns
 */
function snapLatLngToRoadUsingGoogleRoadsApi(response) {
  var locationArray = response.location;
  
  var googleRoadApiLimit = 100;
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
		url+=locationArray[l].mLatitude+","+locationArray[l].mLongitude;
		if((l+1) != end){
			url+="|";
		}
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
	       xmlhttp.open("GET", url, true);
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
	document.getElementById('googleRouteButton').style.visible = 'hidden';
}
/**
 * Snap lat lng received to road using OSRM server
 * @param response
 * @returns
 */

function snapLatLngToRoadUsingOsrmRoadsApi(response) {
  var locationArray = response.location;  
  var osrmLimit = 100;
  var begin = 0;
  var end = osrmLimit;
  if(locationArray.length <= osrmLimit){
	  end = locationArray.length;
  }
  
  osrmLatLngArray.length = 0; //clear old data
  var allCoordinatesAdded = false;
  while(begin < locationArray.length){
	  
	  var url = "http://127.0.0.1:5000/match/v1/driving/";
	  
	  for(var l = begin; l < end; l++){
		url+=locationArray[l].mLongitude+","+locationArray[l].mLatitude;
		if((l+1) != end){
			url+=";";
		}
	  }
	 
	  
	  makeRequestAndProcessOsrmResponse = function(url, callback, allCoordinatesAdded){
		  var xmlhttp = new XMLHttpRequest();
	       xmlhttp.onreadystatechange = function() {
	           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	             callback(xmlhttp.responseText, allCoordinatesAdded);   
	           }
	       };
	       xmlhttp.open("GET", url, true);
	       xmlhttp.send();
	  }
	  
	  begin = end;
	  end = end + osrmLimit;
	  if(end >= locationArray.length){
		  end = locationArray.length;
		  allCoordinatesAdded = true;
	  } 
	  
	  if(begin!=locationArray.length){
		  begin = begin -1;
	  }
	  
	  makeRequestAndProcessOsrmResponse(url, drawSimplePolylineWithOsrmSnappedPoints, allCoordinatesAdded);  

  }
}

/**
 * Draw polyline using raw coordinates
 * @param response
 * @returns
 */
function drawSimplePolylineWithRawPoints(response){
  var rawPoints = response.location;
  var latLngArray = new Array();
  var snappedLatLngArray = new Array();
  vehicleBounds = new google.maps.LatLngBounds();
  for(var l = 0; l < rawPoints.length; l++){
	  var locationJson = rawPoints[l];
	  latLngArray.push(new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude));
	  snappedLatLngArray.push(new google.maps.LatLng(locationJson.snappedLatitude, locationJson.snappedLongitude));
	  vehicleBounds.extend(new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude));
	  
	  
	  
	  var image = 'images/almost_transparent.png';
	  var marker=new google.maps.Marker({
		  //position:new google.maps.LatLng(locationJson.mLatitude, locationJson.mLongitude),
		  position:new google.maps.LatLng(locationJson.snappedLatitude, locationJson.snappedLongitude),
		  icon:image
	  });

	  marker.setMap(map);

	  if(l == 0 || l == rawPoints.length -1){
		  var prefix;
		  if(l==0) 
			  prefix = "Begin - ";
		  else
			  prefix = "End - ";
		  addMarker(marker, prefix + locationJson.mTime, true); //show fixed markers for 1st and last point
	  } else {
		  addMarker(marker, locationJson.mTime, false);	//show temp marker for other points
	  }
	  
  }
  var arrow = {
	  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
  };
  
  path = new google.maps.Polyline({
	  path:latLngArray,
	  strokeColor:"#FF0000",
	  strokeOpacity:0.8,
	  strokeWeight:3,
	  icons: [{
            icon: arrow,
            repeat:'300px',
            offset: '100%'}]
	  });
  
  path.setMap(map);
  
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
  
  snappedPath.setMap(map);
  map.fitBounds(vehicleBounds);
  toggleRawPoints();
  toggleSnappedPoints();

}  

/**
 * Draw polyline using lat lng values received from OSRM server
 * @param snappedResponse
 * @returns
 */
function drawSimplePolylineWithOsrmSnappedPoints(snappedResponse, allCoordinatesAdded){
  var snappedPointsJson = JSON.parse(snappedResponse).tracepoints;
  
  for(var l = 0; l < snappedPointsJson.length; l++){
	  if(snappedPointsJson[l]!=null){
		  var locationJson = snappedPointsJson[l].location;
		  //osrmLatLngArray.push(new google.maps.LatLng(locationJson.latitude, locationJson.longitude));
		  osrmLatLngArray.push(new google.maps.LatLng(locationJson[1], locationJson[0]));
	  }
  }
  if(allCoordinatesAdded){
	  var osrmArrow = {
		        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	  };
	  
	  osrmPath.setMap(null);
	  osrmPath = new google.maps.Polyline({
		  path:osrmLatLngArray,
		  strokeColor:"#008000",
		  strokeOpacity:0.8,
		  strokeWeight:4,
		  icons: [{
	            icon: osrmArrow,
	            repeat:'300px',
	            offset: '100%'}]
		  });
	  osrmPath.setMap(map);	 
	  //showingOsrmPath = false;
	  toggleCalculatedRoute();
  }
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
	  googlePath.setMap(null);;
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
	  showingGooglePath = false;
	  toggleGoogleRoute();
  }
}

/**
 * Adds a transparent marker on map. Shows time when mouse hovers over
 * @param marker
 * @param time
 * @param fixed
 * @returns
 */
function addMarker(marker, time, fixed){	
  var infowindow = new google.maps.InfoWindow({
		  content:""
  });
  if(fixed){
	  google.maps.event.addDomListener(window, 'load', function() {
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
	  if(showingRawPoints){
		  path.setMap(null);
		  //rawDataButton.value = "Show Raw Data";
		  rawDataButton.className = "standardNegativebutton";
	  } else {
		  path.setMap(map);
		  //rawDataButton.value = "Hide Raw Data";
		  rawDataButton.className = "standardbutton";
	  }
	  showingRawPoints = !showingRawPoints;
}

/**
 * Toggle visibility of path drawn using snapped points
 * @returns
 */
function toggleSnappedPoints(){
	var snappedDataButton = document.getElementById("snappedDataButton");
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
}
	
/**
 * Toggle visibility of path drawn using points received from Google Roads API
 * @returns
 */	
function toggleGoogleRoute(){
	if(googlePath!=null){
		var googleRouteButton = document.getElementById("googleRouteButton");
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
	}
}

/**
 * Toggle visibility of path drawn using points received from OSRM server
 * @returns
 */
function toggleCalculatedRoute(){
	if(osrmPath!=null){
		var calculatedRouteButton = document.getElementById("calculatedRouteButton");
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
	}
}
var showingRawPoints = true;
var showingSnappedPoints = true;
var showingOsrmPath = true;
var showingGooglePath = true;
var path;
var snappedPath;
var osrmPath;
var googlePath;
var map;

var vehicleBounds;

function initMap() {
	
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
    

  //Loading vehicle information - refer http://www.w3schools.com/json/json_http.asp
  
  var xmlhttp = new XMLHttpRequest();
  var url = "http://localhost:8080/AngelTwo/rest/status/vehicle/100/1000";

  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var response = JSON.parse(xmlhttp.responseText);
          //buildPathsWithoutSnapping(response);
          snapLatLngToRoadUsingGoogleRoadsApi(response);
          drawSimplePolylineWithRawPoints(response);
          snapLatLngToRoadUsingOsrmRoadsApi(response);
      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();

  function snapLatLngToRoadUsingGoogleRoadsApi(response) {
	  var locationArray = response.location;
	  
	  var googleRoadApiLimit = 100;
	  var begin = 0;
	  var end = googleRoadApiLimit;
	  if(locationArray.length < googleRoadApiLimit){
		  end = locationArray.length;
	  }
	  
	  var done = false;
	  while(begin < locationArray.length){
		  
		  var url = "https://roads.googleapis.com/v1/snapToRoads?key=AIzaSyCl660yK9AKtjaTj3xYwVksX7YWFJ9tni4&path=";
		  
		  for(var l = begin; l < end; l++){
			url+=locationArray[l].mLatitude+","+locationArray[l].mLongitude;
			if((l+1) != end){
				url+="|";
			}
		  }
		 
		  
		  makeRequestAndProcessResponse = function(url, callback){
			  var xmlhttp = new XMLHttpRequest();
		       xmlhttp.onreadystatechange = function() {
		           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		             callback(xmlhttp.responseText);   
		           }
		       };
		       xmlhttp.open("GET", url, true);
		       xmlhttp.send();
		  }
		  
		  makeRequestAndProcessResponse(url, drawSimplePolylineWithGoogleApiSnappedPoints);
		  
		  begin = end;
		  end = googleRoadApiLimit;
		  if((begin + end) > locationArray.length){
			  end = locationArray.length;
		  } 
		  
		  if(begin!=locationArray.length){
			  begin = begin -1;
		  }
	  }

  }
    
  function snapLatLngToRoadUsingOsrmRoadsApi(response) {
	  var locationArray = response.location;
	  
	  var osrmLimit = 100;
	  var begin = 0;
	  var end = osrmLimit;
	  if(locationArray.length < osrmLimit){
		  end = locationArray.length;
	  }
	  
	  var done = false;
	  while(begin < locationArray.length){
		  
		  var url = "http://127.0.0.1:5000/match/v1/driving/";
		  
		  for(var l = begin; l < end; l++){
			url+=locationArray[l].mLongitude+","+locationArray[l].mLatitude;
			if((l+1) != end){
				url+=";";
			}
		  }
		 
		  
		  makeRequestAndProcessOsrmResponse = function(url, callback){
			  var xmlhttp = new XMLHttpRequest();
		       xmlhttp.onreadystatechange = function() {
		           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		             callback(xmlhttp.responseText);   
		           }
		       };
		       xmlhttp.open("GET", url, true);
		       xmlhttp.send();
		  }
		  
		  makeRequestAndProcessOsrmResponse(url, drawSimplePolylineWithOsrmSnappedPoints);
		  
		  begin = end;
		  end = osrmLimit;
		  if((begin + end) > locationArray.length){
			  end = locationArray.length;
		  } 
		  
		  if(begin!=locationArray.length){
			  begin = begin -1;
		  }
	  }

  }
  
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
  
  function drawSimplePolylineWithOsrmSnappedPoints(snappedResponse){
	  var snappedPointsJson = JSON.parse(snappedResponse).tracepoints;
	  var latLngArray = new Array();
	  for(var l = 0; l < snappedPointsJson.length; l++){
		  if(snappedPointsJson[l]!=null){
			  var locationJson = snappedPointsJson[l].location;
			  //latLngArray.push(new google.maps.LatLng(locationJson.latitude, locationJson.longitude));
			  latLngArray.push(new google.maps.LatLng(locationJson[1], locationJson[0]));
		  }
	  }
	  var osrmArrow = {
		        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	  };
	  osrmPath = new google.maps.Polyline({
		  path:latLngArray,
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
  
  function drawSimplePolylineWithGoogleApiSnappedPoints(googleResponse){
	  var googleJson = JSON.parse(googleResponse).snappedPoints;
	  var googleLatLngArray = new Array();
	  for(var l = 0; l < googleJson.length; l++){
		  var googleLocationJson = googleJson[l].location;
		  googleLatLngArray.push(new google.maps.LatLng(googleLocationJson.latitude, googleLocationJson.longitude));
	  }
	  var googleRouteArrow = {
		        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	  };
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
  
  function buildPathsAfterSnapping(response) {
	  
      //***********ROUTING****************
	  // taken from http://www.aspsnippets.com/Articles/Google-Maps-V3-Draw-route-line-between-two-geographic-locations-Coordinates-Latitude-and-Longitude-points.aspx//
	  //https://developers.google.com/maps/documentation/roads/snap
      //Initialize the Path Array
      var path = new google.maps.MVCArray();

      //Initialize the Direction Service
      var service = new google.maps.DirectionsService();

      //Set the Path Stroke Color
      var poly = new google.maps.Polyline({ map: map, strokeColor: '#4986E7' });
      
	  var snappedPoints = response.snappedPoints;
	  for(var l = 0; l < snappedPoints.length; l++){
		  if((l+1) < snappedPoints.length){
			  var sourceJson = snappedPoints[l].location;
			  var destinationJson = snappedPoints[l+1].location;
			  
			  var src = new google.maps.LatLng(sourceJson.latitude, sourceJson.longitude);
			  var des = new google.maps.LatLng(destinationJson.latitude, destinationJson.longitude);
			  
			  path.push(src);
              poly.setPath(path);
              service.route({
                  origin: src,
                  destination: des,
                  travelMode: google.maps.DirectionsTravelMode.DRIVING
              }, function (result, status) {
                  if (status == google.maps.DirectionsStatus.OK) {
                      for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                          path.push(result.routes[0].overview_path[i]);
                      }
                  }
              });
		  } else {
			    
			  /* 	Code to load simple marker on google map */

			    var image = 'images/truck_logo.png';
			    var beachMarker = new google.maps.Marker({
			      position: {lat: snappedPoints[l].mLatitude, lng: snappedPoints[l].mLongitude},
			      map: map,
			      icon: image
			    });
			    
		  }
	  }
  }
  
  function buildPathsWithoutSnapping(response) {
	  
      //***********ROUTING****************
	  // taken from http://www.aspsnippets.com/Articles/Google-Maps-V3-Draw-route-line-between-two-geographic-locations-Coordinates-Latitude-and-Longitude-points.aspx//
	  //https://developers.google.com/maps/documentation/roads/snap
      //Initialize the Path Array
      var path = new google.maps.MVCArray();

      //Initialize the Direction Service
      var service = new google.maps.DirectionsService();

      //Set the Path Stroke Color
      var poly = new google.maps.Polyline({ map: map, strokeColor: '#4986E7' });
      
	  var locationArray = response.location;
	  for(var l = 0; l < locationArray.length; l++){
		  if((l+1) < locationArray.length){
			  var sourceJson = locationArray[l];
			  var destinationJson = locationArray[l+1];
			  
			  var src = new google.maps.LatLng(sourceJson.mLatitude, sourceJson.mLongitude);
			  var des = new google.maps.LatLng(destinationJson.mLatitude, destinationJson.mLongitude);
			  
			  path.push(src);
              poly.setPath(path);
              service.route({
                  origin: src,
                  destination: des,
                  travelMode: google.maps.DirectionsTravelMode.DRIVING
              }, function (result, status) {
                  if (status == google.maps.DirectionsStatus.OK) {
                      for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                          path.push(result.routes[0].overview_path[i]);
                      }
                  }
              });
		  } else {
			    
			  /* 	Code to load simple marker on google map */

			    var image = 'images/truck_logo.png';
			    var beachMarker = new google.maps.Marker({
			      position: {lat: locationArray[l].mLatitude, lng: locationArray[l].mLongitude},
			      map: map,
			      icon: image
			    });
			    
		  }
	  }
  }
}

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
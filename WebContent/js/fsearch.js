(function($){
$.fn.fsearch = function(){
  var $searchInput = $(this);
  //$searchInput.after('<div id="divResult"></div>');
  $resultDiv = $('#divResult');
  $searchInput.focus();
  $searchInput.addClass('searchi');
  $resultDiv.html("<ul style='padding-top:10px;'></ul><div id='search-footer' class='searchf'></div>");
  $searchInput.keyup(function(e) {
  var q = $(this).val();
    if(q != '') { 
      var current_index = $('.selected').index(),
      $options = $resultDiv.find('.option'),
      items_total = $options.length;

      // When Down Arrow key is pressed
      if (e.keyCode == 40) {
          if (current_index + 1 < items_total) {
              current_index++;
              change_selection($options, current_index);
          }
      } 
      // When Up Arrow is pressed
      else if (e.keyCode == 38) {
          if (current_index > 0) {
              current_index--;
              change_selection($options, current_index);
          }
      }
      // When enter key is pressed
      else if(e.keyCode == 13){
        var id = $resultDiv.find('ul li.selected').attr('id');
        var name = $resultDiv.find('ul li.selected').find('.name').text();
        $searchInput.val(id); 
        $resultDiv.fadeOut();// Here you get the id and name of the element selected. You can change this to redirect to any page too. Just like facebook.   
      } else {
      $resultDiv.fadeIn();
      $resultDiv.find('#search-footer').html("<img src='images/loading.gif' style='height:30px;width:30px;' alt='Collecting Data...'/>");
      
      // Query search details from database
      $.getJSON("http://localhost:8080/AngelTwo/rest/status/"+q, function(jsonResult)
      { 
        var str='';
        for(var i=0; i<jsonResult.driver.result.length;i++){
            str += '<div onclick=showDriverData("'+jsonResult.driver.result[i].username+'");> '+'<li id=' + jsonResult.driver.result[i].username + ' class="option"><img class="profile_image" src="http://localhost:8080/AngelTwo/AngelTwo/uploads/driver_images/' 
            + jsonResult.driver.result[i].username +
            '.png " alt="'+jsonResult.driver.result[i].username+'"/><span class="name">' + jsonResult.driver.result[i].name + '</span><br/><span class="userdetails">'
            +jsonResult.driver.result[i].contactNumber+'</span></li></div>';
         }
        
        for(var i=0; i<jsonResult.vehicle.result.length;i++){
            str += '<div onclick=showVehicleData("' + jsonResult.vehicle.result[i].uniqueId + '");> '+'<li id=' + jsonResult.vehicle.result[i].uniqueId + ' class="option"><img class="profile_image" src="http://localhost:8080/AngelTwo/AngelTwo/uploads/vehicle_images/' + jsonResult.vehicle.result[i].uniqueId +
            '.png " alt="' + jsonResult.vehicle.result[i].uniqueId + '"/><span class="name">' + jsonResult.vehicle.result[i].registrationNumber + '</span><br/><span class="userdetails">' +jsonResult.vehicle.result[i].uniqueId + '</span></li>';
         }
        
          $resultDiv.find('ul').empty().prepend(str);
          var lengthResults = jsonResult.vehicle.result.length +jsonResult.driver.result.length;
          var resultString = " result";
          if(lengthResults === 0){
        	  lengthResults = "No ";
          }
          if(lengthResults > 1){
        	  resultString+="s";
          }
          $resultDiv.find('div#search-footer').text(lengthResults + resultString+  " found");
          $resultDiv.find('ul li').first().addClass('selected');
      }); 

        $resultDiv.find('ul li').on('mouseover', null, function(e){
        current_index = $resultDiv.find('ul li').index(this);
        $options = $resultDiv.find('.option');
        change_selection($options,current_index);
      });
      }
      // Change selected element style by adding a css class
      function change_selection($options,current_index){
        $options.removeClass('selected');
        $options.eq(current_index).addClass('selected');
        }
    }
    else{
      //Hide the results if there is no search input
      $resultDiv.hide();
    }
  });    

  // Hide the search result when clicked outside
  jQuery(document).on("click", null, function(e) { 
    var $clicked = $(e.target);
    if ($clicked.hasClass("searchi") || $clicked.hasClass("searchf")){
    }
    else{
      $resultDiv.fadeOut(); 
    }
  });

  // Show previous search results when the search box is clicked
  $searchInput.click(function(){
    var q=$(this).val();
    if(q != '')
    { 
      $resultDiv.fadeIn();
    }
  });

  // Select the element when it is clicked
  $resultDiv.find('li').on("click", null, function(e){ 
    var id = $(this).attr('id');
    var name = ($(this).find('.name').text());
    $searchInput.val(name);
  });

  };
})(jQuery);
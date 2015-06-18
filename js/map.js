// dom ready
$(function() {

  // add base map
  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'osm'})
      })
    ],
    view: new ol.View({
      center: ol.proj.transform([8.047190 ,52.279562] , 'EPSG:4326', 'EPSG:3857'),
      zoom: 13
    })
  });
    
  $(".map, #contextMenu").bind("contextmenu",function(e){
    return false;
  });

  var $contextMenu = $("#contextMenu");
  
  $("#map").mousedown(function(e) {
  	if (e.which == 3){
	    $contextMenu.css({
	      display: "block",
	      left: e.pageX,
	      top: e.pageY
	    });
	    if (document.addEventListener) {
    			document.addEventListener('contextmenu', function(e) {
       				e.preventDefault();
    			}, false);
			} else {
    			document.attachEvent('oncontextmenu', function() {
       				window.event.returnValue = false;
    			});
			}	
      return false;
    }
  });
 
  
  $contextMenu.on("click", "a", function() {
     $contextMenu.hide();
  });

});
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




  /* edit features */
  var featureOverlay = new ol.FeatureOverlay({
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33'
        })
      })
    })
  });
  featureOverlay.setMap(map);

  var modify = new ol.interaction.Modify({
    features: featureOverlay.getFeatures(),
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function(event) {
      return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
    }
  });
  map.addInteraction(modify);

  var draw; // global so we can remove it later
  function addInteraction() {
    draw = new ol.interaction.Draw({
      features: featureOverlay.getFeatures(),
      type: /** @type {ol.geom.GeometryType} */ (typeSelect.value)
    });
    map.addInteraction(draw);
  }

  // click listener
  $("#edit").click(function() {
    $(this).parent().toggleClass("active");


    return false;
  });

});
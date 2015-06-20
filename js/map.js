// dom ready
$(function() {

  // format used to parse WFS GetFeature responses
  var geojsonFormat = new ol.format.GeoJSON();

  var roadsSource = new ol.source.Vector({
    format: geojsonFormat,
    loader: function(extent, resolution, projection) {
      var url = 'http://vm372.rz.uni-osnabrueck.de:8080/geoserver/webmapping_webgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webmapping_webgis:roads&' +
                'outputFormat=text/javascript&format_options=callback:loadRoadFeatures' +
                '&srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
      // use jsonp: false to prevent jQuery from adding the "callback"
      // parameter to the URL
     $.ajax({url: url, dataType: 'jsonp', jsonp: false});
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
      maxZoom: 19
    }))
  });

  window.loadRoadFeatures = function(response) {
    roadsSource.addFeatures(geojsonFormat.readFeatures(response));
  };  

  var railwaysSource = new ol.source.Vector({
    format: geojsonFormat,
    loader: function(extent, resolution, projection) {
      var url = 'http://vm372.rz.uni-osnabrueck.de:8080/geoserver/webmapping_webgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webmapping_webgis:railways&' +
                'outputFormat=text/javascript&format_options=callback:loadRailwaysFeatures' +
                '&srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
      // use jsonp: false to prevent jQuery from adding the "callback"
      // parameter to the URL
      $.ajax({url: url, dataType: 'jsonp', jsonp: false});
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
      maxZoom: 19
    }))
  });

  window.loadRailwaysFeatures = function(response) {
    railwaysSource.addFeatures(geojsonFormat.readFeatures(response));
  };


  var buildingsSource = new ol.source.Vector({
    format: geojsonFormat,
    loader: function(extent, resolution, projection) {
      var url = 'http://vm372.rz.uni-osnabrueck.de:8080/geoserver/webmapping_webgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webmapping_webgis:buildings&' +
                'outputFormat=text/javascript&format_options=callback:loadBuildingsFeatures' +
                '&srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
      // use jsonp: false to prevent jQuery from adding the "callback"
      // parameter to the URL
      $.ajax({url: url, dataType: 'jsonp', jsonp: false});
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
      maxZoom: 19
    }))
  });

  window.loadBuildingsFeatures = function(response) {
    buildingsSource.addFeatures(geojsonFormat.readFeatures(response));
  };  
  

  // add base map
  var map = new ol.Map({
    target: 'map',
    interactions: ol.interaction.defaults(),
    layers: [
	    new ol.layer.Group({
	    	'title': 'Base maps',
	    	layers: [
		      new ol.layer.Tile({
		      	title: 'OSM',
		        type: 'base',
		        visible: true,
		        source: new ol.source.MapQuest({layer: 'osm'})
		      })
             ]
         }),
         new ol.layer.Group({
                title: 'Overlays',
                layers: [
                	new ol.layer.Vector({
						title: 'Roads',
						visible: false,
					  	source: roadsSource,
					  	style: new ol.style.Style({
					    stroke: new ol.style.Stroke({
					      color: 'rgba(0, 0, 255, 1.0)',
					      width: 0.5
					    })
					  })
					}),
					new ol.layer.Vector({
						title: 'Railways',
						visible: false,
					  	source: railwaysSource,
					  	style: new ol.style.Style({
					    stroke: new ol.style.Stroke({
					      color: 'rgba(0, 255, 0, 1.0)',
					      width: 0.5
					    })
					  })
					}),
					new ol.layer.Vector({
						title: 'Buildings',
						visible: false,
					  	source: buildingsSource,
					  	style: new ol.style.Style({
					    stroke: new ol.style.Stroke({
					      color: 'rgba(255, 0 , 0, 1.0)',
					      width: 0.5
					    })
					  })
					})
				]
              })  
                
	    ],
    view: new ol.View({
      center: ol.proj.transform([8.047190 ,52.279562] , 'EPSG:4326', 'EPSG:3857'),
      zoom: 13
    })
  });
  
  var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Legende' // Optional label for button
  });
  map.addControl(layerSwitcher);
  

  // register context menu
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
  var select = new ol.interaction.Select();

  var modify = new ol.interaction.Modify({
    features: select.getFeatures(),
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function(event) {
      return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
    }
  });
  map.addInteraction(select);
  map.addInteraction(modify);


  // click listener
  $("#edit").click(function() {
    $(this).parent().toggleClass("active");
    $(".edit").fadeToggle(120);

    return false;
  });

});
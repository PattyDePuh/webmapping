$(document).ready(function(){
  $(".routenplaner").click(function(){
    $(".planer").toggle("slow");
    });
});


var startMarker = 0;
var zielMarker = 0;

var startSetzen = function(){
	contrvar = 1;		
}

var startMarkerSetzen = function(){
	console.log("start: "+ lonStart + ", " + latStart);
	startMarker = 1;		
}

var zielSetzen = function(){
	contrvar = 2;
}

var zielMarkerSetzen = function(){
	console.log("ziel: "+ lonZiel + ", " + latZiel);
	zielMarker = 1;
}

var routeV;

//Route abfragen und darstellen
var routeAbfragen = function(){
	if(startMarker ==1 && zielMarker ==1){
		//starte abfrage:
	var urlRoute = "http://openls.geog.uni-heidelberg.de/testing2015/route?Start=" + lonStart + "," + latStart + "&End=" + lonZiel + "," + latZiel + "&Via=&lang=de&distunit=KM&routepref=Fastest&avoidAreas=&useTMC=false&noMotorways=false&noTollways=false&instructions=false";
	alert("Die Route wird berechnet.");
	console.log("Abfage: " + urlRoute);
			
			routeV = new ol.layer.Vector({
			  source: new ol.source.Vector({
				format: new ol.format.GML(),
				url: urlRoute
			  }),
			  style: new ol.style.Style({
				symbolizers: [
				  new ol.style.Fill({
					color: '#ffffff',
					opacity: 0.25,
					strokeWidth: 4 
				  }),
				  new ol.style.Stroke({
					color: '#6666ff'
				  })
				]
			  })
			});
		console.log(routeV);
	}
	else {
		alert("Sie müssen vorher den Start- und Endpunkt ihrer Route festlegen.");
	}	
}

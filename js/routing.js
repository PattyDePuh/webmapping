$(document).ready(function(){
  $(".routenplaner").click(function(){
    $(".planer").toggle("slow");
    });
});

var startSetzen = function(){
	contrvar = 1;
	alert(contrvar);			
}

var startMarkerSetzen = function(){
	alert("start: "+ lon + ", " + lat);
	
}

var zielSetzen = function(){
	contrvar = 2;
	alert(contrvar);
}

var zielMarkerSetzen = function(){
	alert("ziel: "+ lon + ", " + lat);
}

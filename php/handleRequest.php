<?php

//Sanity-Check
if(!isset($_POST["service"])){
    echo ( "Error: Parameter 'service' wurde nicht angegeben!");
    return;
}
if(!isset($_POST["osm_id"])){
    echo ( "Error: Parameter 'osm_id' wurde nicht angegeben!");
    return;
}
if(!isset($_POST["geometry"]) && $_POST["service"] == "update"){
    echo ( "Error: Parameter 'geometry' wurde nicht angegeben!");
    return;
}
if(count($_POST["geometry"]) != count($_POST["osm_id"]) && $_POST["service"] == "update"){
    echo ( "Error: Array-Laenge von 'geometry' und 'osm_id' muss gleich sein!");
    return;
}

//Datenbankverbindung
$db_connection = pg_connect("host=vm372.rz.uni-osnabrueck.de port=5432 user=student password=lagestudent dbname=webmapping_webgis") or die("nicht funktioniert");
if(!isset($db_connection)){
    echo ("Error: Verbindung zur Datenbank fehlgeschlagen.");
	return;
}

//Wahl der Methode
switch($_POST["service"]){
    
    //Aendern der Geomtrie
    case "update":
        for($index = 0; $index < count($_POST["osm_id"]); $index++){
        	//Sanity-Check
        	if(!is_numeric($_POST["osm_id"][$index])){
        		echo("Error: '".$_POST["osm_id"][$index]."' ist keine gueltige OSM_ID (keine Zahl!)");
        		return;
        	}
        	//Hier muss noch ein Test rein, um SQL-Injection zu verhindern!!!
        	//
        	
        	//Query Aufbau
            $query = "UPDATE buildings SET geom = st_geomfromtext('".$_POST["geometry"][$index]."', 4326) WHERE osm_id = ".$_POST["osm_id"][$index];
            $result = pg_query($db_connection, $query);
            if(!$result){
                echo ("Error: Fehler beim Ausfuehren der Query: '".$query."' !");
                return;
            }
        }
        break;
    
    //Loeschen des Features
    case "delete":
        for($index = 0; $index < count($_POST["osm_id"]); $index++){
        	//Sanity-Check
        	if(!is_numeric($_POST["osm_id"][$index])){
        		echo("Error: '".$_POST["osm_id"][$index]."' ist keine gueltige OSM_ID (keine Zahl!)");
        		return;
        	}
        	//Query Aufbau
            $query = "UPDATE buildings WHERE osm_id = ".$_POST["osm_id"][$index];
            $result = pg_query($db_connection, $query);
            if(!$result){
                echo ("Error: Fehler beim Ausfuehren der Query: '".$query."' !");
                return;
            }
        }
        break;
    
    //Fehler, falls falsche Angabe beim Service.
    default;
    echo ("Error: Parameter 'service' bestitzt entweder den Wert 'update' oder 'delete' !");
    return;
}

echo ("success!");
?>

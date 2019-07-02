<?php
    session_start();
    
    $smallestDistance = 1000;
    $closestParkingLotLat = 0;
    $closestParkingLotLong = 0;
    $string = file_get_contents("Municipal_Parking_Lots.json");
    $someArray = json_decode($string, true);
    $arrayOfParking = [];
    for($i = 0; $i < count($someArray); $i++){
        $arrayOfParking[$i] = [
            'location' => $someArray[$i]["properties"]["LOCATION"],
            'address'  => $someArray[$i]["properties"]["ADDRESS"],
            'long' => $someArray[$i]["geometry"]["coordinates"][0][0][0],
            'lat' => $someArray[$i]["geometry"]["coordinates"][0][0][1],
			
        ];
    }

    if(isset($_REQUEST["request"]) == true && $_REQUEST["request"] == "all"){
        echo json_encode($arrayOfParking);
    }






    
    if(isset($_REQUEST["lat"]) == true && isset($_REQUEST["long"]) == true){
        $lat = $_REQUEST["lat"];
        $long = $_REQUEST["long"];
        
        for($i = 0; $i < count($arrayOfParking); $i++){
            $latt = $arrayOfParking[$i]['lat'];
            $deltaLong = $arrayOfParking[$i]['long'] - $long;
            $deltaLat = $arrayOfParking[$i]['lat'] - $lat;
            $distance = pow($deltaLat,2) + pow($deltaLong,2);
            if($smallestDistance > $distance)
                {
                    $smallestDistance = $distance;
                    $closestParkingLotLat = $arrayOfParking[$i]['lat'];
                    $closestParkingLotLong = $arrayOfParking[$i]['long'];
                    $location = $arrayOfParking[$i]['location'];
                    $address = $arrayOfParking[$i]['address'];
                }
        }
        $arrayOfNearestPeaking = [
            "Lat" => $closestParkingLotLat,
            "Long" => $closestParkingLotLong,
            "location" => $location,
            "address" => $address
        ];
        echo json_encode($arrayOfNearestPeaking);
        
    }
    
	   
?>
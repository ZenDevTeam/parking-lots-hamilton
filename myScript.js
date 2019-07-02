var map;
var infobox;
var currentLat;		// Latitude of user's location
var currentLng;		// Longtitude of user's location

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(43.2400641, -79.889414)

    });
    searchSuggestion();
}

function showAll() {
    $.get(
        "parkinglots.php",
        {
            "request": "all"
        },
        function (response) {
            deletePushpin();
           
            response = JSON.parse(response);
            console.log(response);
            for (let index = 0; index < response.length; index++) {
                infoboxCreate(response[index].lat, response[index].long);
                pushpinCreate(response[index]);
            }
        }
    );
}

function pushpinCreate(recsElement) {
    loc = new Microsoft.Maps.Location(recsElement.lat, recsElement.long);
    pushpin = new Microsoft.Maps.Pushpin(loc, null);
    pushpin.metadata = {
        title: recsElement.location,
        description: recsElement.address
    }
    map.entities.push(pushpin);
    Microsoft.Maps.Events.addHandler(pushpin, 'click', onClickPushpin);
}


function infoboxCreate(lat, long) {
    var location = new Microsoft.Maps.Location(lat, long);
    infobox = new Microsoft.Maps.Infobox(location, {
        visible: false
    });
    infobox.setMap(map);
}

function onClickPushpin(e) {
    if (e.target.metadata) {
        //Set the infobox options with the metadata of the pushpin.
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.metadata.title,
            description: "<p>" + e.target.metadata.description + "</p>",
            actions: [{
                label: 'Get Restaurant', eventHandler: function () {
                    getRestaurants(e.target.geometry.y, e.target.geometry.x);
                }
            }],
            visible: true
        });
    }
}


function deletePushpin() {
    for (var i = map.entities.getLength() - 1; i >= 0; i--) {
        var pushpin = map.entities.get(i);
        if (pushpin instanceof Microsoft.Maps.Pushpin) {
            map.entities.removeAt(i);
        }
    }

}

$(document).ready(function () {
    $("#showAll").click(function (event) {
        showAll();
    });
    $("#searchParking").click(function (event) {
        getUserLocation();
    });
    $("#userParking").click(function (event) {
        getUserLocation();
    });
    $("#goBack").click(function (event) {
        $("#showAll").css("display", "");
        $("#searchParking").css("display", "");
        $("#help").css("display", "");
        $("#goBack").css("display", "none");
        $("#listRestaurant").css("display", "none");
        $("#printoutPanel").css("display", "none");
        deletePushpin();
    });
    openForm();
    closeForm();
});

function getRestaurants(parkingLotsLat, parkinglotsLong) {
    $.get(
        "https://csunix.mohawkcollege.ca/tooltime/10133/2019/api/api.php?",

        {
            "lat": parkingLotsLat,
            "long": parkinglotsLong,
        },

        function (response) {
            listOfRestaurant = {};
            result = JSON.parse(response);

            for (var i = 0; i < 5; i++) {
                listOfRestaurant[i] = {
                    'location': result.businesses[i]["name"],
                    'lat': result.businesses[i]["coordinates"]["latitude"],
                    'long': result.businesses[i]["coordinates"]["longitude"],
                    'address': result.businesses[i]["location"]["address1"]

                }
                createARestaurant(result.businesses[i]["image_url"], result.businesses[i]["name"], result.businesses[i]["location"]["address1"], result.businesses[i]["display_phone"], result.businesses[i]["rating"], result.businesses[i]["review_count"]);

            }
            deletePushpin();
            console.log(listOfRestaurant);

            var userPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(
                currentLat, currentLng));

            userPin.metadata = {
                title: 'Current Location',
                description: ' '
            }
            Microsoft.Maps.Events.addHandler(userPin, 'click', onClickPushpin);

            map.entities.push(userPin);

            infoboxCreate(currentLat, currentLng);

            //Center the map on the user's location.
            map.setView({
                center: new Microsoft.Maps.Location(
                    currentLat, currentLng)
            });

            for (var i = 0; i < 5; i++) {
                pushpinCreate(listOfRestaurant[i]);
                infoboxCreate(listOfRestaurant[i]['lat'], listOfRestaurant[i]['lat']);
            }




        }
    )
}

function getUserLocation() {
    navigator.geolocation.getCurrentPosition(function (position) {
        var loc = new Microsoft.Maps.Location(
            currentLat = position.coords.latitude,
            currentLng = position.coords.longitude);
        console.log(currentLat, currentLng);
        //Add a pushpin at the user's location.

        getDirection(currentLat, currentLng);

    });
}

function searchSuggestion() {
    navigator.geolocation.getCurrentPosition(function (position) {
        var loc = new Microsoft.Maps.Location(
            currentLat = position.coords.latitude,
            currentLng = position.coords.longitude);

        //Add a pushpin at the user's location.



        Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
            var options = {
                maxResults: 6,
                map: map,
                autoDetectLocation: true,
                userLocation: Microsoft.Maps.Location(currentLat, currentLng)
            };
            var manager = new Microsoft.Maps.AutosuggestManager(options);
            manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectedSuggestion);
        });
    });
}






function selectedSuggestion(suggestionResult) {
    getDirection(suggestionResult.location.latitude, suggestionResult.location.longitude)

    map.setView({ bounds: suggestionResult.bestView });
    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location);
    console.log(suggestionResult);

    map.entities.push(pushpin);
}


function setDirection(currentLat, currentLng, parkingLotsLat, parkinglotsLong, location, address) {
    deletePushpin();
    $("#printoutPanel").css("display", "block");
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        // Set Route Mode to driving
        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });
        var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: 'Your Position', location: new Microsoft.Maps.Location(currentLat, currentLng) });
        var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: 'Parking', location: new Microsoft.Maps.Location(parkingLotsLat, parkinglotsLong) });
        directionsManager.addWaypoint(waypoint1);
        directionsManager.addWaypoint(waypoint2);
        // Set the element in which the itinerary will be rendered
        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') });
        directionsManager.showInputPanel('directionsInputContainer');
        directionsManager.calculateDirections();

    });
    $("#printoutPanel").css("display", "block");
    $("#showAll").css("display", "none");
    $("#searchParking").css("display", "none");
    $("#help").css("display", "none");
    $("#goBack").css("display", "block");


    // userPin
    var userPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(
        currentLat, currentLng));

    userPin.metadata = {
        title: 'Current Location',
        description: ' '
    }
    Microsoft.Maps.Events.addHandler(userPin, 'click', onClickPushpin);

    map.entities.push(userPin);

    infoboxCreate(currentLat, currentLng);

    //Center the map on the user's location.
    map.setView({
        center: new Microsoft.Maps.Location(
            currentLat, currentLng)
    });



    // Nearest Parking lot
    var parkingPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(
        parkingLotsLat, parkinglotsLong));

    parkingPin.metadata = {
        title: location,
        description: address
    }
    Microsoft.Maps.Events.addHandler(parkingPin, 'click', onClickPushpin);

    map.entities.push(parkingPin);

    infoboxCreate(parkingLotsLat, parkinglotsLong);

}

// Receive user's location and set a direction
function getDirection(currentLat, currentLng) {

    $.get(
        "parkinglots.php",
        {
            "lat": currentLat,
            "long": currentLng
        },
        function (data) {
            data = JSON.parse(data);

            setDirection(currentLat, currentLng, data.Lat, data.Long, data.location, data.address);

        }
    );

}

function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}



function createARestaurant(image, name, address, phone, rating, review) {
    $("#showAll").css("display", "none");
    $("#searchParking").css("display", "none");
    $("#help").css("display", "none");
    $("#goBack").css("display", "block");
    var data = '<div class="media">';
    data += '<div class="media-left" >' + `<img src="${image}" class="media-object" style="height:80px;width:100px;"">`;
    data += '</div>';
    data += '<div class="media-body" >';
    data += `<h6 class="media-heading" style="font-weight:bold;">${name}</h6>`;
    data += `<p>${address}<br>${phone}<br>`;
    data += `<img src="yelp_stars/web_and_ios/small/small_${rating}.png "> ${review} Reviews`
    data += '</p>';
    data += '</div>';
    data += '</div>';
    $("#listRestaurant").append(data);
}

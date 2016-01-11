function initMap() {
    function appViewModel() {
        var self = this;
        var map;
        var markersArray = [];
        var infowindow;
        var address;
        var Indianapolis = new google.maps.LatLng(39.7799642, -86.272836);
        self.allPlaces = ko.observableArray([]);
        self.filter = ko.observable();
        self.foursquareInfo = '';
        var lat = '';
        var lng = '';
        function mapOptions() {
            var latAndLng = map.getCenter();
            var lat = latAndLng.lat();
            var lng = latAndLng.lng();
        }
        // initialize  google map with center options
        function initialize() {
            map = new google.maps.Map(document.getElementById('map-canvas'), {
                    center: Indianapolis,
                    zoom: 12
                })
                // alert the user when the map are not  loaded
            var timer = window.setTimeout(failedToLoad, 5000);
            google.maps.event.addListener(map, 'tilesloaded', function () {
                window.clearTimeout(timer);
            });

            function failedToLoad() {
                alert('google map not loaded');
            }
            getPlaces();
            mapOptions();
            var list = (document.getElementById('list'));
            map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(list);
        }
        //  get  around  20 locations in google place  to show in google nav
        function getPlaces() {
            var request = {
                location: Indianapolis,
                radius: 900,
                types: ['store']
            };
            infowindow = new google.maps.InfoWindow();
            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);
        }
        //Callback from google map .
        function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                bounds = new google.maps.LatLngBounds();
                results.forEach(function (place) {
                    place.marker = createMarker(place);
                    bounds.extend(new google.maps.LatLng(
                        place.geometry.location.lat(),
                        place.geometry.location.lng()));
                });
                map.fitBounds(bounds);
                results.forEach(getAllPlaces);
            }
        }
        // create the marker
        function createMarker(place) {
            var marker = new google.maps.Marker({
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                name: place.name.toLowerCase(),
                position: place.geometry.location,
                animation: google.maps.Animation.DROP,
                place_id: place.place_id
            });
            google.maps.event.addListener(marker, 'click', toggleBounce, (function (marker) {
                return function () {
                    self.clickMarkerLocation(marker);
                    setTimeout(function () {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                    }, 2000);
                };
            })(marker));
            markersArray.push(marker);
            return marker;
        }
        //  click  element for the nav list  and  point of infowindow.
        self.clickMarkerLocation = function (place) {
            var marker;
            var selectedMarker = null;
            for (var e = 0, len = markersArray.length; e < len; e++) {
                if (place.place_id === markersArray[e].place_id) {
                    marker = markersArray[e];
                    break;
                }
            }
            map.panTo(marker.position);
            self.getFoursquareInfo(place);
            //Set time for foursquare to load
            setTimeout(function () {
                var contentString = '<b>' + place.name + '</b>' + self.foursquareInfo;
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    marker.setAnimation(null)
                }, 3000);
            }, 300);
        };
        //filter   the search in the nav list
        self.visiblePlaces = ko.computed(function () {
            return self.allPlaces().filter(function (place) {
                if (!self.filter() || place.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1)
                    return place;
            });
        }, self);
        //fouersquare credencial to get request
        var client_id = 'RGMJKQL042AOOBTOXDFEFHZ2HXVFW53TCEMXZYYUWAN3BOQ4';
        var client_secret = '5C4ZIV324IMZPDGCAUFBWARI01YJMRJGOZ2F45FBUOAEIZKC';
        this.getFoursquareInfo = function (selector) {
            var key = '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=' + '20140626';
            var URL = 'https://api.foursquare.com/v2/venues/search?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20150321' + '&ll=' +
                39.7799642 + ',' + -86.272836 + '&query=\'' + selector.name + '\'&limit=1';
            // append fsquare formated address to nfoview
            $.getJSON(URL)
                .done(function (response) {
                    var venue = response.response.venues[0];
                    var venueName = venue.name;
                    var faddress = venue.location.formattedAddress;
                    self.foursquareInfo = '<p>Foursquare  address:</p>' + venueName + '<br>' + faddress;
                    infowindow.setContent()
                }).error(function (e) // error handler
                    {
                        self.foursquareInfo = ('Unable to load foursquare');
                    });
        };
        // set the animaton marker
        function toggleBounce() {
            if (marker.getAnimation() != null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
        //  Get the information of all places  and push to myplace
        function getAllPlaces(place) {
            var myPlace = {};
            myPlace.place_id = place.place_id;
            myPlace.position = place.geometry.location.toString();
            myPlace.name = place.name;
            myPlace.address = address;
            self.allPlaces.push(myPlace);
        }
        google.maps.event.addDomListener(window, 'load', initialize);
    }
    $(function () {
        ko.applyBindings(new appViewModel());
    });
}
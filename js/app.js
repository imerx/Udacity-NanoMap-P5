function appViewModel() {
 var self = this;
 var map;
 var markersArray = [];
 var infowindow;
 var address;
 var Indianapolis = new google.maps.LatLng(39.7799642, -86.272836);
 self.allPlaces = ko.observableArray([]);
 self.filter = ko.observable();

 function mapOptions() {
  var latAndLng = map.getCenter();
  var lat = latAndLng.lat();
  var lng = latAndLng.lng();
 }
 // initialize  google map with center options

 function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: Indianapolis,
    zoom: 16
   })

   // alert the user when the map are not  loaded

  var timer = window.setTimeout(failedToLoad, 5000);
  google.maps.event.addListener(map, 'tilesloaded', function() {
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
   results.forEach(function(place) {
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
   icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
   name: place.name.toLowerCase(),
   position: place.geometry.location,
   place_id: place.place_id
  });

  var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>';
  google.maps.event.addListener(marker, 'click', function() {
   infowindow.setContent(contentString);
   infowindow.open(map, this);
   map.panTo(marker.position);
   marker.setAnimation(google.maps.Animation.BOUNCE);
   setTimeout(function() {
    marker.setAnimation(null);
   }, 1450);
  });

  markersArray.push(marker);
  return marker;

 }

 //  click  element for the nav list  and  point of infowindow.

 self.clickMarkerLocation = function(place) {
  var marker;

  for (var e = 0; e < markersArray.length; e++) {
   if (place.place_id === markersArray[e].place_id) {
    marker = markersArray[e];
    break;
   }
  }
  map.panTo(marker.position);

  setTimeout(function() {
   var contentString = '<div style="font-weight: bold">' + place.name; + '</div>';
   infowindow.setContent(contentString);
   infowindow.open(map, marker);
   marker.setAnimation(google.maps.Animation.DROP);
  }, 300);
 };

 //filter   the search in the nav list

 self.visiblePlaces = ko.computed(function() {
  return self.allPlaces().filter(function(place) {
   if (!self.filter() || place.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1)
    return place;
  });
 }, self);

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

$(function() {
 ko.applyBindings(new appViewModel());
});
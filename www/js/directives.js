angular.module('directiveModules', [])
	.directive('googleMap', function(){
		return {
			restrict: 'E',
			transclude:true,
			template:'<div class="map"></div>',
			scope:{
				loaded:'=',
				lat:'=',
				lng:'='
			},

			link: function(tScope, tElement, tAttrs){

				tScope.$watch('loaded',function(nValue, oValue){
					if(nValue == true){
						var postLat = typeof(tScope.lat)=='undefined'?0: parseFloat(tScope.lat);
						var postLng = typeof(tScope.lng)== 'undefined'?0: parseFloat(tScope.lng);
						var latLong = {lat: postLat, lng: postLng};

						var map = new google.maps.Map(tElement.children()[0], {
											    center: latLong,
											    zoom: 12,
											    mapTypeId: google.maps.MapTypeId.ROADMAP
											  });

						var marker = new google.maps.Marker({
							          position: latLong,
							          map: map
							        });
						/* google.maps.event.addListener(marker, 'click', function() {
					          infowindow.open(map,marker);
					        });


						var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
				        var compiled = $compile(contentString)($scope);

				        var infowindow = new google.maps.InfoWindow({
				          content: compiled[0]
				        });*/

					}
				})
			}
		}
	})
	.directive('tabView', function(){
		return {
				restrict:'A',
        require: 'ngModel',
        scope: { modelValue: '=ngModel' },  // modelValue for $watch
        link:function(scope, element, attr, ngModel){

            // Links collection
            var links=element.find('a');
            // Add click listeners
            links.on('click',function(e){
                e.preventDefault();
                ngModel.$setViewValue( angular.element(this).attr('href') );
                scope.$apply();
            })

            // State handling (set active) on model change
            scope.$watch('modelValue',function(){
              for(var i=0,l=links.length;i<l;++i){
                var link = angular.element(links[i]);
                link.attr('href') === scope.modelValue ?
                link.addClass('active') : link.removeClass('active')
              }
            })
        }
			}
	})
	.directive('googleMapPlaces', function(){
		return {
			restrict: 'E',
			transclude:true,
			template:'<div class="map"></div>',
			scope:{
				place: '=',
				loaded: '=',
			},

			link: function(tScope, tElement, tAttrs){

				tScope.$watch('loaded', function(nValue, oValue){
					if(nValue == true){
						var latLong = {lat: 0, lng: 0};

						var map = new google.maps.Map(tElement.children()[0], {
											    center: latLong,
											    zoom: 8,
											    mapTypeId: google.maps.MapTypeId.ROADMAP
											  });

						 // Create the search box and link it to the UI element.
						var input = document.getElementById('pac-input');
						var searchBox = new google.maps.places.SearchBox(input);
						input.placeholder = '3133 W Walnut Dr....';
						//map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

						// Bias the SearchBox results towards current map's viewport.
						map.addListener('bounds_changed', function() {
						searchBox.setBounds(map.getBounds());
						});

						var markers = [];
						// Listen for the event fired when the user selects a prediction and retrieve
						// more details for that place.
						searchBox.addListener('places_changed', function() {
							var places = searchBox.getPlaces();

							if (places.length == 0) {
							  return;
							}

							// Clear out the old markers.
							markers.forEach(function(marker) {
							  marker.setMap(null);
							});
							markers = [];

							var place = places[0];

							// For each place, get the icon, name and location.
							var bounds = new google.maps.LatLngBounds();

							  var icon = {
							    url: place.icon, /*http address*/
							    size: new google.maps.Size(100, 71),
							    origin: new google.maps.Point(0, 0),
							    anchor: new google.maps.Point(17, 34),
							    scaledSize: new google.maps.Size(25, 25)
							  };

							  // Create a marker for each place.
							  markers.push(new google.maps.Marker({
							    map: map,
							    icon: icon,
							    title: place.name, //name is street Name
							    position: place.geometry.location
							  }));

							  if (place.geometry.viewport) {
							    // Only geocodes have viewport.
							    bounds.union(place.geometry.viewport);
							  } else {
							    bounds.extend(place.geometry.location);
							  }

							map.fitBounds(bounds);
							tScope.$apply(function(){
								tScope.place = place;
								console.log(place);
							})

						});

					}
				})

				}
			}
		})

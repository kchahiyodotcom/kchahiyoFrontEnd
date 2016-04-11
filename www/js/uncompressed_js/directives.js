angular.module('directiveModules', [])
	.directive('googleMap', function(){
		return {
			restrict: 'E',
			transclude:true,
			template:'<div class="map top-banner"></div>',
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
	                ngModel.$setViewValue(angular.element(this).attr('href'));
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

	.directive('profileTabs', function(){
		return {
			restrict: 'A',
			link: function(tScope, tElement, tAttrs){

				var links = tElement.find('a');

				links.on('click', function(e){
	                e.preventDefault();
					for(var i = 0; i < links.length; i++){
						angular.element(links[i]).removeClass('active');
					}
					angular.element(this).addClass('active');

				})
			}
		}
	})

	.directive('pacContainer',function(){
		return{
			restrict: 'A',
			link: function(tScope, tElement, tAttrs){
				console.log(tElement);
			}
		}
	})
	.directive('googleMapPlaces', function(){
		return {
			restrict: 'E',
			transclude:true,
			template:'<div class="map top-banner"></div>',
			scope:{
				place: '=',
				loaded: '=',
			},

			link: function(tScope, tElement, tAttrs){

				tScope.$watch('loaded', function(nValue, oValue){
					if(nValue == true){
						
						var map = new google.maps.Map(
												tElement.children()[0], {
											    center: {
																		lat: 40,
																		lng: -90
																	},
											    zoom: 8,
											    mapTypeId: google.maps.MapTypeId.ROADMAP
											  });

						var markers = [];
						// Listen for the event fired when the user selects a prediction and retrieve
						// more details for that place.
					/*	searchBox.addListener('places_changed', function() {*/
					tScope.$watch('place', function(newValue, oldValue){

							markers.forEach(function(marker) {
							  marker.setMap(null);
							});

							markers = [];

							var place = newValue;
							// For each place, get the icon, name and location.
							var bounds = new google.maps.LatLngBounds();

							  var icon = {
							    url: 'http://www.clipartbest.com/cliparts/9Tp/eMz/9TpeMzyrc.png',
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

						});

					}
				})

				}
			}
		})

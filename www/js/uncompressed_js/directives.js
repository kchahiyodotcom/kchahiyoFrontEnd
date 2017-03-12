angular.module('directiveModules', [])
.directive('tabMenu',[function(){
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
	}])
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
											    zoom: 18,
													mapTypeControl: true,
													fullscreenControl: true,
													disableDefaultUI: true,
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
				});
			}
		};
	})
	.directive('tabView', function(){
		return {
			restrict:'A',
	        require: 'ngModel',
	        scope: { modelValue: '=ngModel' },  // modelValue for $watch
					controller: function(){

					},
	        link:function(scope, element, attr, ngModel){

	            // Links collection
	            var links=element.find('a');
	            // Add click listeners
	            links.on('click',function(e){
	                e.preventDefault();
	                ngModel.$setViewValue(angular.element(this).attr('href'));
	                scope.$apply();
	            });
	            // State handling (set active) on model change
	            scope.$watch('modelValue',function(){
	              for(var i=0,l=links.length;i<l;++i){
	                var link = angular.element(links[i]);
	                link.attr('href') === scope.modelValue ? link.addClass('active') : link.removeClass('active');
	              }
	            });
        	}
		};
	})
	.directive('activeTabHighlightFeature', function(){
		return {
			restrict: 'A',
			link: function(tScope, tElement, tAttrs){

				var links = tElement.find('a');

				links.on('click', function(e){
					for(var i = 0; i < links.length; i++){
						angular.element(links[i]).removeClass('active');
					}
					angular.element(this).addClass('active');

				});
			}
		};
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

				});
			}
		};
	})
	.directive('pacContainer',function(){
		return{
			restrict: 'A',
			link: function(tScope, tElement, tAttrs){
				console.log(tElement);
			}
		};
	})
	.directive('googleMapPlacesWorkingPerfectly', function(configs){
		/*display the place*/
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
					console.log(configs.country());
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
						console.log("in google places");
						console.log(newValue  + " " + oldValue); //find out why they are nulll at night before sleeping
						if(newValue != undefined){
							markers.forEach(function(marker) {
							  marker.setMap(null);
							});

							markers = [];
							//console.log(newValue);

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
							    title: 'place',// place.name, //name is street Name
							    position: place.geometry.location
							  }));

							  if (place.geometry.viewport) {
							    // Only geocodes have viewport.
							    bounds.union(place.geometry.viewport);
							  } else {
							    bounds.extend(place.geometry.location);
							  }

							map.fitBounds(bounds);
							}
						});

					}
				});

				}
			};
		})
	.directive('googleMapPlaces', function(configs, $ionicPlatform){
			/*display the place*/
			return {
				restrict: 'E',
				transclude:true,
				template:'<input id="pac-input" class="controls" type="text" placeholder="Enter a location"/><div id="map" class="top-banner"></div>',
				scope:{
					place: '=',
					loaded: '=',
				},

				link: function(tScope, tElement, tAttrs){
					var input = /** @type {!HTMLInputElement} */(
					            document.getElementById('pac-input'));
											var map = new google.maps.Map(document.getElementById('map'), {
												          center: {lat: -33.8688, lng: 151.2195},
												          zoom: 13
												        });
											map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

											var autocomplete = new google.maps.places.Autocomplete(input);
											autocomplete.bindTo('bounds', map);

											autocomplete.addListener('place_changed', function() {
							          infowindow.close();
							          marker.setVisible(false);
							          var place = autocomplete.getPlace();
							          if (!place.geometry) {
							            // User entered the name of a Place that was not suggested and
							            // pressed the Enter key, or the Place Details request failed.
							            window.alert("No details available for input: '" + place.name + "'");
							            return;
							          }

							          // If the place has a geometry, then present it on a map.
							          if (place.geometry.viewport) {
							            map.fitBounds(place.geometry.viewport);
							          } else {
							            map.setCenter(place.geometry.location);
							            map.setZoom(17);  // Why 17? Because it looks good.
							          }
							          marker.setIcon(/** @type {google.maps.Icon} */({
							            url: place.icon,
							            size: new google.maps.Size(71, 71),
							            origin: new google.maps.Point(0, 0),
							            anchor: new google.maps.Point(17, 34),
							            scaledSize: new google.maps.Size(35, 35)
							          }));
							          marker.setPosition(place.geometry.location);
							          marker.setVisible(true);

							          var address = '';
							          if (place.address_components) {
							            address = [
							              (place.address_components[0] && place.address_components[0].short_name || ''),
							              (place.address_components[1] && place.address_components[1].short_name || ''),
							              (place.address_components[2] && place.address_components[2].short_name || '')
							            ].join(' ');
							          }

							          infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
							          infowindow.open(map, marker);
						        });


				}}
			})
	.directive('imageSlider3d', function(){
		  return {
				controller:function($scope){
					$scope.countrySelected = function(country){
							$scope.$emit("countrySelected", country);
					}
				},
		    template:'<div class="swiper-container">'+
		                  '<div class="swiper-wrapper" >'+
		                  '<img class="swiper-slide" ng-click="countrySelected(\'Australia\')" src="img/country_flags/australia_flag.jpg"/>'+
		                  '<img class="swiper-slide" ng-click="countrySelected(\'Nepal\')" src="img/country_flags/nepal_flag.jpg"/>'+
		                  '<img class="swiper-slide" ng-click="countrySelected(\'UK\')" src="img/country_flags/uk_flag.png"/>'+
		                  '<img class="swiper-slide" ng-click="countrySelected(\'USA\')" src="img/country_flags/usa_flag.jpg"/>'+
	                  '</div>'+
	                  '<!--div class="swiper-pagination"></div-->'+
	                  '<div class="swiper-button-next"></div>'+
	                  '<div class="swiper-button-prev"></div>'+
	              '</div>',
		    link: function(tScope, tElement, tAttrs){
		      var swiper = new Swiper('.swiper-container', {
		        pagination: '.swiper-pagination',
		        effect: 'coverflow',
		        grabCursor: true,
		        centeredSlides: true,
		        slidesPerView: 'auto',
		        nextButton: '.swiper-button-next',
		        prevButton: '.swiper-button-prev',
		        coverflow: {
		            rotate: -70,
		            stretch: 0,
		            depth: 900,
		            modifier: 1,
		            slideShadows : true
		        }
		    });
		    tElement.append(swiper[0]);
		    }
		  }
		})
	.directive('ionSlider',['$ionicModal','ionGalleryData','$ionicPlatform','$timeout','$ionicScrollDelegate',
				function ionSlider($ionicModal,ionGalleryData,$ionicPlatform,$timeout,$ionicScrollDelegate){

		    controller.$inject = ["$scope"];
		    return {
		      restrict: 'A',
		      controller: controller,
		      link : link
		    };

		    function controller($scope){
		      var lastSlideIndex;
		      var currentImage;

		      var rowSize = ionGalleryData.getRowSize();
		      var zoomStart = false;

		      $scope.selectedSlide = 1;
		      $scope.hideAll = false;

		      $scope.showImage = function(index) {
		        $scope.slides = [];

		        currentImage = index;

		        var galleryLength = ionGalleryData.getGalleryLength();
		        var previndex = index - 1 < 0 ? galleryLength - 1 : index - 1;
		        var nextindex = index + 1 >= galleryLength ? 0 : index + 1;

		        $scope.slides[0] = $scope.ionGalleryItems[previndex];
		        $scope.slides[1] = $scope.ionGalleryItems[index];
		        $scope.slides[2] = $scope.ionGalleryItems[nextindex];

		        console.log( 'loadSingles: ' + previndex + ' ' + index + ' ' + nextindex);

		        lastSlideIndex = 1;
		        $scope.loadModal();
		      };

		      $scope.compartirImg = function(){
		            var src = $scope.ionGalleryItems[currentImage].src;
		            alert(src);
		      };
		      $scope.slideChanged = function(currentSlideIndex) {

		        if(currentSlideIndex === lastSlideIndex){
		          return;
		        }

		        var slideToLoad = $scope.slides.length - lastSlideIndex - currentSlideIndex;
		        var galleryLength = ionGalleryData.getGalleryLength();
		        var imageToLoad;
		        var slidePosition = lastSlideIndex + '>' + currentSlideIndex;

		        console.log( 'loadSingles: ' + slidePosition);

		        if(slidePosition === '0>1' || slidePosition === '1>2' || slidePosition === '2>0'){
		          currentImage++;
		          imageToLoad = currentImage + 1;
		        }
		        else if(slidePosition === '0>2' || slidePosition === '1>0' || slidePosition === '2>1'){
		          currentImage--;
		          imageToLoad = currentImage - 1;
		        }

		        if( currentImage < 0 ){
		          currentImage = galleryLength - 1;
		        }

		        if( currentImage >= galleryLength ){
		          currentImage = 0;
		        }

		        if( imageToLoad < 0 ){
		          imageToLoad = galleryLength + imageToLoad;
		        }

		        if( imageToLoad >= galleryLength ){
		          imageToLoad = imageToLoad - galleryLength;
		        }

		        //Clear zoom
		        $ionicScrollDelegate.$getByHandle('slide-' + slideToLoad).zoomTo(1);

		        $scope.slides[slideToLoad] = $scope.ionGalleryItems[imageToLoad];

		        lastSlideIndex = currentSlideIndex;
		      };

		      $scope.$on('ZoomStarted', function(e){
		        $timeout(function () {
		          zoomStart = true;
		          $scope.hideAll = true;
		        });

		      });

		      $scope.$on('ZoomOriginal', function(e){
		        $timeout(function () {
		          _isOriginalSize();
		        },300);

		      });

		      $scope.$on('TapEvent', function(e){
		        $timeout(function () {
		          _onTap();
		        });

		      });

		      $scope.$on('DoubleTapEvent', function(event,position){
		        $timeout(function () {
		          _onDoubleTap(position);
		        });

		      });

		      var _onTap = function _onTap(){

		        if(zoomStart === true){
		          $ionicScrollDelegate.$getByHandle('slide-'+lastSlideIndex).zoomTo(1,true);

		          $timeout(function () {
		            _isOriginalSize();
		          },300);

		          return;
		        }

		        if(($scope.hasOwnProperty('ionSliderToggle') && $scope.ionSliderToggle === false && $scope.hideAll === false) || zoomStart === true){
		          return;
		        }

		        $scope.hideAll = !$scope.hideAll;
		      };

		      var _onDoubleTap = function _onDoubleTap(position){
		        if(zoomStart === false){
		          $ionicScrollDelegate.$getByHandle('slide-'+lastSlideIndex).zoomTo(3,true,position.x,position.y);
		          zoomStart = true;
		          $scope.hideAll = true;
		        }
		        else{
		          _onTap();
		        }
		      };

		      function _isOriginalSize(){
		        zoomStart = false;
		        _onTap();
		      }

		    }

		    function link(scope, element, attrs) {
		      var _modal;

		      scope.loadModal = function(){
		        $ionicModal.fromTemplateUrl('slider.html', {
		          scope: scope,
		          animation: 'fade-in'
		        }).then(function(modal) {
		          _modal = modal;
		          scope.openModal();
		        });
		      };

		      scope.openModal = function() {
		        _modal.show();
		      };

		      scope.closeModal = function() {
		        _modal.hide();
		      };

		      scope.$on('$destroy', function() {
		        try{
		          _modal.remove();
		        } catch(err) {
		          console.log(err.message);
		        }
		      });
		    }
		  }])

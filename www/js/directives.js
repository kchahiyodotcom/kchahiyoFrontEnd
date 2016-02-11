angular.module('directiveModules', [])
	.directive('googleMap', function(){
		return {
			restrict: 'E',
			template:'<div id="map">hola</div>',
			scope:{
				lat:'=',
				lon:'='
			},
			link: function(tScope, tElement, tAttrs){
					var map = new google.maps.Map(tElement.children()[0], {
										    center: {lat: -34.397, lng: 150.644},
										    zoom: 8,
										    mapTypeId: google.maps.MapTypeId.ROADMAP
										  });
				}
			}
		})
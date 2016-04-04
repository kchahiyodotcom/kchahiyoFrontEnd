var textFilterModule = angular.module('filterModule', [])
	.filter('capitalizeFirstLetter', function(){
		return function(input){
			var fullSentence = '';
				if(input != undefined && input != ''){
					var words = input.split(' ');
					words.forEach(function(word){
						fullSentence = fullSentence + word[0].toUpperCase() + word.substring(1) + ' ';
					})
				}
			return fullSentence;
		}
	})
	.filter('squeezeString', function(){
		return function(input, length){
			input = input || '';

			if(input != undefined & input.length > length)
				return input.substring(0,length) +'...';
			return input;
		}
	})
	.filter('addNewLine', function(){
		return function(input){
			console.log(input);
			return input.replace(/(<br\ ?\/?>)+/g,'\n');
		}
	})
	.filter('nl2br', function(){
		return function(input){
			if(typeof(input) == 'undefined')
				return
			return input.replace(/\n/g, '<br />');
		}
	})
	.filter('parseIntoImages', function(){
		return function(input){
			var images = input.split(',');
			return images;
		}
	})
	.filter('trustedUrl', ['$sce' , function($sce){
		return function(input){
			return $sce.trustAsResourceUrl(input);
		}
	}])

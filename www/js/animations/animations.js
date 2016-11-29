angular.module('kchahiyoAnimation', [])
.animation('.fadeInAnimation', [function() {
  return {
    // make note that other events (like addClass/removeClass)
    // have different function input parameters
    enter: function(element, doneFn) {
      jQuery(element).hide().fadeIn(800, doneFn);
      // remember to call doneFn so that angular
      // knows that the animation has concluded
    },
    move: function(element, doneFn) {
      jQuery(element).fadeIn(350, doneFn);
    },

    leave: function(element, doneFn) {
      jQuery(element).fadeOut(350, doneFn);
    }
  }
}])

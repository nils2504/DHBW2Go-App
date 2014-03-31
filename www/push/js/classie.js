/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

window.classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

})( window );

var menuLeft = document.getElementById( 'cbp-spmenu-s1' ),
showLeftPush = document.getElementById( 'showLeftPush' ),
hideLeftPush = document.getElementById( 'hideLeftPush' ),
body = document.body;

showLeftPush.onclick = function() {
classie.toggle( this, 'active' );
classie.toggle( body, 'cbp-spmenu-push-toright' );
classie.toggle( menuLeft, 'cbp-spmenu-open' );
disableOther( 'showLeftPush' );
};
hideLeftPush.onclick = function() {
classie.remove( this, 'active' );
classie.remove( body, 'cbp-spmenu-push-toright' );
classie.remove( menuLeft, 'cbp-spmenu-open' );
};


function disableOther( button ) {
if( button !== 'showLeftPush' ) {
	classie.toggle( showLeftPush, 'disabled' );
}
}
var element = document.body;
var hammertime = Hammer(element).on("swiperight", function(event) {
classie.toggle( this, 'active' );
classie.toggle( body, 'cbp-spmenu-push-toright' );
classie.toggle( menuLeft, 'cbp-spmenu-open' );
});
var hammertime = Hammer(element).on("swipeleft", function(event) {
classie.remove( this, 'active' );
classie.remove( body, 'cbp-spmenu-push-toright' );
classie.remove( menuLeft, 'cbp-spmenu-open' );
});
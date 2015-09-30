/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
  app.headline='This is only a placeholder';
  app.firebaseurl = 'https://pwsbooking.firebaseio.com';
  var dbref = new Firebase(app.firebaseurl);
  //app.locations = [];
  app.dateFormat = 'dddd, Do MMM';
  app.dates = [
    moment().format(app.dateFormat),
    moment().add(1, 'd').format(app.dateFormat),
    moment().add(2, 'd').format(app.dateFormat),
    moment().add(3, 'd').format(app.dateFormat),
    moment().add(4, 'd').format(app.dateFormat),
    moment().add(5, 'd').format(app.dateFormat),
    moment().add(6, 'd').format(app.dateFormat),
    moment().add(7, 'd').format(app.dateFormat)
  ];
  app.times = ['7AM - 9AM','9AM - 1PM','3PM - 5PM','5PM - 7PM'];
  dbref.child('locations').on('value', function(snapshot){
    app.locations = snapshot.val();
  });

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!document.querySelector('platinum-sw-cache').disabled) {
      document.querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  app.addBooking = function() {
    console.log('thanks for your submission');
    console.log(this.$.addform.date);
    var booking = {
      name: this.$.publishername.value,
      date: this.$.date.selectedItem.textContent.trim(),
      time: this.$.time.selectedItem.textContent.trim(),
      location: this.$.location.selectedItem.textContent.trim(),
      email: this.$.email.value,
      approved: false,
      dateAdded: new Date()
    };

    var fqn_bookingid = dbref.child('bookings').push(booking, function(error) {
        if (error) {
          console.error('there was an error');
          console.error(error);
        } else {
          console.log('your data was saved with id: ' + fqn_bookingid);
          var bookingid = fqn_bookingid.toString().substring((app.firebaseurl+'/bookings/').length);
          page('booking-info/'+bookingid);
          app.scrollPageToTop();
        }
    });
  };

  app.editBooking = function() {
    console.log('bookingid: ' + this.$.bookingid.value);
    if (!this.$.bookingid.value) {
      console.error('could not find booking id');
      return;
    }
    var booking = {
      name: this.$.publishername.value,
      date: this.$.date.selectedItem.textContent.trim(),
      time: this.$.time.selectedItem.textContent.trim(),
      location: this.$.location.selectedItem.textContent.trim(),
      email: this.$.email.value,
      approved: false
    };

    dbref.child('bookings/'+this.$.bookingid.value).set(booking, function(error) {
        if (error) {
          console.error('there was an error');
          console.error(error);
        } else {
          console.log('your data was saved');
          page('/');
          app.scrollPageToTop();
        }
    });
  };

  app.getIndexOf = function(myArray, item) {
    if (!myArray) {
      return -1;
    }
    return myArray.indexOf(item);
  };

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('#mainToolbar .app-name');
    var middleContainer = document.querySelector('#mainToolbar .middle-container');
    var bottomContainer = document.querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onDataRouteClick = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    document.getElementById('mainContainer').scrollTop = 0;
  };

  app.isEditingBooking = function() {
    console.log(app.route);
    return app.route == 'edit';
  };
})(document);

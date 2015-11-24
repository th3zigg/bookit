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
  app.dateDigitFormat = 'YYYYMMDD';
  app.dates = [
    Number(moment().format(app.dateDigitFormat)),
    Number(moment().add(1, 'd').format(app.dateDigitFormat)),
    Number(moment().add(2, 'd').format(app.dateDigitFormat)),
    Number(moment().add(3, 'd').format(app.dateDigitFormat)),
    Number(moment().add(4, 'd').format(app.dateDigitFormat)),
    Number(moment().add(5, 'd').format(app.dateDigitFormat)),
    Number(moment().add(6, 'd').format(app.dateDigitFormat)),
    Number(moment().add(7, 'd').format(app.dateDigitFormat))
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
    //console.log(this.$.date);
    var booking = {
      name: document.querySelector('#publishername').value,
      date: app.formatDateAsNumber(document.querySelector('#date').selectedItem.textContent.trim()),
      time: document.querySelector('#time').selectedItem.textContent.trim(),
      location: document.querySelector('#location').selectedItem.textContent.trim(),
      email: document.querySelector('#email').value,
      approved: false,
      dateAdded: Date.now()
    };

    var fqn_bookingid = dbref.child('bookings').push(booking, function(error) {
        if (error) {
          console.error('there was an error');
          console.log(error);
          app.showBookingToastMessage('There was an error submitting your booking.  Please try again.');
        } else {
          console.log('your data was saved with id: ' + fqn_bookingid);
          try {
            app.showBookingToastMessage('Your booking has been submitted.');
          } catch (e) {
            console.log(e);
          }
          var bookingid = fqn_bookingid.toString().substring((app.firebaseurl+'/bookings/').length);
          page('/booking-info/'+bookingid);
          app.scrollPageToTop();
        }
    });
  };

  app.editBooking = function(input) {
    var bookingid = document.querySelector('#bookingid_edit') ? document.querySelector('#bookingid_edit').value : '';
    if (!bookingid) {
      console.log('no booking id found');
      app.showBookingToastMessage('There was a problem retrieving your booking.  Please try again.');
      return;
    }
    var booking = {
      name: document.querySelector('#publishername_edit').value,
      date: app.formatDateAsNumber(document.querySelector('#date_edit').selectedItem.textContent.trim()),
      time: document.querySelector('#time_edit').selectedItem.textContent.trim(),
      location: document.querySelector('#location_edit').selectedItem.textContent.trim(),
      email: document.querySelector('#email_edit').value,
      approved: false
    };
    console.log(booking);
    if (!app.isBookingEditableOrCancellable(booking)) {
      app.showBookingToastMessage('This booking cannot now be changed');
      return;
    }

    dbref.child('bookings/' + bookingid).set(booking, function(error) {
        if (error) {
          console.error('there was an error');
          console.log(error);
          app.showBookingToastMessage('There was a problem submitting your update. Please try again');
        } else {
          console.log('your data was saved');
          app.showBookingToastMessage('Your booking update has been submitted.');
          page('/booking-info/'+bookingid);
          app.scrollPageToTop();
        }
    });
  };

  app.isBookingEditableOrCancellable = function(booking) {
    var now = moment();
    try {
      var startTime = booking.time.split(" - ")[0];
      var bookingDateNum = Number(booking.date+'0000') + Number(moment(startTime, 'ha').format('HHmm'));
      //console.log('booking date: ' + bookingDateNum);
      var threeHrsFromNowNum = Number(now.add(3, 'h').format('YYYYMMDDHHmm'));
      //console.log('3 hours from now:' + threeHrsFromNowNum);

      return bookingDateNum >= threeHrsFromNowNum;
  
    } catch (e) {
      console.log(e);
    }
  };

  app.toggleBookingApproval = function(event) {
    //console.log('toogle approval');
    //console.log(event.target);
    if (event.target.icon) {
      var icon = event.target.icon;
      event.target.icon = icon === 'star' ? 'star-border' : 'star';
    }
  };

  app.getIndexOf = function(myArray, item) {
    if (!myArray) {
      console.log('no array or undefined array to get indexOf');
      return -1;
    }
    console.log('looking for index of ' + item);
    var indexInArray = myArray.indexOf(item);
    console.log('returning index in array: ' + indexInArray);
    //return myArray.indexOf(item);
    return indexInArray;
  };

  app.generateEditPath = function(bookingid) {
    return '/edit/' + bookingid;
  };

  app.formatDateForDisplay = function(dateAsNumber) {
    var todayDateFormatted = moment(dateAsNumber, app.dateDigitFormat).format(app.dateFormat);
    return todayDateFormatted;
  };

  app.formatDateAsNumber = function(dateStr) {
    try {
      var formattedDate = moment(dateStr, app.dateFormat).format(app.dateDigitFormat);
      return Number(formattedDate);
    } catch (e) {
      console.log('there was an error formatting dates: ' + e.message);
      console.error(e);
    }
  };

  app.showBookingToastMessage = function(message) {
    this.$['booking-toast'].text = message;
    this.$['booking-toast'].show();
  };

  app.authErrorHandler = function() {
    this.$['auth-error'].show();
  };

  app.getMailToLink = function(email) {
    return 'mailto:'+email;
  };

  app.isAdminRoute = function(route) {
    return route ? route.search('^admin') != -1 : false;
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
})(document);

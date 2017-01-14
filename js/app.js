var year = 2016;

var diaryApp = angular.module('diaryApp', ['ngRoute']);

diaryApp.directive('dayInMonth', function() {
  return {
    template: '<div class="day">{{day}}</div>',
    link: function ($scope, element, attrs) {
      if ($scope.isActive(attrs.month, attrs.day)) {
        element.find("div").addClass("activeDay");
        element.wrap("<a href='#/entry/on/"+attrs.month+"/"+attrs.day.toString()+"'></a>");
      } else {
        element.find("div").addClass("inactiveDay");
      }
    }
  };
});

diaryApp.factory('entries', function($http){
  return {
    list: function (callback){
      $http({
        method: 'GET',
        url: 'data/sampleEntries.json',
        cache: true
      }).then(callback);
    }
  };
});

diaryApp.config(function ($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
    .when('/', {
      templateUrl: 'html/calendar.html',
      controller: 'calendarCtrl'
    })
    .when('/entry/on/:month/:day', {
      templateUrl: 'html/entryLetter.html',
      controller: 'entryLetterCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});


diaryApp.controller('calendarCtrl', function ($scope, $http, entries) {
  $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $scope.weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  document.title = "Diary";
  document.onkeydown = function(evt) {};
  $scope.get

  entries.list( function(response) {
    $scope.entries = response.data;
    $scope.dayCount = 0;
  });

  $scope.daysInMonth = function(year, month) {
    var isLeap = ((year % 4) == 0 && ((year % 100) != 0 || (year % 400) == 0));
    return [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][$scope.months.indexOf(month)];
  };

  $scope.daysInLastMonth = function(month) {
    var index = $scope.months.indexOf(month);
    if (index === 0) {
      return $scope.daysInMonth(year - 1, 'December');
    };
    var lastMonth = $scope.months[index - 1];
    return $scope.daysInMonth(year, lastMonth);
  };

  $scope.numPreDays = function(month) {
    return new Date(month + " 1, " + year.toString() + " 12:00:00").getDay()-1;
  };

  $scope.numPostDays = function(month) {
    return 41 - $scope.numPreDays(month) - $scope.daysInMonth(year, month);
  };

  $scope.preDays = function(month) {
    var lastDay = $scope.daysInLastMonth(month);
    var array = [];
    for (i = 0; i < $scope.numPreDays(month)+1; i++) {
      array.unshift(lastDay.toString());
      lastDay -= 1;
    };
    return array;
  };

  $scope.postDays = function(month) {
    var array = [];
    var numPostDays = $scope.numPostDays(month)
    for (var i = 1; i <= numPostDays; i++) {
      array.push(i.toString());
    };
    return array;
  };

  $scope.daysIn = function(month) {
    var array = [];
    var numDays = $scope.daysInMonth(year, month)
    for (var i = 1; i <= numDays; i++) {
      array.push(i.toString());
    };
    return array;
  };

  $scope.isActive = function(month, day) {
    found = false;
    for (var i = $scope.dayCount; i < $scope.entries.length; i++) {
      if ($scope.entries[i].day == parseInt(day) && $scope.entries[i].month == $scope.months.indexOf(month)+1) {
        found = true;
        $scope.dayCount += 1;
        break;
      }
    }
    return found;
  };
});

diaryApp.controller('entryLetterCtrl', function ($scope, $routeParams, $location, entries) {
  $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $scope.month = $routeParams.month;
  $scope.day = $routeParams.day;

  entries.list( function(response) {
    $scope.entries = response.data;
    if (!$scope.isActive($scope.month, $scope.day)) {
      $location.path("");
      return;
    }
    $scope.prevLink = $scope.getPrevLink();
    $scope.nextLink = $scope.getNextLink();
    $scope.paragraphs = $scope.getParagraphs();
    $scope.date = $scope.getDate();
    document.onkeydown = function(evt) {
      evt = evt || window.event;
      switch (evt.keyCode) {
        case 37:
          window.location.href = $scope.getPrevLink();
          break;
        case 39:
          window.location.href = $scope.getNextLink();
          break;
        }
    };
  });

  $scope.daysInMonth = function(year, month) {
    var isLeap = ((year % 4) == 0 && ((year % 100) != 0 || (year % 400) == 0));
    return [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][$scope.months.indexOf(month)];
  };

  $scope.daysInLastMonth = function(month) {
    var index = $scope.months.indexOf(month);
    var lastMonth = $scope.months[index];
    if (lastMonth == 'December') {
      return $scope.daysInMonth(year - 1, lastMonth);
    };
    return $scope.daysInMonth(year, lastMonth);
  };

  $scope.daysIn = function(month) {
    var array = [];
    var numDays = $scope.daysInMonth(2016, month)
    for (var i = 1; i <= numDays; i++) {
      array.push(i.toString());
    };
    return array;
  };

  $scope.getPrevLink = function() {
    if ($scope.month == "January" && $scope.day == 1) {
      return "#/entry/on/December/31";
    }
    var baseLink = "#/entry/on/";
    var currDate = new Date($scope.month + " " + $scope.day + ", " + year.toString() + " 12:00:00");
    var nextDate = new Date(currDate.getTime() - (24 * 60 * 60 * 1000));
    while (!$scope.isActive($scope.months[nextDate.getMonth()], nextDate.getDate())) {
      nextDate = new Date(nextDate.getTime() - (24 * 60 * 60 * 1000));
    }
    return baseLink + $scope.months[nextDate.getMonth()] + "/" + nextDate.getDate().toString();
  };

  $scope.getNextLink = function() {
    if ($scope.month == "December" && $scope.day == 31) {
      return "#/entry/on/January/1";
    }
    var baseLink = "#/entry/on/";
    var currDate = new Date($scope.month + " " + $scope.day + ", " + year.toString() + " 12:00:00");
    var prevDate = new Date(currDate.getTime() + (24 * 60 * 60 * 1000));
    while (!$scope.isActive($scope.months[prevDate.getMonth()], prevDate.getDate())) {
      prevDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000));
    }
    return baseLink + $scope.months[prevDate.getMonth()] + "/" + prevDate.getDate().toString();
  };

  $scope.isActive = function(month, day) {
    foundMonth = false;
    for (var i = 0; i < $scope.months.length; i++) {
      console.log(month, $scope.months[i])
      if (month == $scope.months[i]) {
        foundMonth = true;
      }
    }
    console.log(foundMonth)
    if (!foundMonth) { 
      return false; 
    }
    found = false;
    for (var i = 0; i < $scope.entries.length; i++) {
      if ($scope.entries[i].day == parseInt(day) && $scope.entries[i].month == $scope.months.indexOf(month)+1) {
        found = true;
        break;
      }
    }
    return found;
  };

  $scope.getParagraphs = function() {
    for (var i = 0; i < $scope.entries.length; i++) {
      if ($scope.entries[i].day == parseInt($scope.day) && $scope.entries[i].month == $scope.months.indexOf($scope.month)+1) {
        return $scope.entries[i].paragraphs;
      }
    }
    return [];
  };

  $scope.getDate = function() {
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    var numWeekday = new Date($scope.month + " " + $scope.day + ", " + year.toString() + " 12:00:00").getDay();
    return weekdays[numWeekday] + ", " + $scope.month + " " + $scope.day + $scope.getSuffix() + ", " + year.toString() + "";
  };

  $scope.getSuffix = function() {
    var suffix;
    if ($scope.day == 1 || $scope.day == 21 || $scope.day == 31) {
      suffix = "st";
    } else if ($scope.day == 2 || $scope.day == 22) {
      suffix = "nd";
    } else if ($scope.day == 3 || $scope.day == 23) {
      suffix = "rd";
    } else {
      suffix = "th";
    } 
    return suffix;
  };

  document.title = "Diary - " + $scope.month + " " + $scope.day + $scope.getSuffix();
});

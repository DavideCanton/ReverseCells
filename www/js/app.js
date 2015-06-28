"use strict";

var app = angular.module('reverseApp', ['ionic', 'reverseApp.controllers',
    'reverseApp.services', 'reverseApp.filters', 'uiRouterStyles']);

app.run(function ($ionicPlatform, $rootScope, highscores)
{
    $ionicPlatform.ready(function ()
    {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard)
        {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar)
        {
            // org.apache.cordova.statusbar required
            window.StatusBar.styleLightContent();
        }
    });

    $rootScope.makeName = function (hs_field, diff, size)
    {
        return hs_field.name + "-" + diff.name + "-" + size.r + "x" + size.c;
    };

    $rootScope.HIGHSCORES_SIZE = 3;

    $rootScope.DIFFICULTIES = [
        {name: 'Easy', val: 0, ratio: 0.5},
        {name: 'Medium', val: 1, ratio: 1},
        {name: 'Hard', val: 2, ratio: 2}
    ];

    $rootScope.SIZES = [
        {r: 5, c: 5, id: 0},
        {r: 7, c: 7, id: 1},
        {r: 10, c: 10, id: 2}];

    $rootScope.HIGHSCORES = [{name: "current_time", order: "+"}];

    $rootScope.SIZES.forEach(function (size)
    {
        $rootScope.HIGHSCORES.forEach(function (el)
        {
            $rootScope.DIFFICULTIES.forEach(function (diff)
            {
                highscores.register($rootScope.makeName(el, diff, size), $rootScope.HIGHSCORES_SIZE, el.order);
            });
        });
    });
});

app.config(function ($stateProvider, $urlRouterProvider)
{
    $urlRouterProvider.otherwise('/main');

    $stateProvider
        .state('main', {
            url: '/main',
            templateUrl: 'templates/main.html',
            controller: 'mainController',
            data: {
                css: "css/main.css"
            }
        })
        .state('schema', {
            url: '/schema/:n/:s/:h',
            templateUrl: 'templates/schema.html',
            controller: 'reverseController',
            cache: false,
            data: {
                css: "css/schema.css"
            }
        })
        .state('choose_schema', {
            url: '/choose_schema',
            templateUrl: 'templates/choose_schema.html',
            controller: 'chooseController'
        })
        .state('highscores', {
            url: '/highscores',
            templateUrl: 'templates/highscores.html',
            controller: 'highscoresController',
            data: {
                css: "css/highscores.css"
            }
        }).state('howtoplay', {
            url: '/howtoplay',
            templateUrl: 'templates/howtoplay.html',
            controller: 'howtoplayController'
        });
});

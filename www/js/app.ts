///<reference path="typings/index.d.ts"/>

"use strict";
import IonicPlatformService = ionic.platform.IonicPlatformService;
import IStateProvider = ng.ui.IStateProvider;
import IUrlRouterProvider = ng.ui.IUrlRouterProvider;

var app = angular.module('reverseApp', ['ionic', 'reverseApp.controllers',
    'reverseApp.services', 'reverseApp.filters', 'uiRouterStyles']);


interface IDifficulty{
    name: string;
    ratio: number;
    val: number;
}

interface ISize {
    r: number;
    c: number;
    id: number;
}

interface  IHighScore {
    name: string;
    order: string;
}

app.run(($ionicPlatform: IonicPlatformService, $rootScope : any, highscores) =>
{
    $ionicPlatform.ready(() =>
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

    $rootScope.makeName = (hs_field: IHighScore, diff : IDifficulty, size : ISize) =>
    {
        return hs_field.name + "-" + diff.name + "-" + size.r + "x" + size.c;
    };

    $rootScope.HIGHSCORES_SIZE = 3;
    $rootScope.MAX_NAME_LENGTH = 8;


    $rootScope.DIFFICULTIES = <IDifficulty[]> [
        {name: 'Easy', ratio: 0.5},
        {name: 'Medium', ratio: 1},
        {name: 'Hard', ratio: 2}
    ];

    // automatic index add
    $rootScope.DIFFICULTIES.forEach((el : IDifficulty, i: number) =>
    {
        el.val = i;
    });

    $rootScope.SIZES = <ISize[]> [
        {r: 5, c: 5, id: 0},
        {r: 7, c: 7, id: 1},
        {r: 10, c: 10, id: 2}
    ];

    $rootScope.HIGHSCORES = <IHighScore[]> [{name: "current_time", order: "+"}];

    $rootScope.SIZES.forEach(size =>
    {
        $rootScope.HIGHSCORES.forEach(el =>
        {
            $rootScope.DIFFICULTIES.forEach(diff =>
            {
                highscores.register($rootScope.makeName(el, diff, size), $rootScope.HIGHSCORES_SIZE, el.order);
            });
        });
    });
});

app.config(($stateProvider : IStateProvider, $urlRouterProvider : IUrlRouterProvider) =>
{
    $urlRouterProvider.otherwise('/main');

    $stateProvider
        .state('main', {
            url: '/main',
            templateUrl: 'templates/main.html',
            controller: 'mainController as mainCtrl',
            data: {
                css: "css/main.css"
            }
        })
        .state('schema', {
            url: '/schema/:n/:s/:h',
            templateUrl: 'templates/schema.html',
            controller: 'reverseController as reverseCtrl',
            cache: false,
            data: {
                css: "css/schema.css"
            }
        })
        .state('choose_schema', {
            url: '/choose_schema',
            templateUrl: 'templates/choose_schema.html',
            controller: 'chooseController as chooseCtrl',
            data: {
                css: "css/choose_schema.css"
            }
        })
        .state('highscores', {
            url: '/highscores',
            templateUrl: 'templates/highscores.html',
            controller: 'highscoresController as highscoresCtrl',
            data: {
                css: "css/highscores.css"
            }
        }).state('howtoplay', {
            url: '/howtoplay',
            templateUrl: 'templates/howtoplay.html',
            controller: 'howtoplayController'
        });
});

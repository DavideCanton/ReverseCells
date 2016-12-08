///<reference path="typings/index.d.ts"/>
///<reference path="services.ts"/>
///<reference path="app.ts"/>

"use strict";
import IonicPopupService = ionic.popup.IonicPopupService;
import IStateService = ng.ui.IStateService;
import IScope = angular.IScope;

class RootController
{
    static $inject : string[] = ['$state', '$ionicPopup'];

    constructor(private $state : IStateService, private $ionicPopup : IonicPopupService)
    {

    }

    goTo(name : string)
    {
        this.$state.go(name);
    }

    tryGoTo(name : string)
    {
        this.$ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'You will return to the main page. Are you sure?'
        }).then(res =>
        {
            if (res)
                this.goTo(name);
        });
    }
}

class MainController
{
    static $inject : string[] = ["$localstorage"];

    constructor(private $localstorage : LocalStorageService)
    {
    }

    isContinueEnabled() : boolean
    {
        return this.$localstorage.isDefined("matrix");
    }
}

class ChooseController
{
    static $inject : string[] = ["$scope", "$state"];
    private cur : { size : ISize, level : IDifficulty };

    constructor(private $scope, private $state : IStateService)
    {
        this.cur = {size: $scope.SIZES[1], level: $scope.DIFFICULTIES[1]};
    }

    ok()
    {
        this.$state.go("schema", {
            s: this.cur.size.id,
            h: this.cur.level.val,
            n: 1
        }, {reload: true});
    }
}

class HighscoresController
{
    static $inject : string[] = ['$scope', 'highscores', '$state', '$ionicPlatform', '$ionicPopup'];
    private highscoresArray : IHighscoreMap;

    constructor(private $scope : any,
                private highscores : HighscoresService,
                private $state : IStateService,
                private $ionicPlatform : IonicPlatformService,
                private $ionicPopup : IonicPopupService)
    {
        this.highscoresArray = highscores.highscoresMap();

        $ionicPlatform.registerBackButtonAction(() =>
        {
            $state.go("main");
        }, 1000); // priority
    }

    isEmpty(h, d, s) : boolean
    {
        return this.vals(h, d, s).length === 0;
    }

    vals(h : IHighScore, d : IDifficulty, s : ISize) : IHighscoreVal[]
    {
        return this.highscores[this.$scope.makeName(h, d, s)].vals;
    }

    clearHighScores()
    {
        this.$ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'This will reset your highscores! Are you sure?'
        }).then(res =>
        {
            if (res)
                this.highscores.clear();
        });
    };
}

angular.module("reverseApp.controllers", [])
    .controller("rootController", RootController)

    .controller("mainController", MainController)

    .controller('chooseController', ChooseController)

    .controller("reverseController", ['$scope', '$stateParams', '$interval',
        'highscores', '$ionicPopup', '$localstorage', '$rootScope', '$ionicPlatform', '$ionicBackdrop',
        function ($scope, $stateParams, $interval, highscores, $ionicPopup,
                  $localstorage, $rootScope, $ionicPlatform, $ionicBackdrop)
        {
            $scope.matrix = null;
            $scope.size = $scope.SIZES[+$stateParams.s];
            $scope.completed = false;
            $scope.moves = 0;
            $scope.resets = 0;
            $scope.level = $scope.DIFFICULTIES[+$stateParams.h];
            $scope.current_time = 0;
            $scope.paused = false;
            $scope.newGame = +$stateParams.n;
            $scope.lastMove = null;

            function startTimer()
            {
                $scope.timer = $interval(function ()
                {
                    $scope.current_time++;
                    $scope.store("current_time");
                }, 1000);
            }

            function stopTimer()
            {
                $interval.cancel($scope.timer);
            }

            $rootScope.$on('$stateChangeStart', stopTimer);

            $ionicPlatform.on('resume', startTimer);

            $ionicPlatform.on('pause', stopTimer);

            $scope.undo = function ()
            {
                if ($scope.lastMove === null)
                    return;

                $scope.makeMove.apply(this, $scope.lastMove);
                $scope.store("matrix");
                $scope.lastMove = null;
            };

            $scope.pause = function ()
            {
                //$ionicBackdrop.retain();
                // $scope.paused = true;
            };

            $scope.resume = function ()
            {
                $scope.paused = false;
                $ionicBackdrop.release();
            };

            $scope.generate = function ()
            {
                $scope.moves = 0;
                $scope.resets = 0;
                $scope.matrix = $scope.generateMatrix();
                $scope.randomMatrix($scope.size.r * $scope.size.c * $scope.level.ratio);

                $scope.original = $scope.generateMatrix();
                for (var i = 0; i < $scope.size.r; i++)
                    $scope.original[i] = $scope.matrix[i].slice();

                $scope.completed = false;

                $scope.saveData();
            };

            $scope.store = function (name)
            {
                $localstorage.setObject(name, $scope[name]);
            };

            $scope.restore = function (name, def_value)
            {
                $scope[name] = $localstorage.getObject(name, def_value);
            };

            $scope.saveData = function ()
            {
                ["moves", "resets", "matrix", "original",
                    "completed", "level", "current_time", "size", "lastMove"].forEach(function (el)
                {
                    $scope.store(el);
                });
            };

            $scope.restoreData = function ()
            {
                $scope.restore("moves", 0);
                $scope.restore("resets", 0);
                $scope.restore("matrix", null);
                $scope.restore("original", null);
                $scope.restore("completed", false);
                $scope.restore("level", null);
                $scope.restore("current_time", 0);
                $scope.restore("size", null);
                $scope.restore("lastMove", null);
            };

            $scope.clearData = function ()
            {
                ["moves", "resets", "matrix", "original",
                    "completed", "level", "current_time", "size", "lastMove"].forEach(function (el)
                {
                    $localstorage.remove(el);
                });
            };

            $scope.refreshSchema = function ()
            {
                if ($scope.original && !$scope.completed)
                {
                    $scope.lastMove = null;
                    for (var i = 0; i < $scope.size.r; i++)
                        $scope.matrix[i] = $scope.original[i].slice();
                    $scope.moves = 0;
                    $scope.resets++;

                    $scope.store("moves");
                    $scope.store("resets");
                    $scope.store("matrix");
                }
            };

            $scope.doRefresh = function ()
            {
                $ionicPopup.confirm({
                    title: 'Are you sure?',
                    template: 'This will reset your progress! Are you sure?'
                }).then(function (res)
                {
                    if (res)
                        $scope.refreshSchema();
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };

            $scope.generateMatrix = function ()
            {
                var matrix = [];
                var row = [];
                for (var j = 0; j < $scope.size.c; j++)
                    row.push(false);
                for (var i = 0; i < $scope.size.r; i++)
                    matrix.push(row.slice(0));
                return matrix;
            };

            $scope.clicked = function (r, c)
            {
                if ($scope.completed)
                    return;

                $scope.moves++;
                $scope.makeMove(r, c);
                $scope.lastMove = [r, c];
                $scope.completed = $scope.check();

                $scope.store("moves");
                $scope.store("matrix");
                $scope.store("completed");
                $scope.store("lastMove");

                if ($scope.completed)
                {
                    $scope.lastMove = null;
                    $interval.cancel($scope.timer);
                    $scope.clearData();

                    var hs_name = $scope.makeName($scope.HIGHSCORES[0], $scope.level, $scope.size);
                    var timeRecord = highscores.isInHighscore(hs_name, $scope.current_time);

                    if (timeRecord)
                    {
                        $scope.data = {};

                        $ionicPopup.show({
                            title: 'Record!',
                            template: '<label>Enter your name:<input ng-model="data.name" type="text" placeholder="Your name" maxlength="' + $scope.MAX_NAME_LENGTH + '"></label>',
                            scope: $scope,
                            buttons: [
                                {
                                    text: 'Cancel',
                                    type: 'button-assertive'
                                },
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-positive',
                                    onTap: function ()
                                    {
                                        return $scope.data.name;
                                    }
                                }
                            ]
                        }).then(function (name)
                        {
                            if (!name)
                            {
                                $scope.goTo("main");
                            }
                            else
                            {
                                highscores.addToHighScore(hs_name, {
                                    name: name.substring(0, $scope.MAX_NAME_LENGTH),
                                    val: {time: $scope.current_time, moves: $scope.moves},
                                    key: $scope.current_time
                                });
                                $scope.goTo("highscores");
                            }
                        });
                    }
                }
            };

            $scope.makeMove = function (r, c)
            {
                for (var i = r - 1; i <= r + 1; i++)
                    for (var j = c - 1; j <= c + 1; j++)
                        if (i >= 0 && i < $scope.size.r && j >= 0 && j < $scope.size.c)
                            $scope.matrix[i][j] = !$scope.matrix[i][j];
            };

            $scope.check = function ()
            {
                return !_.some($scope.matrix, function (row)
                {
                    return _.some(row);
                });
            };

            $scope.randomMatrix = function (moves)
            {
                var ubound = $scope.size.r * $scope.size.c;

                for (var x = 0; x < moves; x++)
                {
                    var m = Math.floor(Math.random() * ubound);
                    var i = Math.floor(m / $scope.size.c);
                    var j = m % $scope.size.c;
                    $scope.makeMove(i, j);
                }
            };

            $scope.home = function ()
            {
                $scope.goTo("main");
            };

            if ($localstorage.isDefined("matrix") && !$scope.newGame)
                $scope.restoreData();
            else
                $scope.generate();
            startTimer();
        }])

    .controller('highscoresController', HighscoresController)

    .controller('howtoplayController', () =>
    {
        return {}
    });
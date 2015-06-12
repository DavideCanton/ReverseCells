"use strict";

angular.module("reverseApp.controllers", [])

    .controller("rootController", ['$scope', function ($scope)
    {

    }])

    .controller("mainController", ['$scope', '$state', '$localstorage',
        function ($scope, $state, $localstorage)
        {
            $scope.isContinueEnabled = function ()
            {
                return $localstorage.isDefined("matrix");
            };

            $scope.continueGame = function ()
            {
                $state.go("schema");
            };

            $scope.newGame = function ()
            {
                $state.go("choose_schema");
            };

            $scope.highscores = function ()
            {
                $state.go("highscores");
            };
        }])

    .controller('chooseController', ['$scope', '$state', function ($scope, $state)
    {
        $scope.cur = {size: $scope.SIZES[1], level: $scope.DIFFICULTIES[1]};

        $scope.cancel = function ()
        {
            $state.go("main");
        };

        $scope.ok = function ()
        {
            $state.go("schema", {
                s: $scope.cur.size.id,
                h: $scope.cur.level.val,
                n: 1
            }, {reload: true});
        };
    }])

    .controller("reverseController", ['$scope', '$stateParams', '$interval',
        'highscores', '$state', '$ionicPopup', '$localstorage', '$rootScope',
        function ($scope, $stateParams, $interval, highscores, $state, $ionicPopup,
                  $localstorage, $rootScope)
        {
            $scope.matrix = null;
            $scope.size = $scope.SIZES[+$stateParams.s];
            $scope.completed = false;
            $scope.moves = 0;
            $scope.resets = 0;
            $scope.level = $scope.DIFFICULTIES[+$stateParams.h];
            $scope.current_time = 0;
            $scope.newGame = +$stateParams.n;
            $scope.lastMove = null;

            $rootScope.$on('$stateChangeStart',
                function ()
                {
                    $interval.cancel($scope.timer);
                });

            $scope.undo = function ()
            {
                if ($scope.lastMove === null)
                    return;

                $scope.makeMove.apply(this, $scope.lastMove);
                $scope.store("matrix");
                $scope.lastMove = null;
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
                $scope.store("moves");
                $scope.store("resets");
                $scope.store("matrix");
                $scope.store("original");
                $scope.store("completed");
                $scope.store("level");
                $scope.store("current_time");
                $scope.store("size");
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
            };

            $scope.clearData = function ()
            {
                $localstorage.remove("moves");
                $localstorage.remove("resets");
                $localstorage.remove("matrix");
                $localstorage.remove("original");
                $localstorage.remove("completed");
                $localstorage.remove("level");
                $localstorage.remove("current_time");
                $localstorage.remove("size");
            };

            $scope.refreshSchema = function ()
            {
                if ($scope.original && !$scope.completed)
                {
                    $scope.lastMove = null;
                    for (var i = 0; i < $scope.size.r; i++)
                        for (var j = 0; j < $scope.size.c; j++)
                            $scope.matrix[i][j] = $scope.original[i][j];
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
                for (var i = 0; i < $scope.size.r; i++)
                {
                    var row = [];
                    for (var j = 0; j < $scope.size.c; j++)
                        row.push(false);
                    matrix.push(row);
                }
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

                if ($scope.completed)
                {
                    $scope.lastMove = null;
                    $interval.cancel($scope.timer);
                    $scope.clearData();

                    var hs_name = $scope.makeName($scope.HIGHSCORES[0], $scope.level, $scope.size);
                    var timeRecord = highscores.isInHighscore(hs_name, $scope.current_time);

                    if (timeRecord)
                    {
                        $ionicPopup.prompt({
                            title: 'Record!',
                            template: 'Enter your name:',
                            inputType: 'text',
                            inputPlaceholder: 'Your name'
                        }).then(function (name)
                        {
                            if (name.length > 0)
                            {
                                highscores.addToHighScore(hs_name, {
                                    name: name,
                                    val: {time: $scope.current_time, moves: $scope.moves},
                                    key: $scope.current_time
                                });
                            }
                            $state.go("highscores");
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
                function id(el)
                {
                    return el;
                }

                for (var i = 0; i < $scope.size.r; i++)
                    if ($scope.matrix[i].some(id))
                        return false;
                return true;
            };

            $scope.randomMatrix = function (moves)
            {
                for (var x = 0; x < moves; x++)
                {
                    var i = Math.floor(Math.random() * $scope.size.r);
                    var j = Math.floor(Math.random() * $scope.size.c);
                    $scope.makeMove(i, j);
                }
            };

            $scope.home = function ()
            {
                $state.go("main");
            };

            if ($localstorage.isDefined("matrix") && !$scope.newGame)
                $scope.restoreData();
            else
                $scope.generate();

            $scope.timer = $interval(function ()
            {
                $scope.current_time++;
                $scope.store("current_time");
            }, 1000);
        }])
    .controller('highscoresController', ['$scope', 'highscores', '$state', '$ionicPlatform',
        function ($scope, highscores, $state, $ionicPlatform)
        {
            $scope.highscores = highscores.highscores;

            $scope.home = function ()
            {
                $state.go("main");
            };

            $scope.isEmpty = function (h, d, s)
            {
                return $scope.vals(h, d, s).length === 0;
            };

            $scope.vals = function (h, d, s)
            {
                return $scope.highscores[$scope.makeName(h, d, s)].vals;
            };

            $scope.clearHighScores = function ()
            {
                highscores.clear();
            };

            $ionicPlatform.registerBackButtonAction(function ()
            {
                $state.go("main");
            }, 1000); // priority
        }]);
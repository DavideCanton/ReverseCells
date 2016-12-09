///<reference path="typings/index.d.ts"/>
///<reference path="services.ts"/>
///<reference path="app.ts"/>
"use strict";
var RootController = (function () {
    function RootController($state, $ionicPopup) {
        this.$state = $state;
        this.$ionicPopup = $ionicPopup;
    }
    RootController.prototype.goTo = function (name) {
        this.$state.go(name);
    };
    RootController.prototype.tryGoTo = function (name) {
        var _this = this;
        this.$ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'You will return to the main page. Are you sure?'
        }).then(function (res) {
            if (res)
                _this.goTo(name);
        });
    };
    RootController.$inject = ['$state', '$ionicPopup'];
    return RootController;
}());
var MainController = (function () {
    function MainController($localstorage) {
        this.$localstorage = $localstorage;
    }
    MainController.prototype.isContinueEnabled = function () {
        return this.$localstorage.isDefined("matrix");
    };
    MainController.$inject = ["$localstorage"];
    return MainController;
}());
var ChooseController = (function () {
    function ChooseController($scope, $state) {
        this.$scope = $scope;
        this.$state = $state;
        this.cur = { size: $scope.SIZES[1], level: $scope.DIFFICULTIES[1] };
    }
    ChooseController.prototype.ok = function () {
        this.$state.go("schema", {
            s: this.cur.size.id,
            h: this.cur.level.val,
            n: 1
        }, { reload: true });
    };
    ChooseController.$inject = ["$scope", "$state"];
    return ChooseController;
}());
var HighscoresController = (function () {
    function HighscoresController($scope, highscores, $state, $ionicPlatform, $ionicPopup) {
        this.$scope = $scope;
        this.highscores = highscores;
        this.$state = $state;
        this.$ionicPlatform = $ionicPlatform;
        this.$ionicPopup = $ionicPopup;
        this.highscoresArray = highscores.highscoresMap();
        $ionicPlatform.registerBackButtonAction(function () {
            $state.go("main");
        }, 1000); // priority
    }
    HighscoresController.prototype.isEmpty = function (h, d, s) {
        return this.vals(h, d, s).length === 0;
    };
    HighscoresController.prototype.vals = function (h, d, s) {
        return this.highscoresArray[this.$scope.makeName(h, d, s)].vals;
    };
    HighscoresController.prototype.clearHighScores = function () {
        var _this = this;
        this.$ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'This will reset your highscores! Are you sure?'
        }).then(function (res) {
            if (res)
                _this.highscores.clear();
        });
    };
    ;
    HighscoresController.$inject = ['$scope', 'highscores', '$state', '$ionicPlatform', '$ionicPopup'];
    return HighscoresController;
}());
var ReverseController = (function () {
    function ReverseController($scope, $stateParams, $interval, highscores, $ionicPopup, $localstorage, $rootScope, $state, $ionicPlatform, $ionicBackdrop) {
        var _this = this;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$interval = $interval;
        this.highscores = highscores;
        this.$ionicPopup = $ionicPopup;
        this.$localstorage = $localstorage;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$ionicPlatform = $ionicPlatform;
        this.$ionicBackdrop = $ionicBackdrop;
        this.completed = false;
        this.moves = 0;
        this.resets = 0;
        this.current_time = 0;
        this.paused = false;
        this.lastMove = null;
        this.max_name_length = 10;
        this.size = $scope.SIZES[parseInt($stateParams.s, 10)];
        this.level = $scope.DIFFICULTIES[parseInt($stateParams.h, 10)];
        this.newGame = !!parseInt($stateParams.n, 10);
        $rootScope.$on('$stateChangeStart', function () { return _this.stopTimer; });
        $ionicPlatform.on('resume', function () { return _this.startTimer; });
        $ionicPlatform.on('pause', function () { return _this.stopTimer; });
        if ($localstorage.isDefined("matrix") && !this.newGame)
            this.restoreData();
        else
            this.generate();
        this.startTimer();
    }
    ReverseController.prototype.startTimer = function () {
        var _this = this;
        this.timer = this.$interval(function () {
            _this.current_time++;
            _this.store("current_time");
        }, 1000);
    };
    ReverseController.prototype.stopTimer = function () {
        this.$interval.cancel(this.timer);
    };
    ReverseController.prototype.undo = function () {
        if (this.lastMove === null)
            return;
        this.makeMove.apply(this, this.lastMove);
        this.store("matrix");
        this.lastMove = null;
    };
    ReverseController.prototype.generate = function () {
        this.moves = 0;
        this.resets = 0;
        this.matrix = this.generateMatrix();
        this.randomMatrix(this.size.r * this.size.c * this.level.ratio);
        this.original = this.generateMatrix();
        for (var i = 0; i < this.size.r; i++)
            this.original[i] = this.matrix[i].slice();
        this.completed = false;
        this.saveData();
    };
    ReverseController.prototype.store = function (name) {
        this.$localstorage.setObject(name, this[name]);
    };
    ReverseController.prototype.restore = function (name, def_value) {
        this[name] = this.$localstorage.getObject(name, def_value);
    };
    ReverseController.prototype.saveData = function () {
        var _this = this;
        ["moves", "resets", "matrix", "original", "completed", "level", "current_time", "size", "lastMove"]
            .forEach(function (el) { return _this.store(el); });
    };
    ReverseController.prototype.restoreData = function () {
        this.restore("moves", 0);
        this.restore("resets", 0);
        this.restore("matrix", null);
        this.restore("original", null);
        this.restore("completed", false);
        this.restore("level", null);
        this.restore("current_time", 0);
        this.restore("size", null);
        this.restore("lastMove", null);
    };
    ReverseController.prototype.clearData = function () {
        var _this = this;
        ["moves", "resets", "matrix", "original", "completed", "level", "current_time", "size", "lastMove"]
            .forEach(function (el) { return _this.$localstorage.remove(el); });
    };
    ReverseController.prototype.refreshSchema = function () {
        if (this.original && !this.completed) {
            this.lastMove = null;
            for (var i = 0; i < this.size.r; i++)
                this.matrix[i] = this.original[i].slice();
            this.moves = 0;
            this.resets++;
            this.store("moves");
            this.store("resets");
            this.store("matrix");
        }
    };
    ReverseController.prototype.doRefresh = function () {
        var _this = this;
        this.$ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'This will reset your progress! Are you sure?'
        }).then(function (res) {
            if (res)
                _this.refreshSchema();
            _this.$scope.$broadcast('scroll.refreshComplete');
        });
    };
    ReverseController.prototype.generateMatrix = function () {
        var matrix = [];
        var row = [];
        for (var j = 0; j < this.size.c; j++)
            row.push(false);
        for (var i = 0; i < this.size.r; i++)
            matrix.push(row.slice(0));
        return matrix;
    };
    ReverseController.prototype.clicked = function (r, c) {
        var _this = this;
        if (this.completed)
            return;
        this.moves++;
        this.makeMove(r, c);
        this.lastMove = [r, c];
        this.completed = this.check();
        this.store("moves");
        this.store("matrix");
        this.store("completed");
        this.store("lastmove");
        if (this.completed) {
            this.lastMove = null;
            this.$interval.cancel(this.timer);
            this.clearData();
            var hs_name_1 = this.$scope.makeName(this.$scope.HIGHSCORES[0], this.level, this.size);
            var timerecord = this.highscores.isInHighscore(hs_name_1, this.current_time);
            if (timerecord) {
                var data_1 = this.$scope.data = {};
                this.$ionicPopup.show({
                    title: 'record!',
                    template: '<label>Enter your name:<input ng-model="data.name" type="text" placeholder="your name" maxlength="' + this.max_name_length + '"></label>',
                    scope: this.$scope,
                    buttons: [
                        {
                            text: 'Cancel',
                            type: 'button-assertive'
                        },
                        {
                            text: '<b>OK</b>',
                            type: 'button-positive',
                            onTap: function () { return data_1.name; }
                        }
                    ]
                }).then(function (name) {
                    delete _this.$scope.data;
                    if (!name)
                        _this.$state.go("main");
                    else {
                        _this.highscores.addToHighScore(hs_name_1, {
                            name: name.substring(0, _this.max_name_length),
                            val: { time: _this.current_time, moves: _this.moves },
                            key: _this.current_time
                        });
                        _this.$state.go("highscores");
                    }
                });
            }
        }
    };
    ReverseController.prototype.makeMove = function (r, c) {
        for (var i = r - 1; i <= r + 1; i++)
            for (var j = c - 1; j <= c + 1; j++)
                if (i >= 0 && i < this.size.r && j >= 0 && j < this.size.c)
                    this.matrix[i][j] = !this.matrix[i][j];
    };
    ReverseController.prototype.check = function () {
        return !_.some(this.matrix, function (row) { return _.some(row); });
    };
    ;
    ReverseController.prototype.randomMatrix = function (moves) {
        var ubound = this.size.r * this.size.c;
        for (var x = 0; x < moves; x++) {
            var m = Math.floor(Math.random() * ubound);
            var i = Math.floor(m / this.size.c);
            var j = m % this.size.c;
            this.makeMove(i, j);
        }
    };
    ReverseController.prototype.home = function () {
        this.$state.go("main");
    };
    ReverseController.$inject = ['$scope', '$stateParams', '$interval',
        'highscores', '$ionicPopup', '$localstorage', '$rootScope', '$state', '$ionicPlatform', '$ionicBackdrop'];
    return ReverseController;
}());
angular.module("reverseApp.controllers", [])
    .controller("rootController", RootController)
    .controller("mainController", MainController)
    .controller('chooseController', ChooseController)
    .controller("reverseController", ReverseController)
    .controller('highscoresController', HighscoresController)
    .controller('howtoplayController', function () {
    return {};
});
//# sourceMappingURL=controllers.js.map
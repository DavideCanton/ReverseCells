///<reference path="typings/index.d.ts"/>
///<reference path="services.ts"/>
///<reference path="app.ts"/>

"use strict";
import IonicPopupService = ionic.popup.IonicPopupService;
import IStateService = ng.ui.IStateService;
import IScope = angular.IScope;
import IStateParamsService = ng.ui.IStateParamsService;
import IIntervalService = angular.IIntervalService;
import IRootScopeService = angular.IRootScopeService;
import IonicBackdropService = ionic.backdrop.IonicBackdropService;
import IPromise = angular.IPromise;

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
        return this.highscoresArray[this.$scope.makeName(h, d, s)].vals;
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

interface IReverseStateParamsService extends IStateParamsService
{
    s : string;
    h : string;
    n : string;
}

class ReverseController
{
    static $inject : string[] = ['$scope', '$stateParams', '$interval',
        'highscores', '$ionicPopup', '$localstorage', '$rootScope', '$state', '$ionicPlatform', '$ionicBackdrop'];

    private matrix : boolean[][];
    private original : boolean[][];
    private size : ISize;
    private completed : boolean = false;
    private moves = 0;
    private resets = 0;
    private level : IDifficulty;
    private current_time = 0;
    private paused = false;
    private newGame : boolean;
    private lastMove : number[] = null;
    private timer : IPromise<any>;
    private max_name_length = 10;

    constructor(private $scope : any, private $stateParams : IReverseStateParamsService,
                private $interval : IIntervalService,
                private highscores : HighscoresService,
                private $ionicPopup : IonicPopupService,
                private $localstorage : LocalStorageService,
                private $rootScope : IRootScopeService,
                private $state : IStateService,
                private $ionicPlatform : IonicPlatformService,
                private $ionicBackdrop : IonicBackdropService)
    {
        this.size = $scope.SIZES[parseInt($stateParams.s, 10)];
        this.level = $scope.DIFFICULTIES[parseInt($stateParams.h, 10)];
        this.newGame = !!parseInt($stateParams.n, 10);

        $rootScope.$on('$stateChangeStart', () => this.stopTimer);

        $ionicPlatform.on('resume', () => this.startTimer);

        $ionicPlatform.on('pause', () => this.stopTimer);

        if ($localstorage.isDefined("matrix") && !this.newGame)
            this.restoreData();
        else
            this.generate();

        this.startTimer();
    }

    startTimer()
    {
        this.timer = this.$interval(() =>
        {
            this.current_time++;
            this.store("current_time");
        }, 1000);
    }

    stopTimer()
    {
        this.$interval.cancel(this.timer);
    }


    undo()
    {
        if (this.lastMove === null)
            return;

        this.makeMove.apply(this, this.lastMove);
        this.store("matrix");
        this.lastMove = null;
    }

    generate()
    {
        this.moves = 0;
        this.resets = 0;
        this.matrix = this.generateMatrix();
        this.randomMatrix(this.size.r * this.size.c * this.level.ratio);

        this.original = this.generateMatrix();
        for (var i = 0; i < this.size.r; i++)
            this.original[i] = this.matrix[i].slice();

        this.completed = false;

        this.saveData();
    }

    store(name : string)
    {
        this.$localstorage.setObject(name, this[name]);
    }

    restore(name : string, def_value : any)
    {
        this[name] = this.$localstorage.getObject(name, def_value);
    }

    saveData()
    {
        ["moves", "resets", "matrix", "original", "completed", "level", "current_time", "size", "lastMove"]
            .forEach(el => this.store(el));
    }

    restoreData()
    {
        this.restore("moves", 0);
        this.restore("resets", 0);
        this.restore("matrix", null);
        this.restore("original", null);
        this.restore("completed", false);
        this.restore("level", null);
        this.restore("current_time", 0);
        this.restore("size", null);
        this.restore("lastMove", null);
    }

    clearData()
    {
        ["moves", "resets", "matrix", "original", "completed", "level", "current_time", "size", "lastMove"]
            .forEach(el => this.$localstorage.remove(el));
    }


    refreshSchema()
    {
        if (this.original && !this.completed)
        {
            this.lastMove = null;
            for (let i = 0; i < this.size.r; i++)
                this.matrix[i] = this.original[i].slice();
            this.moves = 0;
            this.resets++;

            this.store("moves");
            this.store("resets");
            this.store("matrix");
        }
    }

    doRefresh()
    {
        this.$ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'This will reset your progress! Are you sure?'
        }).then(res =>
        {
            if (res)
                this.refreshSchema();
            this.$scope.$broadcast('scroll.refreshComplete');
        });
    }

    generateMatrix()
    {
        let matrix = [];
        let row = [];
        for (let j = 0; j < this.size.c; j++)
            row.push(false);
        for (let i = 0; i < this.size.r; i++)
            matrix.push(row.slice(0));
        return matrix;
    }

    clicked(r : number, c : number)
    {
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

        if (this.completed)
        {
            this.lastMove = null;
            this.$interval.cancel(this.timer);
            this.clearData();

            let hs_name = this.$scope.makeName(this.$scope.HIGHSCORES[0], this.level, this.size);
            let timerecord = this.highscores.isInHighscore(hs_name, this.current_time);

            if (timerecord)
            {
                let data = this.$scope.data = <IHighscoreVal>{};

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
                            onTap: () => data.name
                        }
                    ]
                }).then(name =>
                {
                    delete this.$scope.data;

                    if (!name)
                        this.$state.go("main");
                    else
                    {
                        this.highscores.addToHighScore(hs_name, {
                            name: name.substring(0, this.max_name_length),
                            val: <IHighscoreValObj> {time: this.current_time, moves: this.moves},
                            key: this.current_time
                        });
                        this.$state.go("highscores");
                    }
                });
            }
        }
    }

    makeMove(r : number, c : number)
    {
        for (var i = r - 1; i <= r + 1; i++)
            for (var j = c - 1; j <= c + 1; j++)
                if (i >= 0 && i < this.size.r && j >= 0 && j < this.size.c)
                    this.matrix[i][j] = !this.matrix[i][j];
    }

    check() : boolean
    {
        return !_.some(this.matrix, row => _.some(row));
    };

    randomMatrix(moves : number)
    {
        var ubound = this.size.r * this.size.c;

        for (var x = 0; x < moves; x++)
        {
            var m = Math.floor(Math.random() * ubound);
            var i = Math.floor(m / this.size.c);
            var j = m % this.size.c;
            this.makeMove(i, j);
        }
    }

    home()
    {
        this.$state.go("main");
    }


}

angular.module("reverseApp.controllers", [])
    .controller("rootController", RootController)

    .controller("mainController", MainController)

    .controller('chooseController', ChooseController)

    .controller("reverseController", ReverseController)

    .controller('highscoresController', HighscoresController)

    .controller('howtoplayController', () =>
    {
        return {}
    });
///<reference path="typings/index.d.ts"/>
"use strict";
var LocalStorageService = (function () {
    function LocalStorageService($window) {
        this.$window = $window;
    }
    LocalStorageService.prototype.set = function (key, value) {
        this.$window.localStorage[key] = value;
    };
    LocalStorageService.prototype.get = function (key, defaultValue) {
        return this.$window.localStorage[key] || defaultValue;
    };
    LocalStorageService.prototype.remove = function (key) {
        this.$window.localStorage.removeItem(key);
    };
    LocalStorageService.prototype.setObject = function (key, value) {
        this.$window.localStorage[key] = JSON.stringify(value);
    };
    LocalStorageService.prototype.getObject = function (key, defaultValue) {
        var val = this.$window.localStorage[key];
        if (val === undefined)
            return defaultValue;
        return JSON.parse(val);
    };
    LocalStorageService.prototype.isDefined = function (key) {
        return this.$window.localStorage[key] !== undefined;
    };
    return LocalStorageService;
}());
var HighscoresService = (function () {
    function HighscoresService($localstorage) {
        this.$localstorage = $localstorage;
        this.highscores = this.$localstorage.getObject("highscores", {});
    }
    HighscoresService.prototype.highscoresMap = function () {
        return this.highscores;
    };
    HighscoresService.prototype.register = function (name, size, sortCrit) {
        if (this.highscores[name] === undefined)
            this.highscores[name] = { vals: [], size: size, sortCrit: sortCrit };
        else
            this.highscores[name].size = size;
        this.$localstorage.setObject('highscores', this.highscores);
    };
    HighscoresService.prototype.isInHighscore = function (name, val) {
        var h = this.highscores[name];
        if (h.vals.length < h.size)
            return true;
        if (h.sortCrit == '+')
            return _.sortedIndexBy(h.vals, { key: val }, 'key') < h.size;
        else
            return h.vals.some(function (el) {
                return val > el.key;
            });
    };
    HighscoresService.prototype.addToHighScore = function (name, data) {
        var h = this.highscores[name];
        var index = h.vals.length;
        if (h.sortCrit == '+') {
            index = _.sortedIndexBy(h.vals, data, 'key');
        }
        else if (h.sortCrit == '-') {
            h.vals.some(function (el, i) {
                if (data.key > el.key) {
                    index = i;
                    return true;
                }
                return false;
            });
        }
        h.vals.splice(index, 0, data);
        if (h.vals.length > h.size)
            h.vals.splice(h.size, 1);
        this.$localstorage.setObject('highscores', this.highscores);
    };
    HighscoresService.prototype.clear = function () {
        for (var _i = 0, _a = Object.keys(this.highscores); _i < _a.length; _i++) {
            var key = _a[_i];
            this.highscores[key].vals = [];
        }
        this.$localstorage.setObject('highscores', this.highscores);
    };
    return HighscoresService;
}());
angular.module('reverseApp.services', [])
    .factory('$localstorage', ['$window', function ($window) {
        return new LocalStorageService($window);
    }])
    .factory('highscores', ['$localstorage', function ($localstorage) {
        return new HighscoresService($localstorage);
    }]);
//# sourceMappingURL=services.js.map
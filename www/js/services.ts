///<reference path="typings/index.d.ts"/>

"use strict";
import IWindowService = angular.IWindowService;

class LocalStorageService
{
    constructor(private $window : IWindowService)
    {
    }

    set<T>(key : string, value : T)
    {
        this.$window.localStorage[key] = value;
    }

    get<T>(key : string, defaultValue : T) : T
    {
        return this.$window.localStorage[key] || defaultValue;
    }

    remove(key : string)
    {
        this.$window.localStorage.removeItem(key);
    }

    setObject<T>(key : string, value : T)
    {
        this.$window.localStorage[key] = JSON.stringify(value);
    }

    getObject<T>(key : string, defaultValue : T) : T
    {
        let val = this.$window.localStorage[key];
        if (val === undefined)
            return defaultValue;
        return JSON.parse(val);
    }

    isDefined(key : string) : boolean
    {
        return this.$window.localStorage[key] !== undefined;
    }
}

interface IHighscoreVal
{
    name : string;
    val : IHighscoreValObj;
    key : number;
}

interface IHighscoreValObj
{
    time: number;
    moves: number;
}

interface IHighscoreOption
{
    vals : IHighscoreVal[];
    size : number;
    sortCrit : string;
}

interface IHighscoreMap
{
    [name : string] : IHighscoreOption;
}

class HighscoresService
{
    private highscores : IHighscoreMap;

    constructor(private $localstorage : LocalStorageService)
    {
        this.highscores = this.$localstorage.getObject("highscores", <IHighscoreMap> {});
    }

    highscoresMap() : IHighscoreMap
    {
        return this.highscores;
    }

    register(name : string, size : number, sortCrit : string)
    {
        if (this.highscores[name] === undefined)
            this.highscores[name] = {vals: [], size: size, sortCrit: sortCrit};
        else
            this.highscores[name].size = size;
        this.$localstorage.setObject('highscores', this.highscores);
    }

    isInHighscore(name : string, val : number) : boolean
    {
        let h = this.highscores[name];
        if (h.vals.length < h.size)
            return true;
        if (h.sortCrit == '+')
            return _.sortedIndexBy(h.vals, {key: val}, 'key') < h.size;
        else
            return h.vals.some(function (el)
            {
                return val > el.key;
            });
    }

    addToHighScore(name : string, data : IHighscoreVal)
    {
        let h = this.highscores[name];
        let index = h.vals.length;

        if (h.sortCrit == '+')
        {
            index = _.sortedIndexBy(h.vals, data, 'key');
        }
        else if (h.sortCrit == '-')
        {
            h.vals.some((el : IHighscoreVal, i : number) =>
            {
                if (data.key > el.key)
                {
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
    }

    clear()
    {
        for (let key of Object.keys(this.highscores))
            this.highscores[key].vals = [];
        this.$localstorage.setObject('highscores', this.highscores);
    }
}

angular.module('reverseApp.services', [])

    .factory('$localstorage', ['$window', function ($window : IWindowService)
    {
        return new LocalStorageService($window);
    }])

    .factory('highscores', ['$localstorage', function ($localstorage : LocalStorageService)
    {
        return new HighscoresService($localstorage);
    }]);


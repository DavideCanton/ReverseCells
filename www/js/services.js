"use strict";

angular.module('reverseApp.services', [])

    .factory('$localstorage', ['$window', function ($window)
    {
        return {
            set: function (key, value)
            {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue)
            {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key)
            {
                $window.localStorage.removeItem(key);
            },
            setObject: function (key, value)
            {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key)
            {
                return JSON.parse($window.localStorage[key] || '{}');
            },
            isDefined: function (key)
            {
                return $window.localStorage[key] !== undefined;
            }
        };
    }])

    .factory('highscores', ['$localstorage', function ($localstorage)
    {
        return {
            highscores: $localstorage.getObject("highscores", {}),

            register: function (name, size, crit)
            {
                if (this.highscores[name] === undefined)
                    this.highscores[name] = {vals: [], size: size, crit: crit};
                $localstorage.setObject('highscores', this.highscores);
            },

            isInHighscore: function (name, val)
            {
                var h = this.highscores[name];
                if (h.vals.length < h.size)
                    return true;
                return h.vals.some(function (el)
                {
                    return (h.crit == '+' && val < el.key || h.crit == '-' && val > el.key);
                });
            },

            addToHighScore: function (name, data)
            {
                var h = this.highscores[name];
                var index = h.vals.length;
                h.vals.some(function (el, i)
                {
                    if (h.crit == '+' && data.key < el.key || h.crit == '-' && data.key > el.key)
                    {
                        index = i;
                        return true;
                    }
                    return false;
                });
                h.vals.splice(index, 0, data);
                if (h.vals.length > h.size)
                    h.vals.splice(h.size, 1);
                $localstorage.setObject('highscores', this.highscores);
            },

            clear: function ()
            {
                for (var name in this.highscores)
                    if (this.highscores.hasOwnProperty(name))
                        this.highscores[name].vals = [];
            }
        };
    }]);
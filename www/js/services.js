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
            setObject: function (key, value)
            {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key)
            {
                var data = $window.localStorage[key];
                if (data === undefined || data === null)
                    return data;
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }]);
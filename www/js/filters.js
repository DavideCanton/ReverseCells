///<reference path="typings/index.d.ts"/>
"use strict";
angular.module('reverseApp.filters', [])
    .filter('makeRange', function () {
    return function (input) {
        var lowBound, highBound;
        switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0], 10) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0], 10);
                highBound = parseInt(input[1], 10) - 1;
                break;
            default:
                return input;
        }
        return _.range(lowBound, highBound + 1);
    };
})
    .filter('formatTime', function () {
    return function (inputS) {
        var input;
        if (!_.isNumber(inputS))
            input = parseInt(String(inputS), 10);
        else
            input = inputS;
        var h = pad2(Math.floor(input / 3600));
        var rem = input % 3600;
        var m = pad2(Math.floor(rem / 60));
        var s = pad2(rem % 60);
        return h + ":" + m + ":" + s;
    };
});
function pad2(n) {
    if (n < 10)
        return "0" + n;
    return "" + n;
}
//# sourceMappingURL=filters.js.map
///<reference path="typings/index.d.ts"/>

"use strict";

angular.module('reverseApp.filters', [])

    .filter('makeRange', () =>
    {
        return (input : string[]) : (string[] | number[]) =>
        {
            let lowBound: number, highBound: number;
            switch (input.length)
            {
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

    .filter('formatTime', function ()
    {
        return function (inputS: number | string)
        {
            let input : number;
            if(!_.isNumber(inputS))
                input = parseInt(String(inputS), 10);
            else
                input = inputS;

            let h = pad2(Math.floor(input / 3600));
            let rem = input % 3600;
            let m = pad2(Math.floor(rem / 60));
            let s = pad2(rem % 60);
            return h + ":" + m + ":" + s;
        };
    });

function pad2(n: number) : string
{
    if (n < 10)
        return "0" + n;
    return "" + n;
}
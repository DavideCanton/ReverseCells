angular.module('reverseApp.filters', [])

    .filter('makeRange', function ()
    {
        return function (input)
        {
            var lowBound, highBound;
            switch (input.length)
            {
                case 1:
                    lowBound = 0;
                    highBound = parseInt(input[0]) - 1;
                    break;
                case 2:
                    lowBound = parseInt(input[0]);
                    highBound = parseInt(input[1]) - 1;
                    break;
                default:
                    return input;
            }
            var result = [];
            for (var i = lowBound; i <= highBound; i++)
                result.push(i);
            return result;
        };
    })
    .filter('toTime', function ()
    {
        return function (input)
        {
            input = +input;

            var h = pad2(Math.floor(input / 3600));
            var rem = input % 3600;
            var m = pad2(Math.floor(rem / 60));
            var s = pad2(rem % 60);
            return h + ":" + m + ":" + s;
        };
    });

function pad2(n)
{
    if (n < 10)
        return "0" + n;
    return "" + n;
}
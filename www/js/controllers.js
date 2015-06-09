var ctrls = angular.module("reverseApp.controllers", []);

ctrls.controller("reverseController", ['$scope', '$ionicPopup', function ($scope, $ionicPopup)
{
    $scope.matrix = null;
    $scope.r = -1;
    $scope.c = -1;
    $scope.completed = false;
    $scope.moves = 0;
    $scope.resets = 0;
    $scope.sizes = ['5x5', '7x7', '10x10'];
    $scope.levels = ['Easy', 'Medium', 'Hard'];

    $scope.current = {size: $scope.sizes[0], level: $scope.levels[0]};

    function levelToRatio(level)
    {
        if (level === $scope.levels[0])
            return 0.5;
        if (level === $scope.levels[1])
            return 1;
        if (level === $scope.levels[2])
            return 2;
        return -1;
    }

    $scope.generate = function ()
    {
        var data = $scope.current.size.match(/(\d+)x(\d+)/);

        $scope.r = +data[1];
        $scope.c = +data[2];
        $scope.moves = 0;
        $scope.resets = 0;
        $scope.matrix = $scope.generateMatrix();
        $scope.randomMatrix($scope.r * $scope.c * levelToRatio($scope.current.level));

        $scope.original = $scope.generateMatrix();
        for (var i = 0; i < $scope.r; i++)
            for (var j = 0; j < $scope.c; j++)
                $scope.original[i][j] = $scope.matrix[i][j];

        $scope.completed = false;
    };

    $scope.doRefresh = function ()
    {
        if ($scope.original && !$scope.completed)
        {
            for (var i = 0; i < $scope.r; i++)
                for (var j = 0; j < $scope.c; j++)
                    $scope.matrix[i][j] = $scope.original[i][j];
            $scope.moves = 0;
            $scope.resets++;
        }
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.generateMatrix = function ()
    {
        var matrix = [];
        for (var i = 0; i < $scope.r; i++)
        {
            var row = [];
            for (var j = 0; j < $scope.c; j++)
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
        $scope.completed = $scope.check();
    };

    $scope.makeMove = function (r, c)
    {
        for (var i = r - 1; i <= r + 1; i++)
            for (var j = c - 1; j <= c + 1; j++)
                if (i >= 0 && i < $scope.r && j >= 0 && j < $scope.c)
                    $scope.matrix[i][j] = !$scope.matrix[i][j];
    };

    $scope.check = function ()
    {
        for (var i = 0; i < $scope.r; i++)
            for (var j = 0; j < $scope.c; j++)
                if ($scope.matrix[i][j])
                    return false;
        return true;
    };

    $scope.randomMatrix = function (moves)
    {
        for (var x = 0; x < moves; x++)
        {
            var i = Math.floor(Math.random() * $scope.r);
            var j = Math.floor(Math.random() * $scope.c);
            $scope.makeMove(i, j);
        }
    };
}]);

ctrls.filter('makeRange', function ()
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
});
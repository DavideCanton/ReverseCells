"use strict";

module.exports = function (config)
{
    config.set({
        autoWatch: true,

        basePath: '../',

        files: [
            'www/lib/angular/angular.js',
            'www/lib/angular-animate/angular-animate.js',
            'www/lib/angular-sanitize/angular-sanitize.js',
            'www/lib/angular-ui-router/release/angular-ui-router.js',
            'www/lib/angular-ui-router-styles/ui-router-styles.js',
            'www/lib/angular-mocks/angular-mocks.js',
            'www/lib/ionic/js/ionic.js',
            'www/lib/ionic/js/ionic-angular.js',
            'www/lib/underscore/underscore.js',
            '../www/ts/*.js',
            'tests/**/*.js'
        ],

        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine'
        ],

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }
    });
};
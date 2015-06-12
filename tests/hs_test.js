"use strict";

describe("hs test", function ()
{
    var localStorageMock;
    var name;

    beforeEach(module('reverseApp'));

    beforeEach(function ()
    {
        name = 'current_time-Easy-5x5';

        localStorageMock = {
            storage: {},

            getObject: function (key)
            {
                return this.storage[key] || {};
            },

            setObject: function (key, val)
            {
                this.storage[key] = val;
            }
        };

        module(function ($provide)
        {
            $provide.value('$localstorage', localStorageMock);
        });
    });

    it("should create empty hs", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);
    }));

    it("should add element", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);
        highscores.addToHighScore(name, {name: 'pippo', key: 0});
        expect(highscores.highscores[name].vals.length).toBe(1);
    }));

    it("should add two elements in correct order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pippo', key: 0});
        highscores.addToHighScore(name, {name: 'pluto', key: 1});

        expect(highscores.highscores[name].vals.length).toBe(2);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
    }));

    it("should add two elements in reverse order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pluto', key: 1});
        highscores.addToHighScore(name, {name: 'pippo', key: 0});

        expect(highscores.highscores[name].vals.length).toBe(2);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
    }));

    it("should add three elements in reverse order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'topolino', key: 2});
        highscores.addToHighScore(name, {name: 'pluto', key: 1});
        highscores.addToHighScore(name, {name: 'pippo', key: 0});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");
    }));

    it("should add three elements in correct order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pippo', key: 0});
        highscores.addToHighScore(name, {name: 'pluto', key: 1});
        highscores.addToHighScore(name, {name: 'topolino', key: 2});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");
    }));

    it("should add three elements in mixed order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pluto', key: 1});
        highscores.addToHighScore(name, {name: 'topolino', key: 2});
        highscores.addToHighScore(name, {name: 'pippo', key: 0});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");
    }));

    it("should add three elements in random order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        for (var i = 0; i < 3; i++)
        {
            var val = Math.floor(Math.random() * 10);
            var obj = {name: "" + i, key: val};
            highscores.addToHighScore(name, obj);
        }

        expect(highscores.highscores[name].vals.length).toBe(3);

        for (i = 1; i < 3; i++)
        {
            var cur = highscores.highscores[name].vals[i].key;
            var old = highscores.highscores[name].vals[i - 1].key;

            expect(old <= cur).toBe(true);
        }
    }));

    it("should remove worse values", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pluto', key: 1});
        highscores.addToHighScore(name, {name: 'topolino', key: 2});
        highscores.addToHighScore(name, {name: 'pippo', key: 0});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");

        highscores.addToHighScore(name, {name: 'paperino', key: 0.5});

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("paperino");
        expect(highscores.highscores[name].vals[2].name).toBe("pluto");
    }));
});
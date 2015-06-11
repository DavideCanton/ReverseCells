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
        highscores.addToHighScore(name, {name: 'pippo', val: 0});
        expect(highscores.highscores[name].vals.length).toBe(1);
    }));

    it("should add two elements in correct order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pippo', val: 0});
        highscores.addToHighScore(name, {name: 'pluto', val: 1});

        expect(highscores.highscores[name].vals.length).toBe(2);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
    }));

    it("should add two elements in reverse order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pluto', val: 1});
        highscores.addToHighScore(name, {name: 'pippo', val: 0});

        expect(highscores.highscores[name].vals.length).toBe(2);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
    }));

    it("should add three elements in reverse order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'topolino', val: 2});
        highscores.addToHighScore(name, {name: 'pluto', val: 1});
        highscores.addToHighScore(name, {name: 'pippo', val: 0});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");
    }));

    it("should add three elements in correct order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pippo', val: 0});
        highscores.addToHighScore(name, {name: 'pluto', val: 1});
        highscores.addToHighScore(name, {name: 'topolino', val: 2});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");
    }));

    it("should add three elements in mixed order", inject(function (highscores)
    {
        expect(highscores.highscores[name].vals.length).toBe(0);

        highscores.addToHighScore(name, {name: 'pluto', val: 1});
        highscores.addToHighScore(name, {name: 'topolino', val: 2});
        highscores.addToHighScore(name, {name: 'pippo', val: 0});

        expect(highscores.highscores[name].vals.length).toBe(3);

        expect(highscores.highscores[name].vals[0].name).toBe("pippo");
        expect(highscores.highscores[name].vals[1].name).toBe("pluto");
        expect(highscores.highscores[name].vals[2].name).toBe("topolino");
    }));
});
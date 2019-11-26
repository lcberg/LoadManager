var loadmanager = require('../loadmanager.js');
var lm = loadmanager.makeLoadManager();

describe('self tests', function() {
    it('bla', function() {
        lm.add('test');
    });

});
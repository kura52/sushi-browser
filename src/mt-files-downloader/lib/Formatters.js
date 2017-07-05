var moment = require('moment');

var _floor = function(val) {
    return Math.floor(val);
};

var Formatters = {
    speed: function(speed) {
        var str;
        speed *= 8;
        if (speed > 1024 * 1024) str = _floor(speed * 10 / (1024 * 1024)) / 10 + ' Mbps';
        else if (speed > 1024) str = _floor(speed * 10 / 1024) / 10 + ' Kbps';
        else str = _floor(speed) + ' bps';
        return str + '';
    },

    elapsedTime: function(seconds) {
        return _floor(seconds) + 's';
    },

    remainingTime: function(seconds) {
        return moment.duration(seconds, 'seconds').humanize();
    }
};

module.exports = Formatters;
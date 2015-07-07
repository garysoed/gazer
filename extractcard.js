var gutil   = require('gulp-util');

var fs = require('fs');
var through = require('through2');

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    var cards = [];
    if (file.isBuffer()) {
      var lines = String(file.contents).split('\n');
      for (var i = 2; i < lines.length; i++) {
        var segments = lines[i].split('\t');
        var card = {
          'name': segments[0],
          'type': segments[2].toLowerCase(),
          'element': segments[1].toLowerCase(),
          'count': segments[3],
          'description': segments[7],
          'cost': segments[8],
          'code': segments[0].toLowerCase().replace(' ', '_')
        };

        if (segments[4]) {
          card['life'] = segments[4];
        }

        if (segments[5]) {
          card['attack'] = segments[5];
        }

        if (segments[6]) {
          card['armor'] = segments[6];
        }

        cards.push(card);
      }

      var content =
          '<base href="..">'
        + '<link rel="import" href="src/dijs.html">'
        + '<script src="bower_components/lokijs/src/lokijs.js"></script>'
        + '<script>'
          + 'DI.prefix("gz").bind("data", {}, function() { '
            + 'var raw = ' + JSON.stringify(cards, null, 2) + ';'
            + 'var db = new loki("gazer");'
            + 'var cards = db.addCollection("cards");'
            + 'raw.forEach(function(data) { cards.insert(data); });'
            + 'return cards;'
          + '});'
        + '</script>'
      this.push(new gutil.File({
        path: 'out/card-data.html',
        contents: new Buffer(content)
      }));
    } else {
      throw 'Only supports buffer';
    }

    cb();
  });
};

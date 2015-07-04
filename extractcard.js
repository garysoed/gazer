var gutil   = require('gulp-util');

var fs = require('fs');
var through = require('through2');

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    var elements = {};
    if (file.isBuffer()) {
      var lines = String(file.contents).split('\n');
      for (var i = 1; i < lines.length; i++) {
        var segments = lines[i].split('\t');
        var card = {
          'name': segments[0],
          'type': segments[2],
          'element': segments[1],
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

        if (!elements[card.element]) {
          elements[card.element] = [];
        }
        elements[card.element].push(card);
      }

      var content =
          '<base href="..">'
        + '<link rel="import" href="src/dijs.html">'
        + '<script>'
          + 'DI.prefix("gz").bind("data", {}, function() { '
            + 'return ' + JSON.stringify(elements, null, 2) + ';'
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

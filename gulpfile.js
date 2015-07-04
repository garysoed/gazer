var gulp    = require('gulp');
var gutil   = require('gulp-util');
var myth    = require('gulp-myth');
var plumber = require('gulp-plumber');

var loadtheme = require('./bower_components/protoboard/loadtheme');

var fs = require('fs');
var through = require('through2');

function toJson() {
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
          '<link rel="import" href="dijs.html">'
        + '<script>'
          + 'DI.prefix("gz").bind("data", {}, function() { '
            + 'return ' + JSON.stringify(elements, null, 2) + ';'
          + '});'
        + '</script>'
      this.push(new gutil.File({
        path: 'card-data.html',
        contents: new Buffer(content)
      }));
    } else {
      throw 'Only supports buffer';
    }

    cb();
  });
}

gulp.task('myth', function() {
  var theme = loadtheme(__dirname + '/bower_components/protoboard/themes/grey.json');
  return gulp.src('gazer.css')
      .pipe(myth({
        'variables': theme
      }))
      .pipe(gulp.dest('css'));
});

gulp.task('json', function() {
  return gulp.src('gazer.tsv')
      .pipe(toJson())
      .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch(['*.css'], gulp.task('myth'));
});

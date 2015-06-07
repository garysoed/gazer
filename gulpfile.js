var gulp    = require('gulp');
var gutil   = require('gulp-util');
var myth    = require('gulp-myth');
var plumber = require('gulp-plumber');

var loadtheme = require('./bower_components/protoboard/loadtheme');

var fs = require('fs');
var through = require('through2');


function handleError(error) {
  console.log(error.toString());
  this.emit('end');
}

function chain(fn) {
  return through.obj(function(file, enc, callback) {
    // TODO(gs): How to open a stream?
    var stream = gulp.src('')
        .pipe(plumber({
          errorHandler: function(err) {
            this.emit('error', err);
          }.bind(this)
        }))
        .pipe(through.obj(function(f, enc, cb) {
          cb(null, file);
        }));
    fn(stream)
        .pipe(through.obj(function(f, enc, cb) {
          this.push(f);
          cb(null, f);
        }.bind(this), function(cb) {
          callback();
          cb();
        }));
  });
}

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
          'cost': segments[14]
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

      this.push(new gutil.File({
        path: 'gz-data.js',
        contents: new Buffer('gz.cards = ' + JSON.stringify(elements, null, 2) + ';')
      }));
    } else {
      throw 'Only supports buffer';
    }

    cb();
  });
}

function readJsonTheme(file, base) {
  var json = require(file);
  var base = json.base ? readJsonTheme(json.base) : {};
  for (var key in json.vars) {
    base[key] = json.vars[key];
  }
  return base;
}

function subMyth() {
  return chain(function(stream) {
    var theme = loadtheme(__dirname + '/bower_components/protoboard/themes/grey.json');
    return stream
        .pipe(myth({
          'variables': theme
        }));
  })
}

gulp.task('myth', function() {
  return gulp.src('gazer.css')
      .pipe(subMyth())
      .pipe(gulp.dest('css'));
});

gulp.task('json', function() {
  return gulp.src('gazer.tsv')
      .pipe(toJson())
      .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch(['*.css'], ['myth']);
});

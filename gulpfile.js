var gulp    = require('gulp');
var myth    = require('gulp-myth');
var plumber = require('gulp-plumber');

var loadtheme = require('./bower_components/protoboard/loadtheme');
var extractcard = require('./extractcard');

gulp.task('myth', function() {
  var theme = loadtheme(__dirname + '/bower_components/protoboard/themes/grey.json');
  return gulp.src('gazer.css')
      .pipe(myth({
        'variables': theme
      }))
      .pipe(gulp.dest('out'));
});

gulp.task('json', function() {
  return gulp.src('gazer.tsv')
      .pipe(extractcard())
      .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch(['*.css'], gulp.task('myth'));
});

gulp.task('default', gulp.parallel('myth', 'json'));

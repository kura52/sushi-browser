const gulp = require("gulp");
const babel = require("gulp-babel")

var path = require('path')
var env = 'production'

gulp.task('main-process', function() {
  return gulp.src(['./src/**/*.js','!./src/defaultExtension/**','!./src/toolPages/**','!./src/render/**','!./src/extension/**','!./src/chromagnon/**','!./src/uglify-es/**'])
    .pipe(babel({}))
      .pipe(gulp.dest('./lib'))
});


gulp.task('main-process2', function() {
  return gulp.src(['./src/extension/chromeExtensionPath.js','./src/extension/extensions.js','./src/extension/browserAction.js'])
    .pipe(babel({}))
    .pipe(gulp.dest('./lib/extension'))
});


gulp.task('main-process3', function() {
  return gulp.src(['./src/render/pubsub.js','./src/render/urlutil.js'])
    .pipe(babel({}))
    .pipe(gulp.dest('./lib/render'))
});

gulp.task('main-process4', function() {
  return gulp.src(['./src/uglify-es/**/*.js'])
    .pipe(gulp.dest('./lib/uglify-es'))
});


gulp.task('default', gulp.series(gulp.parallel('main-process','main-process2','main-process3','main-process4')));

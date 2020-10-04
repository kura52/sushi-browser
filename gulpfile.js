const gulp = require("gulp");
const sourcemaps = require('gulp-sourcemaps')
const babel = require("gulp-babel")
// const browserSync = require('browser-sync')
const plumber = require('gulp-plumber')
// var glebab = require('gulp-lebab')
const cache = require('gulp-cached')
const gulpif = require("gulp-if")
const uglify = require("gulp-uglify")
const beautify = require('gulp-beautify')
const webpack = require("webpack")
const {execSync} = require('child_process')

var path = require('path')
var env = process.env.NODE_ENV === 'production' ? 'production'
  : (process.env.NODE_ENV === 'test' ? 'test' : 'development')


gulp.task('dll-process', function() {
  // const ret = execSync(`webpack --define process.env.NODE_ENV="'production'" --config webpack.dll.config.js`)
  const ret = execSync(`webpack --config webpack.dll.config.js`)
  require('./tools/webpackVenderModify')
    return true
});

gulp.task('render-process', function() {
  // const ret = execSync(`webpack --define process.env.NODE_ENV="'production'" --config webpack.config.js`)
  const ret = execSync(`webpack --config webpack.config.js`)
  console.log(ret.toString());
    return true
});

gulp.task('main-process', function() {
  return gulp.src(['./src/**/*.js','!./src/defaultExtension/**','!./src/toolPages/**','!./src/render/**','!./src/extension/**','!./src/chromagnon/**'])
      .pipe(cache('mainCache'))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel({}))
      // .pipe(glebab())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./lib'))
});


gulp.task('main-process2', function() {
  return gulp.src(['./src/extension/chromeExtensionPath.js','./src/extension/extensions.js','./src/extension/browserAction.js'])
    .pipe(cache('mainCache'))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({}))
    // .pipe(glebab())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./lib/extension'))
});

gulp.task('main-process3', function() {
  return gulp.src(['./src/render/pubsub.js','./src/render/urlutil.js'])
    .pipe(cache('mainCache'))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({}))
    // .pipe(glebab())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./lib/render'))
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', gulp.parallel('main-process','main-process2','main-process3'))
    gulp.watch(['src/render/**/*.js','src/toolPages/**/*.js','src/defaultExtension/**/*.js'], gulp.parallel('render-process'))
    // gulp.watch(['./src/*.js','./src/*.tag'], [/*'babel-for-flow','flow-typecheck','babel',*/'webpack'])
    // gulp.watch(['./dist/*.js','../index.html'], reload)
});

// gulp.task('default', [/*'babel-for-flow','flow-typecheck', 'babel',*/'webpack', 'browser-sync', 'watch']);

gulp.task('default',  gulp.series( gulp.parallel(/*'dll-process',*/'main-process','main-process2','main-process3','render-process', 'watch')));

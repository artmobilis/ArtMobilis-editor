'use strict';

var gulp      = require('gulp');
var electron  = require('electron-connect').server.create();
var jshint    = require('gulp-jshint');
var concat    = require('gulp-concat');
var uglify    = require("gulp-uglify");
var rename    = require('gulp-rename');

var paths = {
  artmobilib_src: ['../ArtMobilib-js/src/**/*.js'],
  artmobilis_js_ngmodules_src: ['../ArtMobilis-js-ngmodules/modules/**/*']
};

gulp.task('default', ['minify-artmobilib', 'copy-ngmodules']);

gulp.task('serve', ['minify-artmobilib', 'copy-ngmodules'], function () {
  electron.start();
  gulp.watch('index.js', electron.restart);
  gulp.watch('app/**/*', electron.reload);
  gulp.watch(paths.artmobilib_src, ['minify-artmobilib', electron.reload]);
  gulp.watch(paths.artmobilis_js_ngmodules_src, ['copy-ngmodules', electron.reload]);
});

gulp.task('lint-artmobilib', function() {
  return gulp.src(paths.artmobilib_src)
    .pipe(jshint())
    .on('error', function(err) {
      console.log(err.toString());
    })
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint-ngmodules', function() {
  return gulp.src(paths.artmobilis_js_ngmodules_src)
    .pipe(jshint())
    .on('error', function(err) {
      console.log(err.toString());
    })
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('minify-artmobilib', ['lint-artmobilib'], function () {
    gulp.src(paths.artmobilib_src)
    .pipe(concat('artmobilib.js'))
    .pipe(gulp.dest('../ArtMobilib-js/build/'))
    .pipe(gulp.dest('./app/lib/ArtMobilib/build/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('../ArtMobilib-js/build/'))
    .pipe(gulp.dest('./app/lib/ArtMobilib/build/'));
});

gulp.task('copy-ngmodules', ['lint-ngmodules'], function() {
    gulp.src(paths.artmobilis_js_ngmodules_src)
    .pipe(gulp.dest('./app/lib/ArtMobilis-js-ngmodules/modules/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.artmobilib_src, ['minify-artmobilib']);
  gulp.watch(paths.artmobilis_js_ngmodules_src, ['copy-ngmodules']);
});
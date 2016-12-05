var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var gnf = require('gulp-npm-files');
var runSequence = require('run-sequence');
var path = require('path');
var cp = require('child_process');
var tsb = require('gulp-tsb');

const dirs = {
  src: "./src",
  dest: "./build",
  test: "./test"
};

var tsConfigSrc = tsb.create('./tsconfig.json');
gulp.task('compileTypeScript', function () {
    return gulp.src([dirs.src + '/**/*.ts', '!' + dirs.src + '/**/*spec.ts'])
        .pipe(tsConfigSrc()) 
        .pipe(gulp.dest(dirs.dest));
});

gulp.task('buildTests', function () {
    return gulp.src(['./src/*.ts', './src/**/*.ts'])
        .pipe(tsConfigSrc()) 
        .pipe(gulp.dest('./tests'));
});

gulp.task('copyJsonFiles', function () {
    return gulp.src(['./src/**/*.json'])
        .pipe(gulp.dest(dirs.dest));
});

//Setup the config file to use the template
gulp.task('setupConfig', function () {
    del([
        dirs.dest + '/config/env.config.js',
        dirs.dest + '/config/env.config.map',
    ]);

    return gulp.src(dirs.dest + '/config/env.config.build.js')
        .pipe(rename("env.config.js"))
        .pipe(gulp.dest(dirs.dest + '/config'));
});

gulp.task('cleanAll', function () {
    return del([
        dirs.dest,
        dirs.test
    ]);
});

gulp.task('build', function(callback) {
  runSequence('cleanAll', 'compileTypeScript', 'copyJsonFiles', callback);
});

gulp.task('default', ['build']);

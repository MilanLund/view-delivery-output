var gulp = require('gulp'),
    less = require('gulp-less'),
  	path = require('path'),
		minifyCSS = require('gulp-minify-css'),
		rename = require('gulp-rename'),
		concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer');

//Watch less, js and pug files for build process
gulp.task('watch', function () {
  gulp.watch([
  		'./css/src/**/*.less',
  		'./scripts/src/*.js'
  	],
  	[
  		'less',
  		'scripts'
  	]);
});

gulp.task('less', function () {
  return gulp.src('./css/src/app.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('./css'))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
  	.pipe(gulp.dest('./css'));
});

gulp.task('scripts', function() {
  return gulp.src([
      './scripts/src/vue.js',
      './scripts/src/jquery.js',
      './scripts/src/codemirror.js',
      './scripts/src/codemirror-js.js',
      './scripts/src/beautify.js',
      './scripts/src/code-editor.js',
      //'./scripts/src/main.js',
      './scripts/src/actions.js'
  	])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./scripts/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./scripts/'));
});

gulp.task('default', ['less', 'scripts', 'watch'], function () {
});

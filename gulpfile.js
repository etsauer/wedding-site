var browserSync = require('browser-sync').create();
var data = require('gulp-data');
var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var sass = require('gulp-sass');
const { series, parallel } = require('gulp');

// Configuration
var configuration = {
    paths: {
        src: {
            html: './src/*.html',
            css: [
                './src/css/bootstrap.min.css',
                './src/css/main.css'
            ],
            static: './src/static/**/*'
        },
        dest: './app'
    }
};

function startBrowser() {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });
}

function nunjucks() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('src/pages/**/*.+(html|njk)')
  // Adding data
  .pipe(data(function() {
    return require('./src/data/data.json')
  }))
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['src/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('app'))
}

function compileCss() {
  return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
}

function static() {
  return gulp.src(configuration.paths.src.static)
    .pipe(gulp.dest(configuration.paths.dest))
}

function watch() {
  gulp.watch('src/scss/**/*.scss', gulp.series(compileCss, browserSync.reload));
  gulp.watch('src/pages/**/*.+(html|njk)', gulp.series(nunjucks, browserSync.reload));
  gulp.watch('src/templates/**/*.nunjucks', gulp.series(nunjucks, browserSync.reload));
  gulp.watch('src/data/*.json', gulp.series(nunjucks, browserSync.reload));
  gulp.watch('src/static/**/*', gulp.series(static, browserSync.reload));
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/**/*', browserSync.reload);
}

function complete(cb) {
  cb();
}

exports.build = series(static, compileCss, nunjucks, complete)
exports.start = parallel(compileCss, static, nunjucks, startBrowser, watch)

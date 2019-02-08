var browserSync = require('browser-sync').create();
var data = require('gulp-data');
var gulp = require('gulp');
var watch = require('gulp-watch')
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
      baseDir: configuration.paths.dest
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

function watchSass() {
  return watch('src/scss/**/*.scss', compileCss);
}

function watchStatic() {
  return watch('src/static/**/*', static);
}

function watchNunjucks() {
  return watch([
    'src/pages/**/*.+(html|njk)',
    'src/templates/**/*.nunjucks',
    'src/data/*.json'
  ], nunjucks);
}

// Reloads the browser whenever HTML or JS files change
function watchSite() {
  watch('./app/**', browserSync.reload);
}

function complete(cb) {
  cb();
}

exports.build = series(static, compileCss, nunjucks, complete)
exports.start = series(static, compileCss, nunjucks,
  parallel(startBrowser, watchSass, watchSass, watchNunjucks, watchSite))

var browserSync = require('browser-sync').create();
var data = require('gulp-data');
var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var sass = require('gulp-sass');

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('src/pages/**/*.+(html|njk)')
  // Adding data
  .pipe(data(function() {
    return require('./src/data/gallery.json')
  }))
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['src/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('app'))
});

gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', gulp.parallel( 'sass', 'nunjucks', 'browserSync', function(){
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/pages/**/*.+(html|njk)', gulp.series('nunjucks'));
  gulp.watch('src/templates/**/*.nunjucks', gulp.series('nunjucks'));
  gulp.watch('src/data/*.json', gulp.series('nunjucks'));
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/**/*', browserSync.reload);
}));

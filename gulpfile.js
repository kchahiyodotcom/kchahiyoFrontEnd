var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglifyJs = require('gulp-uglify');
var jshint = require('gulp-jshint');
var angularTemplateCache = require('gulp-angular-templatecache');

var paths = {
  sass: ['./scss/**/*.scss'],
  jsUglify:['./www/js/uncompressed_js/*.js'],
  jsHint : ['./lib/*.js'],
  templates: ['./www/templates/**/*.html']
};

gulp.task('serve:before', ['default']);

//gulp.task('default', ['sass', 'lint']);
gulp.task('default', ['sass', 'lint','uglify']);

gulp.task('sass', function(done) {
  console.log('scss ran');
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('templates', function(){
  return gulp.src(paths.templates)
          .pipe(angularTemplateCache())
          .pipe(concat('templates.js'))
          .pipe(gulp.dest('./www/lib/'));
})

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function(){
  gulp.src('./www/js/uncompressed_js/*.js')
      .pipe(uglifyJs({
        compress:{
            drop_console: true
          }
        }))
      .pipe(gulp.dest('./www/js/compressed_js/'));
})

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.jsUglify, ['uglify']);

});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

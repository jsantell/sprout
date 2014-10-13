var gulp          = require('gulp');
var clean         = require('gulp-clean');
var concat        = require('gulp-concat');
var connect       = require('gulp-connect');
var gbrowserify   = require('gulp-browserify');
var gutil         = require('gulp-util');
var rename        = require('gulp-rename');
var jade          = require('gulp-jade');
var less          = require('gulp-less');
var less          = require('gulp-less');
var source        = require('vinyl-source-stream');
var watchify      = require('watchify');
var browserify    = require('browserify');

/**
 * Configuration:
 */
var config = {
  build_dir: './build/',
  js: {
    src: './src/index.js',
    dest: 'site.js'
  },
  less: {
    src: './styles/index.less',
    watch: './styles/**/*.less',
    dest: 'site.css'
  },
  index: {
    src: './markup/app.jade',
    configs: [
      {dest: 'index.html', config: {}}
    ]
  }
};

/**
 * Gulp build tasks:
 */
gulp.task('build', ['assets', 'index', 'css', 'js']);
gulp.task('js', ['browserify']);
gulp.task('css', ['less']);
gulp.task('default', ['connect', 'build', 'watch']);

/**
 * Connect:
 */
gulp.task('connect', ['build'], function () {
  connect.server({
    livereload: true
  });
});


/**
 * Clean:
 */
gulp.task('clean', function () {
  return gulp.src('./build', {read: false})
    .pipe(clean({force: true}));
});

/**
 * Assets:
 */
gulp.task('assets', function () {
  return gulp.src('./assets/**/*')
    .pipe(gulp.dest(config.build_dir));
});

/**
 * JS:
 *
 * Compile templates, browserify
 */
gulp.task('browserify', function () {
  return gulp.src(config.js.src)
    .pipe(gbrowserify({
    }))
    .pipe(rename(config.js.dest))
    .pipe(gulp.dest(config.build_dir + 'scripts/'))
    .pipe(connect.reload());
});

/**
 * Index:
 */
gulp.task('index', function () {
  return config.index.configs.forEach(function (o) {
    gulp.src(config.index.src)
      .pipe(jade({
        locals: o.config
      }))
      .pipe(rename(o.dest))
      .pipe(gulp.dest(config.build_dir))
      .pipe(connect.reload());

  });
});

/**
 * Styles:
 *
 * Compile less, build bootstrap theme and concatenate.
 */

gulp.task('less', function () {
  return gulp.src([
      './vendor/styles/bootstrap/bootstrap.less',
      './vendor/styles/font-awesome/font-awesome.less',
      config.less.src
    ])
    .pipe(less())
    .pipe(concat(config.less.dest))
    .pipe(gulp.dest(config.build_dir + 'styles/'))
    .pipe(connect.reload());
});

/**
 * Watch:
 *
 * TODO would be nice to cache unchanged style files
 */
gulp.task('watch', ['build'], function () {
  var rebundle = watchJS();
  gulp.watch(config.index.src, ['index']);
  gulp.watch(config.less.watch, ['less']);
});

function watchJS () {

  var bundler = watchify(browserify(config.js.src, watchify.args));

  bundler
    .on('update', rebundle)
    .on('time', function (time) {
      gutil.log('Bundle created in ' + (time / 1000).toFixed(2) + ' s');
    });

  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(config.js.dest))
      .pipe(gulp.dest(config.build_dir + 'scripts/'))
      .pipe(connect.reload());
  }

  return rebundle();
}

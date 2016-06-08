var $           = require('gulp-load-plugins')();
var argv        = require('yargs').argv;
var browser     = require('browser-sync');
var gulp        = require('gulp');
var panini      = require('panini');
var rimraf      = require('rimraf');
var sequence    = require('run-sequence');
var sherpa      = require('style-sherpa');
var spritesmith = require('gulp.spritesmith');

// Check for --production flag
var isProduction = !!!(argv.production);

// Port to use for the development server.
var PORT = 8000;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
  assets: [
    'source/assets/**/*',
    '!source/assets/{!img,js,scss}/**/*'
  ],
  sass: [
    'bower_components/foundation-sites/scss',
    'bower_components/motion-ui/src/'
  ],
  javascript: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/what-input/what-input.js',
    'bower_components/foundation-sites/js/foundation.core.js',
    'bower_components/foundation-sites/js/foundation.util.*.js',
    // Paths to individual JS components defined below
    'bower_components/foundation-sites/js/foundation.abide.js',
    //'bower_components/foundation-sites/js/foundation.accordion.js',
    'bower_components/foundation-sites/js/foundation.accordionMenu.js',
    'bower_components/foundation-sites/js/foundation.drilldown.js',
    'bower_components/foundation-sites/js/foundation.dropdown.js',
    'bower_components/foundation-sites/js/foundation.dropdownMenu.js',
    'bower_components/foundation-sites/js/foundation.equalizer.js',
    //'bower_components/foundation-sites/js/foundation.interchange.js',
    //'bower_components/foundation-sites/js/foundation.magellan.js',
    //'bower_components/foundation-sites/js/foundation.offcanvas.js',
    'bower_components/foundation-sites/js/foundation.orbit.js',
    'bower_components/foundation-sites/js/foundation.responsiveMenu.js',
    'bower_components/foundation-sites/js/foundation.responsiveToggle.js',
    'bower_components/foundation-sites/js/foundation.reveal.js',
    'bower_components/foundation-sites/js/foundation.slider.js',
    //'bower_components/foundation-sites/js/foundation.sticky.js',
    //'bower_components/foundation-sites/js/foundation.tabs.js',
    //'bower_components/foundation-sites/js/foundation.toggler.js',
    //'bower_components/foundation-sites/js/foundation.tooltip.js',

	'source/assets/js/vendor/qtip/jquery.qtip.js',
	
  ],
  javascriptapp: [
    'source/assets/js/vendor/custom-select/jquery.mousewheel.js',
    'source/assets/js/vendor/custom-select/jScrollPane.js',
    'source/assets/js/vendor/custom-select/SelectBox.js',
    'source/assets/js/vendor/mask-plugin/jquery.mask.js',
    //'source/assets/js/vendor/ninja-slider/ninja-slider.js',
    //'source/assets/js/vendor/ninja-slider/thumbnail-slider.js',
	'source/assets/js/gallery.js',
    'source/assets/js/app.js'
	]
};

gulp.task('sprite', function () {
  var spriteData = gulp.src('source/assets/img/sprites/*.png').pipe(spritesmith({
    imgName: 'sprites.png',
    cssName: 'sprites.scss',
    imgPath: '../img/sprites/sprites.png',
    algorithm: 'binary-tree',
    padding: 10,
    cssTemplate: 'source/assets/scss/sprites/template-handlebars/scss.template.handlebars'
  }));
  spriteData.css.pipe(gulp.dest('source/assets/scss/sprites/'));
  spriteData.img.pipe(gulp.dest('compile/assets/img/sprites/'));
});

// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean', function(done) {
  rimraf('compile', done);
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy', function() {
  gulp.src(PATHS.assets)
    .pipe(gulp.dest('compile/assets'));
});

// Copy page templates into finished HTML files
gulp.task('pages', function() {
  gulp.src('source/templates/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'source/templates/pages/',
      layouts: 'source/templates/layouts/',
      partials: 'source/templates/partials/',
      data: './',
      helpers: 'source/templates/helpers/'
    }))
    .pipe(gulp.dest('compile'));
});

gulp.task('pages:reset', function(cb) {
  panini.refresh();
  gulp.run('pages');
  cb();
});

gulp.task('styleguide', function(cb) {
  sherpa('source/templates/styleguide/index.md', {
    output: 'compile/styleguide.html',
    template: 'source/templates/styleguide/template.html'
  }, cb);
});

// Compile Sass into CSS
// In production, the CSS is compressed
gulp.task('sass', function() {
  var uncss = $.if(isProduction, $.uncss({
    html: ['source/templates/**/*.html','compile/**/*.html'],
    //html: ['compile/**/*.html'],
    ignore: [
      new RegExp('^meta\..*'),
      new RegExp('^\.is-.*'),
	  new RegExp('^\.m-.*'),
	  new RegExp('^\.p-.*'),
	  new RegExp('^\.clearfix.*'),
	  new RegExp('^\.orbit.*'),
	  new RegExp('^\.breadcrumbs.*'),
	  new RegExp('^\.badge.*'),
	  new RegExp('^\.dropdown.*'),
	  new RegExp('^\.pagination.*'),
	  new RegExp('^\.button.*'),
	  new RegExp('^\.forms.*'),
	  new RegExp('^\.thumbnail.*'),
	  new RegExp('^\.label.*'),
	  new RegExp('^\.slide.*'),
	  new RegExp('^\.mui.*')
    ]
  }));

  var minifycss = $.if(isProduction, $.minifyCss());

  return gulp.src('source/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe(uncss)
    .pipe(minifycss)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('compile/assets/css'));
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
	//isProduction = true;
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.concat('lib.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('compile/assets/js'));
});

gulp.task('javascriptapp', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));
/**/
  return gulp.src(PATHS.javascriptapp)
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('compile/assets/js'));
});

// Copy images to the "compile" folder
// In production, the images are compressed
gulp.task('images', function() {
  var imagemin = $.if(isProduction, $.imagemin({
    progressive: true
  }));

  return gulp.src('source/assets/img/**/*')
    .pipe(imagemin)
    .pipe(gulp.dest('compile/assets/img'));
});

// Build the "compile" folder by running all of the above tasks
gulp.task('build', function(done) {
  sequence('clean', ['pages', 'sass', 'javascript', 'javascriptapp', 'sprite', 'images', 'copy'], 'styleguide', done);
});

// Start a server with LiveReload to preview the site in
gulp.task('server', ['build'], function() {
  browser.init({
    server: 'compile', port: PORT
  });
});

// Build the site, run the server, and watch for file changes
gulp.task('default', ['build', 'server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch(['source/templates/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch(['source/templates/{layouts,partials}/**/*.html'], ['pages:reset', browser.reload]);
  gulp.watch(['source/assets/scss/**/*.scss'], ['sass', browser.reload]);
  gulp.watch(['source/assets/js/**/*.js'], ['javascript','javascriptapp', browser.reload]);
  gulp.watch(['source/assets/img/**/*'], ['images', 'sprite', browser.reload]);
  gulp.watch(['source/templates/styleguide/**'], ['styleguide', browser.reload]);
});

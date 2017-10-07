// make sure to npm install --save-dev for all of these
var gulp = require('gulp'),
	sass = require("gulp-sass"), // SASS
	uglify = require("gulp-uglify"), // JS
	concat = require("gulp-concat"), // CSS + JS
	gutil = require('gulp-util'), // Logging
	cssnano = require('gulp-cssnano'), // CSS + SASS
	htmlmin = require('gulp-htmlmin'), // HTML
	map = require('gulp-sourcemaps'), // CSS + JS
	del = require('del'),
	browserSync = require('browser-sync').create(),
	ftp = require( 'vinyl-ftp' );

// Static Server + watching scss/html files. Alternative is http-server -p 2380
gulp.task('serve', ['css'], function() {

    browserSync.init({
        server: "output",
        port: 2380 //my favorite port
    });
    gulp.watch("*.html",["html"]).on('change', browserSync.reload);
	gulp.watch("assets/css/*",["css"]).on('change', browserSync.reload);
	gulp.watch("assets/scss/*",["sass"]).on('change', browserSync.reload);
	gulp.watch("assets/js/*",["js"]).on('change', browserSync.reload);
	gulp.watch("assets/images/*",["copy"]).on('change', browserSync.reload);
});

// concat & minify css
gulp.task("css",function(){
	gulp.src(['assets/css/semantic.min.css','assets/css/style.css'])
	.pipe(map.init()) //create sourcemap
	.pipe(concat('style.min.css')) //combine into single file
	.pipe(cssnano({discardComments: {removeAll: true}})) //minimize without comments
	.pipe(map.write("output/assets")) //write sourcemap
	.pipe(gulp.dest('output/assets/css')) //send completed file
	.pipe(browserSync.stream()) //update browsersync
});

// build sass
gulp.task('sass', ['cleanCSS'],function() {
  return gulp.src("assets/scss/*.scss")
      .pipe(map.init()) //create sourcemap
      .pipe(sass()) //initialize sass compiler
      .pipe(cssnano({discardComments: {removeAll: true}})) //minimize without comments
      .pipe(map.write("/")) //write sourcemap
      .pipe(gulp.dest('output/assets/css')) //send completed file
      .pipe(browserSync.stream()); //update browsersync
});

// concat & minify js
gulp.task("js",function(){
	//gulp.src(["assets/js/jquery.min.js","assets/js/semantic.min.js","assets/js/canvasjs.min.js","assets/js/scripts.js"])
	gulp.src("assets/js/*.js")
	.pipe(map.init())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(map.write("/"))
	.pipe(gulp.dest('output/assets/js'))
	.pipe(browserSync.stream())
});


gulp.task('clean', function() {
	del(['output']); // 'output/css/*.css*', 'output/js/app*.js*'
});

gulp.task('cleanCSS', function() {
	del(['output/css']); // 'output/css/*.css*', 'output/js/app*.js*'
});


// copy misc. files to output
gulp.task("copy",function(){
	gulp.src(["assets/css/**/*","assets/data/*","assets/images/*","assets/js/dummyData.js"],{base:"."})
	.pipe(gulp.dest("output"));
});

//minify html
gulp.task("html", function(){
	gulp.src(["*.html"])
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest("output"))
	//.pipe(browserSync.stream())
});

gulp.task("log",function(){
	gutil.log("Job's done.")
});

// rolling my own default task
gulp.task("build", ["clean","css","js","copy","html","log"]);

gulp.task("default", ["css","js","copy","html","log","serve"]);

// look for changes. DELETE this if serve task works!
gulp.task("watch", function(){
	gulp.watch("*.html").on('change', browserSync.reload)
	gulp.watch("assets/css/*",["css"])
	gulp.watch("assets/js/*",["js"])
	gulp.watch('assets/scss/**/*.scss', ['sass'])
});


// FTP Info
// verify values in .bash_profile
var user = process.env.FTP_USER;
var password = process.env.FTP_PWD;
var host = '173.201.63.1';
var port = 21;
var localFilesGlob = ['css/*','js/*','img/*','*.html'];//['./**/*'];
var remoteFolder = '/folder'

// helper function to build an FTP connection based on our configuration
function getFtpConnection() {
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 5,
        log: gutil.log
    });
}

/**
 * FTP deploy task.
 * Copies the new files to the server
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy`
 */
gulp.task('ftp-deploy', function() {
    var conn = getFtpConnection();
    gutil.log(conn);

    return gulp.src(localFilesGlob, { base: '.', buffer: false })
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files
        .pipe( conn.dest( remoteFolder ) )
    ;
});

/**
 * Watch FTP deploy task.
 * Watches the local copy for changes and copies the new files to the server whenever an update is detected
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy-watch`
 */
gulp.task('ftp-deploy-watch', function() {

    var conn = getFtpConnection();

    gulp.watch(localFilesGlob)
    .on('change', function(event) {
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files
        .pipe( conn.dest( remoteFolder ) )
      ;
    });
});

// END FTP
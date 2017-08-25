var gulp = require('gulp'),
	sass = require("gulp-sass"),
	uglify = require("gulp-uglify"), // CSS + JS
	concat = require("gulp-concat"),
	gutil = require('gulp-util'),
	cssnano = require('gulp-cssnano'), // if I'm working with regular CSS
	htmlmin = require('gulp-htmlmin');
	map = require('gulp-sourcemaps');
	del = require('del'),
	connect = require('gulp-connect');

gulp.task("connect", function(){
	connect.server({
		root: '.',
		port: 2380,
		livereload: true
	})
});

// concat & minify css
gulp.task("css",function(){
	gulp.src(['assets/css/semantic.min.css','assets/css/style.css'])
	.pipe(map.init())
	.pipe(concat('style.min.css'))
	.pipe(cssnano({discardComments: {removeAll: true}}))
	.pipe(map.write("output/assets"))
	.pipe(gulp.dest('output/assets/css'))
	.pipe(connect.reload())
});

// concat & minify js
gulp.task("js",function(){
	gulp.src(["assets/js/jquery.min.js","assets/js/semantic.min.js","assets/js/canvasjs.min.js","assets/js/scripts.js"])
	.pipe(map.init())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(map.write("output/assets"))
	.pipe(gulp.dest('output/assets/js'))
	.pipe(connect.reload())
});

// copy misc. files to output
gulp.task("copy",function(){
	gulp.src(["assets/css/**/*","assets/data/*","assets/images/*","assets/js/dummyData.js"],{base:"."})
	.pipe(gulp.dest("output"));
});

//minify html
gulp.task("html", ["clean"],function(){
	gulp.src(["*.html"])
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest("output"))
	.pipe(connect.reload())
});

gulp.task("log",function(){
	gutil.log("Job's done.")
});

// rolling my own default task
gulp.task("build", ["clean","css","js","copy","html","log"]);

gulp.task("default", ["clean","css","js","copy","html","log","connect"]);

// look for changes
gulp.task("watch", function(){
	gulp.watch("*.html",["html"])
	gulp.watch("assets/css/*",["css"])
	gulp.watch("assets/js/*",["js"])
	//gulp.watch('assets/scss/**/*.scss', ['sass'])
});

// build sass
gulp.task('sass', function() {
  return gulp.src("assets/scss/app.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(maps.write('./'))
      .pipe(gulp.dest('output/css'))
      .pipe(connect.reload());
});


gulp.task('clean', function() {
	del(['output']); // 'output/css/*.css*', 'output/js/app*.js*'
});


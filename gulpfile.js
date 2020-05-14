const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack-stream');
const del = require('del');

var browserSync = require('browser-sync').create();

let isDev = true;

let webPackConfig = {
	output: {
		filename: 'app.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	},
	mode: isDev ? 'development' : 'production',
	devtool: isDev ? 'eval-source-map' : 'none',
}

sass.compiler = require('node-sass');

function buildStyles() {
	return gulp.src('./src/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css'))
		.pipe(browserSync.stream());
}

gulp.task('styles', buildStyles);

function buildHtml() {
	return gulp.src('./src/*.html')
		.pipe(gulp.dest('./build/'))
		.pipe(browserSync.stream());
}

gulp.task('html', buildHtml);

function buildScripts() {
	return gulp.src('./src/js/app.js')
		.pipe(webpack(webPackConfig))
		.pipe(gulp.dest('./build/js/'))
		.pipe(browserSync.stream());
}

gulp.task('scripts', buildScripts);

function buildImg() {
	return gulp.src('./src/img/**/*.*')
		// .pipe(image())
		.pipe(gulp.dest('./build/img'))
		.pipe(browserSync.stream());
}

gulp.task('images', buildImg);



function watch() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	});

	gulp.watch('./src/js/**/*.js', buildScripts);
	gulp.watch('./src/scss/**/*', buildStyles);
	gulp.watch('./src/img/**/*', buildImg);
	gulp.watch('./src/**/*.html', buildHtml);

}
gulp.task('watch', watch);

function clean() {
	return del(['build/*']);
}

let build = gulp.series(
	clean,
	gulp.parallel(buildHtml, buildStyles, buildImg, buildScripts)
)

gulp.task('build', build);

gulp.task(
	'default',
	gulp.series(
		gulp.parallel(buildHtml, buildStyles, buildImg, buildScripts),
		watch
	)
);
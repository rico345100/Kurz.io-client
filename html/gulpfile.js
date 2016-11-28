"use strict";
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const gutil = require('gulp-util');
//const rename = require('gulp-rename');
const browserify = require('browserify');
//const browserifyCss = require('browserify-css');
const babelify = require('babelify');
//const watchify = require('watchify');
//const uglify = require('gulp-uglify');
const minifyCss = require('gulp-cssnano');
const sass = require('gulp-ruby-sass');
const argv = require('yargs').argv;
const colors = require('colors');

//read argument like "--arg value"
function _getArgument(arg) {
	if(typeof argv[arg] === 'undefined')
		return false;

	return argv[arg];
}

gulp.task('default', () => {
	console.log('usage: gulp build'.green);
});

gulp.task('build', () => {
	let buildPath;
	let destPath;

	buildPath = `./src`;
	destPath = `./dist`;
	console.log(`building desktop application...`.green);
	
	// translate static resources
	// html
	gulp.src(`${buildPath}/index.html`)
	.pipe(gulp.dest(`${destPath}`));
	
	// fonts
	gulp.src(`${buildPath}/font/**`)
	.pipe(gulp.dest(`${destPath}/font`));
	
	// images
	gulp.src(`${buildPath}/images/**`)
	.pipe(gulp.dest(`${destPath}/images`));
	
	// scss
	sass(`${buildPath}/scss/app.scss`)
	.pipe(gulp.dest(`${destPath}/css`));

	// script
	return browserify({
		entries: `${buildPath}/js/app.js`,
		extensions: ['.js'],
		ignoreMissing: true,
		detectGlobals: false,
		debug: true
	})
	.transform(babelify, { 
		presets: ["es2015", "react"]
	})
	//.transform(browserifyCss, { global: true })
	.bundle()
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(gulp.dest(`${destPath}/js`));
});
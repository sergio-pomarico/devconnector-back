/*
 * Import dependencies
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const notify = require('gulp-notify');


/**
 * Default task
 */
gulp.task('default', ['lint']);


/**
 * validate code on eslint validator
 * @return {Object} [gulp task]
 */
gulp.task('lint', () => gulp.src(['**/*.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
  .on('error', notify.onError({
    title: 'Validation',
    message: 'You have errors in your code',
    sound: true,
  })));

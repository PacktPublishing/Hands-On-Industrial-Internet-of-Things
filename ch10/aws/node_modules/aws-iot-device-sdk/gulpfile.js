/*
 * Copyright 2010-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
/*jshint node:true*/
'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    cover = require('gulp-coverage'),
    jscs = require('gulp-jscs'),
    beautify = require('gulp-beautify');

gulp.task('default', ['test']);

gulp.task('test', ['jshint'], function() {
  console.log('Running unit tests');
  return gulp.src(['test/*unit-tests.js'], {read: false})
    .pipe(cover.instrument({
	pattern: ['common/lib/*.js','device/**/*.js','thing/*.js','index.js'],
	debugDirectory: 'debug'
    }))
    .pipe(mocha({
      reporter: 'spec',
      globals: {}
    }))
    .pipe(cover.gather())
    .pipe(cover.format())
    .pipe(gulp.dest('reports'))
    .once('end', function() {
      process.exit();
    });
});

gulp.task('jshint', function() {
  console.log('Analyzing source with JSHint and JSCS');
  return gulp
    .src(['common/lib/*.js','examples/**/*.js', 'device/**/*.js','thing/*.js','index.js', '!node_modules/**/*.js', '!examples/**/node_modules/**/*.js', '!examples/**/aws-configuration.js', '!browser/**/*bundle.js', '!examples/browser/**/*bundle.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish', {verbose: true}))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
});

gulp.task('beautify', function() {
  console.log('Beautifying source with indent level 3');
  return gulp
    .src(['!browser/**/*bundle.js', '!examples/**/*bundle.js', 'browser/**/*.js','common/**/*.js','examples/**/*.js', 'device/**/*.js','thing/*.js','index.js', '!node_modules/**/*.js', '!examples/**/node_modules/**/*.js', '!browser/**/*bundle.js', '!examples/browser/**/*bundle.js'])
    .pipe(beautify({'indent_size':3, 'indent_char': ' ', 'end_with_newline': true}))
//
// Replace the files in-place with the beautified versions.
//
    .pipe(gulp.dest( function(vinylFile) { console.log('Beautifying \''+vinylFile.path+'\'...'); return vinylFile.base; }));
});

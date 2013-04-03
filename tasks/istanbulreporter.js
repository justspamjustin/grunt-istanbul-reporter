/*
 * grunt-istanbul-reporter
 * https://github.com/justspamjustin/grunt-istanbul-reporter
 *
 * Copyright (c) 2013 Justin Martin
 * Licensed under the MIT license.
 */

'use strict';

var Report = require('istanbul').Report,
    Collector = require('istanbul').Collector,
    fileset = require('fileset'),
    fs = require('fs'),
    path = require('path');

module.exports = function(grunt) {

  var IstanbulReporter = function (options) {
    this.options = options;
    this.assertOption('exportDir');
    this.assertOption('coverageFiles');
    this.collector = new Collector();
    this.originalWorkingDirectory = process.cwd();
    this.reporter = Report.create(this.options.reporter, {
      dir: path.resolve(this.options.exportDir),
      root: path.resolve(this.options.exportDir)
    });
  };

  IstanbulReporter.prototype.exportReport = function () {
    var self = this;
    fileset(this.options.coverageFiles, function (err, files) {
      if (err) {
        grunt.log.error(err);
        self.options.doneCallback(false);
      }
      self.addEachFile(files);
      process.chdir(process.cwd() + '/' + self.options.baseDir);
      self.reporter.writeReport(self.collector, true);
      process.chdir(self.originalWorkingDirectory);
      self.options.doneCallback();
    });
  };

  IstanbulReporter.prototype.addEachFile = function (files) {
    for(var i = 0; i < files.length; i++) {
      var fileName = files[i];
      this.addFile(fileName);
    }
  };

  IstanbulReporter.prototype.addFile = function (fileName) {
    var coverageObject = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    this.collector.add(coverageObject);
  };

  IstanbulReporter.prototype.assertOption = function (optionName) {
    var option = this.options[optionName];
    if(option === null || option === undefined) {
      grunt.log.error('"' + optionName + '" option is required.');
    }
  };

  grunt.registerMultiTask('istanbulreporter', 'Creates an istanbul coverage report', function() {
    var options = this.options({
      reporter: 'html',
      coverageFiles: null,
      exportDir: null,
      baseDir: ''
    });
    options.doneCallback = this.async();

    var reporter = new IstanbulReporter(options);
    reporter.exportReport();
  });

};

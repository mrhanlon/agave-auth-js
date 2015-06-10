module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'spec/**/*.js']
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      dev: {
        configFile: 'karma.conf.js',
        singleRun: false
      }
    },

    uglify: {
      dist: {
        options: {
          mangle: false,
          compress: false,
          beautify: true
        },
        files: {
          'dist/agave-auth.js': ['src/agave-auth.js']
        }
      },
      min: {
        files: {
          'dist/agave-auth.min.js': ['src/agave-auth.js'],
          'dist/agave.js': ['./node_modules/agave-js/dist/agave.js'],
          'dist/vendor/vendor.js': [
            './node_modules/swagger-client/browser/swagger-client.js',
            './node_modules/es6-promise/dist/es6-promise.js'
          ]
        }
      }
    },

    copy: {
      example: {
        files: [
          {
            src: 'src/example/index.html',
            dest: 'dist/example/index.html'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['jshint','karma:unit']);

  grunt.registerTask('dev', ['jshint','karma:dev']);

  grunt.registerTask('default', ['test','uglify','copy']);
};

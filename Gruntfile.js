module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      dist: ['dist/*']
    },

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
          'dist/agaveapi-auth.js': ['src/agaveapi-auth.js']
        }
      },
      min: {
        files: {
          'dist/agaveapi-auth.min.js': ['src/agaveapi-auth.js'],
          'dist/agaveapi.js': ['./node_modules/agaveapi-js/dist/agaveapi.js'],
          'dist/vendor/vendor.js': [
            './node_modules/swagger-client/browser/swagger-client.js',
            './node_modules/es6-promise/dist/es6-promise.js'
          ]
        }
      }
    },

    watch: {
      js: {
        files: ['src/**/*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      spec: {
        files: ['spec/**/*.js'],
        tasks: ['jshint', 'karma:dev']
      },
      livereload: {
        files: ['src/**/*.js', 'index.html'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      }
    },

    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [connect.static('.')];
          }
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('serve', function() {
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', ['jshint','karma:unit']);

  grunt.registerTask('dev', ['jshint','karma:dev']);

  grunt.registerTask('default', ['test', 'clean', 'uglify']);
};

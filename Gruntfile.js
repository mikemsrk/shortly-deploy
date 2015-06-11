module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gitpush:{
      your_target:{
        options:{
          remote:'azure',
          branch:'master'
        }
      }
    },
    clean: {
      js: ["public/dist/*.js","!public/dist/*.min.js"]
    },
    concat: {
      basic: {
        src: ['public/lib/jquery.js',
              'public/lib/underscore.js',
              'public/lib/backbone.js',
              'public/lib/handlebars.js'
              ],
        dest: 'public/dist/lib.js' 
      },
      extras: {
        src: ['public/client/app.js',
              'public/client/link.js',
              'public/client/links.js',
              'public/client/linkView.js',
              'public/client/linksView.js',
              'public/client/createLinkView.js',
              'public/client/router.js',
              ],
        dest: 'public/dist/main.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'public/dist/main.min.js': ['public/dist/main.js'],
          'public/dist/lib.min.js': ['public/dist/lib.js']
        }
      }
    },

    jshint: {
      files: [
        // Add filespec list here
        'server.js',
        'server-config.js',
        'lib/*.js',
        'app/config.js',
        'app/models/**/*.js'
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files: {
          'public/dist/style.min.css': ['public/style.css']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'cssmin',
    'clean'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['gitpush']);

    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    // add your deploy tasks here
    'test',
    'build',
    'jshint'
  ]);


};

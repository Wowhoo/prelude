'use strict';
var path = require('path');

module.exports = function(grunt) {

  var prelude = {
    common: [
      'reset',
      'typography',
      'forms|core,extend'
    ],
    components: [
      'alert',
      'icon',
      'breadcrumbs|core,extend',
      'buttons|core,extend',
      'pager|core,extend',
      'pagination|core,extend',
      'tables|core,extend',
      'menu|core,extend',
      'tab|core,extend',
      'progress|core',
      'label|core,extend'
    ],
    functions: [
      'grid|core,equalization,phrase'
    ]
  };

  var less_build_files = [];
  var concat_all_files = [];
  var concat_all_min_files = [];
  var concat_build_files = [];

  var concat_all_files_core = [];
  var concat_all_min_files_core = [];

  for(var type in prelude){
    prelude[type].forEach(function(file){
      if(file.indexOf('|') !== -1){
        var file_array = file.split('|');
        var subfiles = file_array[1].split(',');
        var folder = file_array[0];
        var concat_srcs = [];
        subfiles.forEach(function(subfile){
          less_build_files.push({
            src: 'less/'+type+'/'+folder+'/'+folder+'-'+subfile+'.less',
            dest: 'build/'+type+'/'+folder+'-'+subfile+'.css'
          });
          concat_srcs.push('build/'+type+'/'+folder+'-'+subfile+'.css');
          concat_all_files.push('build/'+type+'/'+folder+'-'+subfile+'.css');
          concat_all_min_files.push('build/'+type+'/'+folder+'-'+subfile+'-min.css');
          if(subfile === 'core') {
            concat_all_files_core.push('build/'+type+'/'+folder+'-'+subfile+'.css');
            concat_all_min_files_core.push('build/'+type+'/'+folder+'-'+subfile+'-min.css');
          }
        });
        concat_build_files.push({
          src: concat_srcs,
          dest: 'build/'+type+'/'+folder+'.css'
        })
      }else{
        less_build_files.push({
          src: 'less/'+type+'/'+file+'/'+file+'.less',
          dest: 'build/'+type+'/'+file+'.css'
        });

        concat_all_files.push('build/'+type+'/'+file+'.css');
        concat_all_min_files.push('build/'+type+'/'+file+'-min.css');

        concat_all_files_core.push('build/'+type+'/'+file+'.css');
        concat_all_min_files_core.push('build/'+type+'/'+file+'-min.css');
      }
    });
  }
  
  var less_skin_build_files = [];

  var skins = {
    pure: {
      common: [
        'forms|core,extend',
        'typography'
      ],
      components: [
        'alert',
        'tables|core,extend'
      ]
    }
  };

  for(var skin in skins){
    for(var type in skins[skin]){
      skins[skin][type].forEach(function(file){
        if(file.indexOf('|') !== -1){
          var file_array = file.split('|');
          var subfiles = file_array[1].split(',');
          var folder = file_array[0];
          var concat_srcs = [];
          subfiles.forEach(function(subfile){
            less_skin_build_files.push({
              src: 'skins/'+skin+'/'+type+'/'+folder+'/'+folder+'-'+subfile+'.less',
              dest: 'build/skins/'+skin+'/'+type+'/'+folder+'-'+subfile+'.css'
            });
            concat_srcs.push('build/skins/'+skin+'/'+type+'/'+folder+'-'+subfile+'.css');
          });
        }else{
          less_skin_build_files.push({
            src: 'skins/'+skin+'/'+type+'/'+file+'/'+file+'.less',
            dest: 'build/skins/'+skin+'/'+type+'/'+file+'.css'
          });
        }
      });
    }
  }


    
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    // -- copy config ----------------------------------------------------------
    copy: {
        adaptGrid: {
            files: [{
                    expand: true,
                    flatten: true,
                    cwd: 'components/',
                    src: [
                        'adaptGrid/src/mixins.less',
                    ],
                    dest: 'less/functions/grid/',
                    rename: function (dest, src) {
                      src = 'grid-mixins.less';
                      return path.join(dest, src);
                  }
                }
            ]
        },
    },
    // -- Clean Config ---------------------------------------------------------

    clean: {
        build    : ['build/'],
        release  : ['release/'],
        skin_build : ['build/skins/']
    },

    // -- Less Config ----------------------------------------------------------

    less: {
      build: {
        files: less_build_files
      },
      skin_build: {
        files: less_skin_build_files
      }
    },

    // -- Concat Config --------------------------------------------------------

    concat: {
        build: {
          files: concat_build_files
        },

        all: {
            files: [{
              dest: 'build/<%= pkg.name %>.css',
              src: concat_all_files
            },{
              dest: 'build/<%= pkg.name %>-min.css',
              src: concat_all_min_files
            }]
        },

        allcore: {
            files: [{
              dest: 'build/<%= pkg.name %>-core.css',
              src: concat_all_files_core
            },{
              dest: 'build/<%= pkg.name %>-core-min.css',
              src: concat_all_min_files_core
            }]
        },

        // skin_build: {
        //   files: concat_skin_build_files
        // },

        // skin_all: [{
        //   files: concat_skin_all_files
        // },{
        //   files: concat_skin_all_min_files
        // }]

    },

    // -- CSSLint Config -------------------------------------------------------

    csslint: {
        options: {
            csslintrc: '.csslintrc'
        },

        src: {
            src: [
                'build/**/*.css'
            ]
        }
    },

    // -- Recess Config --------------------------------------------------------

    recess: {
        options: {
          compile: false,
          compress: false,
          noIDs: true,
          noJSPrefix: true,
          noOverqualifying: true,
          noUnderscores: true,
          noUniversalSelectors: true,
          prefixWhitespace: true,
          strictPropertyOrder: true,
          zeroUnits: true  
        },
        src: {
            src: ['less/**/*.less']
        }
    },

    // -- CSSMin Config --------------------------------------------------------

    cssmin: {
        options: {
            // report: 'gzip'
        },

        files: {
            expand: true,
            src   : 'build/**/*.css',
            ext   : '-min.css'
        }
    },

    // -- Compress Config ------------------------------------------------------

    compress: {
        release: {
            options: {
                archive: 'release/<%= pkg.version %>/<%= pkg.name %>-<%= pkg.version %>.zip'
            },

            expand : true,
            flatten: true,
            src    : 'build/*.css',
            dest   : '<%= pkg.name %>/'
        }
    },

    // -- License Config -------------------------------------------------------

    license: {
        build: {
            options: {
                banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
            },

            expand: true,
            src   : ['build/*.css']
        }
    },

    // -- Watch/Observe Config -------------------------------------------------

    observe: {
        src: {
            files: 'less/*/*/*.less',
            tasks: ['test', 'suppress', 'default'],

            options: {
                interrupt: true
            }
        }
    }

  });

  // -- Main Tasks ---------------------------------------------------------------
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-recess');

  grunt.registerTask('default', [
      'clean:build',
      'less:build',
      'concat:build',
      'cssmin',
      'concat:all',
      'concat:allcore',
      'license'
  ]);

  grunt.registerTask('skin', [
    'clean:skin_build',
    'less:skin_build'
  ]);

  grunt.registerTask('test', [
      'recess'
  ]);

  // Makes the `watch` task run a build first.
  grunt.renameTask('watch', 'observe');
  grunt.registerTask('watch', ['default', 'observe']);

  grunt.registerTask('release', [
      'test',
      'default',
      'clean:release',
      'compress:release'
  ]);



  // -- Suppress Task ------------------------------------------------------------

  grunt.registerTask('suppress', function () {
      var allowed = ['success', 'fail', 'warn', 'error'];

      grunt.util.hooker.hook(grunt.log, {
          passName: true,

          pre: function (name) {
              if (allowed.indexOf(name) === -1) {
                  grunt.log.muted = true;
              }
          },

          post: function () {
              grunt.log.muted = false;
          }
      });
  });

  // -- License Task -------------------------------------------------------------

  grunt.registerMultiTask('license', 'Stamps license banners on files.', function () {
      var options = this.options({banner: ''}),
          banner  = grunt.template.process(options.banner),
          tally   = 0;

      this.files.forEach(function (filePair) {
          filePair.src.forEach(function (file) {
              grunt.file.write(file, banner + grunt.file.read(file));
              tally += 1;
          });
      });

      grunt.log.writeln('Stamped license on ' + String(tally).cyan + ' files.');
  });
};

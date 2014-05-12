module.exports = function(grunt) {
    'use strict';
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        fileName: 'search-nico',
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: {
                src: ['search-nico.min.js']
            },
        },

        jshint: {
            files: ['gruntfile.js', 'search-nico.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        uglify: {
            options: {
                banner: '/*! search-nico-js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: '<%= fileName %>.js',
                dest: '<%= fileName %>.min.js'
            }
        },

        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },

        jsdoc : {
            dist : {
                src: ['search-nico.js', 'README.md'],
                options: {
                    dest: 'doc',
                    configure: 'jsdoc-config.json',
                }
            }
        }
    });

    grunt.registerTask('default', ['clean', 'jshint', 'uglify']);

    grunt.registerTask('build', ['default', 'jsdoc']);
};

var babel = require('rollup-plugin-babel');

module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-rollup');

    grunt.initConfig({
        ts: {
            default: {
                tsconfig: true, 
                options: {
                    fast: 'never' // this doesn't use the tsconfig structure, and therefore omits typings/
                }
            }
        },     
        rollup: {
            options: {
                format: 'cjs',
                plugins: [
                    babel({
                        exclude: './node_modules/**',
                        presets: ['es2015-rollup']
                    })
                ]
            },
            default: {
                'src' : 'build/main.js',
                'dest': 'dist/main.js'
            },
        },
        screeps: {
            options: {
                email: process.env.SCREEPS_EMAIL,
                password: process.env.SCREEPS_PASSWORD,
                branch: 'default',
                ptr: false
            },
            default: {
                src: ['dist/main.js']
            }
        }
    });

    grunt.registerTask('build', ['ts']);
    grunt.registerTask('dist', ['rollup', 'screeps']);
    grunt.registerTask('default', ['build', 'dist']);
}

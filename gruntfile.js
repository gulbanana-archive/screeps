module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        exec: {
            compile: "tsc",
            mangleRefsToActors: "sed -i s/'\\.\\/actors\\//'/g\ dist/*.js",
            mangleActorRefs: "sed -i s/'\\.\.\\//'/g\ dist/actors/*.js",
            mangleRefs: "sed -i s/'\\.\\//'/g\ dist/*.js dist/actors/*.js",
        },
        screeps: {
            options: {
                email: process.env.SCREEPS_EMAIL,
                password: process.env.SCREEPS_PASSWORD,
                branch: 'default',
                ptr: false
            },
            dist: {
                src: ['dist/*.js', 'dist/actors/*.js']
            }
        }
    });

    grunt.registerTask('default', ['exec', 'screeps']);
}

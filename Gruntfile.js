module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      dist: {
        files: {
          "<%= pkg.name %>.min.js": ["<%= pkg.name %>.js"]
        }
      }
    },
    jshint: {
      files: ["<%= pkg.name %>.js"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("default", ["jshint", "uglify"]);
};
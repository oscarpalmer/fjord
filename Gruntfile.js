module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      dist: {
        files: {
          "dist/<%= pkg.name %>.js": ["src/<%= pkg.name %>.js"]
        }
      }
    },
    jshint: {
      files: ["src/<%= pkg.name %>.js"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("default", ["jshint", "uglify"]);
};
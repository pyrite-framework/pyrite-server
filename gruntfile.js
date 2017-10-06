module.exports = (grunt) => {
  grunt.initConfig({
    ts: {
      app: {
        files: [ {
          src: ['./example/\*\*/\*.ts', '!example/.baseDir.ts'],
          dest: './lib'
        }],
        options: {
          module: 'commonjs',
          target: 'es6',
          sourceMap: true,
          rootDir: '.',
          experimentalDecorators: true
        }
      }
    },
    watch: {
      ts: {
        files: ['src/\*\*/\*.ts', 'example/\*\*/\*.ts'],
        tasks: ['ts']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ts');

  grunt.registerTask('default', [
    'ts',
    'watch'
  ]);
};
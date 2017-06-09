/**
* Precedent Meta-templating Web Build Package
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/
var _Version    = require('./package.json').version;

var libGulp        = require('gulp');

var libBrowserify  = require('browserify');
var libBabelify    = require('babelify');
var libVinylSource = require('vinyl-source-stream');
var libVinylBuffer = require('vinyl-buffer');
var libUglify      = require('gulp-uglify');
var libRename      = require('gulp-rename');
var libSourceMaps  = require('gulp-sourcemaps');
var libRunSequence = require('run-sequence');

libGulp.task('copy-latest-release', ['build-release'],
    ()=>
    {
        libGulp.src('./dist/precedent.'+_Version+'.min.js')
            .pipe(libRename('precedent.latest.min.js'))
            .pipe(libGulp.dest('./dist'));
    });

libGulp.task('build-release',
    ()=>
    {
        // app.js is your main JS file with all your module inclusions
        return libBrowserify({entries: './source/Precedent', debug: false})
            .transform("babelify", { presets: ["es2015"] })
            .bundle()
            .pipe(libVinylSource('precedent.'+_Version+'.min.js'))
            .pipe(libVinylBuffer())
            .pipe(libSourceMaps.init())
            .pipe(libUglify())
            .pipe(libSourceMaps.write('./'))
            .pipe(libGulp.dest('./dist'));
    }
);

libGulp.task('build-debug',
    ()=>
    {
        return libBrowserify({entries: './source/Precedent', debug: true})
            .transform("babelify", { presets: ["es2015"] })
            .bundle()
            .pipe(libVinylSource('precedent.'+_Version+'.js'))
            .pipe(libVinylBuffer())
            .pipe(libGulp.dest('./dist'));
    }
);

libGulp.task('build', ['build-release','build-debug','copy-latest-release']);

libGulp.task('build',
    (fCallback) =>
    {
        libRunSequence(['build-debug', 'build-release'],
            'copy-latest-release',
            fCallback);
    }
);

libGulp.task('default', ['build']);
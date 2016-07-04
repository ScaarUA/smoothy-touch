var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    cleanCss = require('gulp-clean-css'),
    argv = require('yargs').argv,
    gulpIf = require('gulp-if'),
    size = require('gulp-size');

gulp.task('compile:css', () => {
    return gulp.src('src/styles/index.sass')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulpIf(argv.production, cleanCss({compatibility: 'ie8'})))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});

gulp.task('compile:js', () => {
    return gulp.src('src/js/smoothy-touch.js')
        .pipe(gulpIf(argv.production, uglify()))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});

gulp.task('compile:html', () => {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});

gulp.task('dev', ['compile:css', 'compile:js', 'compile:html'], () => {
    browserSync.init({
        server: {
            baseDir: './dist/',
            logLevel: 'debug',
            ghostMode: false
        }
    });

    gulp.watch('src/**/*.sass', ['compile:css']);
    gulp.watch('src/**/*.js', ['compile:js']);
    gulp.watch('src/index.html', ['compile:html']);
});

gulp.task('build', ['compile:css', 'compile:js', 'compile:html'], () => {
    return gulp.src('dist/**/*')
        .pipe(size({
            title: 'SIZE OF',
            showFiles: true,
            showTotal: false
        }))
        .pipe(gulp.dest('dist'))
});
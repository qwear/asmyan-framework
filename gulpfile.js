"use strict";

const { src, dest, parallel, watch, series } = require('gulp'); // Gulp
const sass 			= require('gulp-sass'); 			// Sass
const autoprefixer 	= require('gulp-autoprefixer'); 	// Добовление автопрефиксеров для Css
const cssconcat 	= require('gulp-concat-css'); 		// Объеденение Css
const cleanCSS 		= require('gulp-clean-css'); 		// Cжатие Css
const uglify 		= require('gulp-uglify'); 			// Для сжатия JavaScript
const concat 		= require('gulp-concat'); 			// Объеденение JavaScript
const browserSync 	= require('browser-sync').create(); // Перезагрузка сайта ари изменении
const pug 			= require('gulp-pug'); 				// Html шаблонизатор pug
const rename 		= require("gulp-rename"); 			// Переименования файлов
const del 			= require('del');    				// Удаление папок
const imagemin     = require('gulp-imagemin'); 			// Pабота с изображениями
const pngquant     = require('imagemin-pngquant'); 		// Pабота с png
const cache        = require('gulp-cache'); 			// Кеширование

// Ссылки на 'CSS' библиотек
const cssLibsFiles = [
	'app/libs/normalize.css/normalize.css',
	'app/libs/bootstrap/dist/css/bootstrap-grid.min.css'
];

// Ссылки на 'JavaScript' библиотек
const jsLibsFiles = [
	'app/libs/jquery/dist/jquery.js'
];

// Автоперезагрузка сайта
function browserSyncReload() {
    browserSync.init({
        server: {
            baseDir: "app/"
        },
        notify:false
    });
}

// Преобразование 'Pug' в 'HTML'
function pugHtml () {
	return src('app/views/*.pug')
		.pipe(pug({pretty: true}))
		.pipe(dest('app/'))
		.pipe(browserSync.stream());
}

// Scss - css
function sassCss () {
  	return src('app/sass/*.scss')
  		.pipe(sass({outputStyle: "expanded"}))
  		.pipe(autoprefixer(['last 15 versions', '> 0.1%'], { cascade: true }))
  		.pipe(dest('app/css'))
  		.pipe(cleanCSS({level: 2}))
  		.pipe(rename({ suffix: ".min" }))
  		.pipe(dest('app/css'))
  		.pipe(browserSync.stream())
  		.pipe(browserSync.stream());
}

// Объединение 'CSS' библиотек
function cssLibs () {
	return src(cssLibsFiles)
		.pipe(concat('libs.css'))
		.pipe(dest('app/css'))
		.pipe(cleanCSS({level: 2}))
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('app/css'));
}

// Объединение 'JavaScript' библиотек, сжатие 'common.js'
async function js () {
	// Объединение 'JavaScript' библиотек
	const jsLibs = src(jsLibsFiles)
		.pipe(concat('libs.js'))
		.pipe(dest('app/js'))
		.pipe(uglify({
			toplevel: true
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('app/js'));

	// Cжатие 'common.js'
	const jsCommon = src('app/js/common.js')
		.pipe(uglify({
			toplevel: true
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('app/js'));
}

// Сжатие кртинок
function imgOptimized () {
	return src('app/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(dest('dist/img'));
}

// Перезапуск gulp
function watchFiles() {
	watch("app/sass/*.scss", sassCss);
	watch("app/js/**/*.js").on('change', browserSync.reload);
	watch("app/views/**/*.pug", pugHtml).on('change', browserSync.reload);
}


// Удаление папки 'dist' при сборки
function cleanBuildProjectFolder () {
	return del.sync('dist');
}

// Сборка продакшна
async function buildProject () {

	// Перемещаем все 'css' файлы с папки 'app' в папку 'dist'
	const buildProjectCssLibs = src('app/css/**/*.css')
		.pipe(dest('dist/css'));

	// Перемещаем все 'js' файлы с папки 'app' в папку 'dist'
	const buildProjectJsLibs = src('app/js/**/*.js')
		.pipe(dest('dist/js'));

	// Перемещаем все 'fonts' файлы с папки 'app' в папку 'dist'
	const buildProjectFonts = src('app/fonts/**/*')
		.pipe(dest('dist/fonts/'));

	// Перемещаем все 'html' файлы с папки 'app' в папку 'dist'
	const buildProjectHtml = src('app/*.html')
		.pipe(dest('dist/'));

}

// Экспорты
exports.default 		= parallel(pugHtml, sassCss, cssLibs, js, watchFiles, browserSyncReload);
exports.builderProject 	= parallel(buildProject, imgOptimized, cleanBuildProjectFolder);

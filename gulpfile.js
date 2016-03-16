/*
 sass的编译（gulp-sass）
 自动添加css前缀（gulp-autoprefixer）
 压缩css（gulp-minify-css）
 js代码校验（gulp-jshint）
 合并js文件（gulp-concat）
 压缩js代码（gulp-uglify）
 压缩图片（gulp-imagemin）
 自动刷新页面（gulp-livereload）
 图片缓存，只有图片替换了才压缩（gulp-cache）
 注释（gulp-notify）
 文件重命名 （gulp-rename）
 自动加载（gulp-load-plugins）
 生成sourcemaps（gulp-sourcemaps）
 任务执行顺序（gulp-sequence 和 run-sequence）圆括号里面串行，中括号里面并行
 html压缩（gulp-minify-html）
 图片压缩（gulp-imagemin）
 gulp-rev给文件添加MD5后缀
 gulp-rev-collector，将MD5更新到html中
 gulp-order,文件合并时的顺序
 ------------------------------------
 npm install gulp-sass --save-dev
 npm install gulp-autoprefixer --save-dev
 npm install gulp-minify-css --save-dev
 npm install gulp-jshint --save-dev
 npm install gulp-concat --save-dev
 npm install gulp-uglify --save-dev
 npm install gulp-imagemin --save-dev
 npm install gulp-notify --save-dev
 npm install gulp-rename --save-dev
 npm install gulp-livereload --save-dev
 npm install gulp-cache --save-dev
 npm install gulp-load-plugins --save-dev
 npm install gulp-sourcemaps --save-dev
 npm install --save-dev gulp-sequence
 npm install --save-dev run-sequence
 npm install --save-dev gulp-minify-html
 npm install --save-dev gulp-imagemin
 npm gulp-order --save-dev
 npm install --save-dev gulp-rev
 npm install --save-dev gulp-rev-collector
 ----------------------------------------
 */
//加载任务
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();//自动加载插件，调用时用驼峰命名
var gulpSequence = require('run-sequence');//按顺序执行任务
var order = require("gulp-order");


//构建输出的文件夹
var Url = {
    App: {//开发目录
        Root: 'app',     //开发目录
        Sass: 'app/sass',//开发中的sass所在的目录
        Js: 'app/js',    //开发目录中的js目录
        Css: 'app/style' //开发目录中的css目录
    },
    View: {//视图目录，用于浏览测试
        Root: 'app',
        Js: 'app/scripts',
        Css: 'app/css'
    },
    Demo: {//最后输出的目录
        Root: 'demo',
        Js: 'demo/scripts',
        Css: 'demo/css'
    }
};

//----------------------------------------------------
//处理的文件或文件夹,根据项目配置
//----------------------------------------------------
//依赖的框架
var JsFrame = {
    InFile: [//构建处理的js文件
        Url.App.Js + '/jquery/*.js',
        //排除项
        '!' + Url.App.Js + '/jquery/*.min.js'
    ],
    OutFile: {//构建输出的文件名
        Concat: 'jquery.concat.js',//框架合并后的文件
        Min: 'jquery.min.js'//框架合并压缩后的文件
    }
};
//自定义JS
var JsPlugins = {
    InFile: [//自定义JS
        Url.App.Js + '/' + '*.js',
        //排除项
        '!' + Url.App.Js + '/' + '*.*.js',
        '!' + Url.App.Js + '/' + 'jquery*.js',
        '!' + Url.App.Js + '/' + 'all*.js',
        '!' + Url.App.Js + '/' + 'js*.js'
    ],
    OutFile: {//构建输出的文件名
        Concat: 'myjs.concat.js',  //自定义JS合并后的文件
        Min: 'myjs.min.js', //自定义JS合并、压缩后的文件
        All: 'all.concat.js',//自定义JS+JS框架合并后的文件
        AllMin: 'all.min.js'//自定义JS+JS框架、压缩合并后的文件
    }
};

//SASS文件
var SassFile = {
    InFile: [//sass文件
        Url.App.Sass + '/' + '*.scss',
        //排除项
        '!' + Url.App.Sass + '/' + '_*.scss',
        '!' + Url.App.Sass + '/' + 'scss.scss',
        '!' + Url.App.Sass + '/' + 'css.scss',
        '!' + Url.App.Sass + '/' + 'all.scss'
    ],
    OutFile: {//构建输出的文件名
        Concat: 'css.concat.css', //sass编译合并后输出的文件
        Min: 'css.min.css'//sass编译合并、压缩后输出的文件
    },
    Order: {
        FromFile: Url.App.Sass + '/' + 'all.scss',//编译带import的sass文件，可sass合并时的排序问题。
        OutFile: 'css.css',
        OutMinFile: 'css.min.css'
    }
};

//----------------------------------------------------
//help任务
//----------------------------------------------------
gulp.task('?', function () {
    console.log('\n');
    console.log('gulp help                      任务说明');
    console.log('gulp js                        检查、合并、压缩所有js');
    console.log('gulp concat-css                编译、合并、压缩sass');
    console.log('gulp css                       all.scss的引用顺序编译');
    console.log('gulp watch-alljs               监控myjs,有变化[watch-concat-js]');
    console.log('gulp watch-allcss              监控sass,有变化[concat-css]');
    console.log('gulp watch                     监控所有的sass和js，有变化就编译合并');
    console.log('+-------------------------------------------------------------------+');
    console.log('+                                                                   +');
    console.log('+                                                                   +');
    console.log('+                开发时，开启监控：gulp watch                       +');
    console.log('+                发布时，生成demo：gulp up                          +');
    console.log('+                                                                   +');
    console.log('+                                                                   +');
    console.log('+-------------------------------------------------------------------+');
    console.log('\n');
});

//------------------------------------------------------
//以下为任务列表
//------------------------------------------------------

//合并Jquery+cookie
gulp.task('concat-jquery', function () {
    return gulp.src(JsFrame.InFile) // 匹配文件
        .pipe(plugins.concat(JsFrame.OutFile.Concat, {newLine: ';\n//注释：文件分割\n'}))//合并后的文件名
        .pipe(gulp.dest(Url.View.Js));  // 输出路径
});
//合并Jquery+cookie，并进行压缩
gulp.task('min-jquery', ['concat-jquery'], function () {
    return gulp.src(Url.View.Js + '/' + JsFrame.OutFile.Concat) // 匹配文件夹
        .pipe(plugins.uglify())//压缩
        .pipe(plugins.rename(JsFrame.OutFile.Min))//重命名
        .pipe(gulp.dest(Url.View.Js));  // 输出
});
//合并js
gulp.task('concat-js', function () {
    return gulp.src(JsPlugins.InFile) // 匹配文件
        .pipe(plugins.concat(JsPlugins.OutFile.Concat, {newLine: '\n//注释：文件分割\n'}))//合并后的文件名
        .pipe(plugins.jshint())//JS检查
        .pipe(plugins.jshint.reporter('default'))//检验后输出错误
        .pipe(gulp.dest(Url.View.Js));  // 输出
});
//合并js，并进行压缩
gulp.task('min-js',['concat-js'], function () {
    return gulp.src(Url.View.Js + '/' + JsPlugins.OutFile.Concat) // 匹配文件//
        .pipe(plugins.uglify())//压缩JS
        .pipe(plugins.rename(JsPlugins.OutFile.Min))//重命名
        .pipe(gulp.dest(Url.View.Js));  // 输出
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//手动合并、压缩所有的JS,包括JS框架和自定义JS
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
gulp.task('js', ['min-jquery', 'min-js'], function () {//[为任务依赖，依赖的任务必须return]
    return gulp.src([Url.View.Js + '/' + JsFrame.OutFile.Min,Url.View.Js + '/' + JsPlugins.OutFile.Min]) // 匹配文件
        .pipe(order([
            Url.View.Js + '/' + JsFrame.OutFile.Min,
            Url.View.Js + '/' + JsPlugins.OutFile.Min
        ]))
        .pipe(plugins.concat(JsPlugins.OutFile.All, {newLine: '\n//注释：文件分割\n'}))//合并后的文件名
        .pipe(plugins.uglify())//压缩JS
        .pipe(plugins.rename(JsPlugins.OutFile.AllMin))//重命名
        .pipe(gulp.dest(Url.View.Js));//- 输出文件
});

gulp.task('watch-concat-js', function () {//[为任务依赖，依赖的任务必须return]
    gulp.src([Url.View.Js + '/' + JsFrame.OutFile.Min,Url.View.Js + '/' + JsPlugins.OutFile.Min]) // 匹配文件
        .pipe(order([
            Url.View.Js + '/' + JsFrame.OutFile.Min,
            Url.View.Js + '/' + JsPlugins.OutFile.Min
        ]))
        .pipe(plugins.concat(JsPlugins.OutFile.All, {newLine: ';\n//注释：文件分割\n'}))//合并后的文件名
        .pipe(plugins.uglify())//压缩JS
        .pipe(plugins.rename(JsPlugins.OutFile.AllMin))//重命名
        .pipe(gulp.dest(Url.View.Js));//- 输出文件
});
//监控js变化
gulp.task('watch-js', function () {
    return gulp.watch(JsPlugins.InFile, function () {
        gulp.src(JsPlugins.InFile) // 匹配文件
            .pipe(plugins.concat(JsPlugins.OutFile.Concat, {newLine: '\n//注释：文件分割\n'}))//合并后的文件名
            .pipe(gulp.dest(Url.View.Js)) // 输出
            .pipe(plugins.uglify())//压缩JS
            .pipe(plugins.rename(JsPlugins.OutFile.Min))//重命名
            .pipe(gulp.dest(Url.View.Js)); // 输出
    });
});

gulp.task('watch-script', function () {
    return gulp.watch(Url.View.Js + '/' + JsPlugins.OutFile.Min, ['watch-concat-js']);
});


//监视所有的js
gulp.task('watch-alljs', ['js'],function(){
    gulp.run('watch-js','watch-script');
});

//+-----------------------------------+
//以下编译和监控sass
//+-----------------------------------+


//sass编译处理
gulp.task('sass', function () {
    return gulp.src(SassFile.InFile) // 匹配文件夹
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({//指定生成不同版本的css前缀
            browsers: ['last 2 versions', 'Android >= 4.0', 'last 3 Explorer versions', "opera 15"],
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest(Url.App.Css))  // 输出
        .pipe(plugins.concat(SassFile.OutFile.Concat))//合并后的文件名
        .pipe(gulp.dest(Url.View.Css))  // 输出
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename(SassFile.OutFile.Min))
        .pipe(gulp.dest(Url.View.Css));  // 输出
});

//按import顺序的sass合并,编译，压缩,项目输出时根据all.scss中的import顺序编译输出css.css
gulp.task('css', function () {
    gulp.src(SassFile.Order.FromFile) // 匹配文件
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({//指定生成不同版本的css前缀
            browsers: ['last 2 versions', 'Android >= 4.0', 'last 3 Explorer versions', "opera 15"],
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest(Url.App.Css))  // 输出
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename(SassFile.Order.OutMinFile))
        .pipe(gulp.dest(Url.App.Css));  // 输出
});


//压缩html，压缩功暂时关闭，可做文件复制功能
gulp.task('min-html', function () {
    gulp.src(Url.App.Root + '*.html') // 要压缩的html文件
        //.pipe(plugins.minifyHtml()) //压缩
        .pipe(gulp.dest(Url.Demo.Root + '/'));
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//  监视任务
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
gulp.task('watch-sass', function () {
    return gulp.watch(SassFile.InFile, function (event) {
        var str = event.path;
        str = str.substring(str.lastIndexOf('\\') + 1);
        gulp.src(Url.App.Sass + '/' + str) // 匹配文件
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.autoprefixer({//指定生成不同版本的css前缀
                browsers: ['last 2 versions', 'Android >= 4.0', 'last 3 Explorer versions', "opera 15"],
                remove: true //是否去掉不必要的前缀 默认：true
            }))
            .pipe(gulp.dest(Url.App.Css)); // 输出
    });
});

//监视sass变化后，立即解析变化的sass文件，之后再合并、压缩
gulp.task('concat-css',['sass'], function () {
    return gulp.src([
            Url.App.Css + '/' + '*.css',
            '!' + Url.App.Css + '/' + '*.*.css',
            '!' + Url.App.Css + '/' + 'all.css',
            '!' + Url.App.Css + '/' + 'scss.css',
            '!' + Url.App.Css + '/' + 'css.css'])
        .pipe(plugins.concat(SassFile.OutFile.Concat))//合并后的文件名
        .pipe(gulp.dest(Url.View.Css))  // 输出
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename(SassFile.Order.OutMinFile))
        .pipe(gulp.dest(Url.View.Css));
});



gulp.task('watch-css', function () {
    return gulp.watch(
        [Url.App.Css + '/' + '*.css',
            '!' + Url.App.Css + '/' + '*.*.css',
            '!' + Url.App.Css + '/' + 'all.css',
            '!' + Url.App.Css + '/' + 'scss.css',
            '!' + Url.App.Css + '/' + 'css.css'], ['concat-css'])
});

//监视所有的css
gulp.task('watch-allcss', ['sass'],function(){
    gulp.run('watch-sass','watch-css');
});






//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//发布时，CSS静态文件md5
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//清理MD5生成的css
gulp.task('clean-css', function () {
    return gulp.src(Url.View.Css + '/css-*.min.css', {read: false})
        .pipe(plugins.clean());
});
//css文件MD5
gulp.task('rev-c',['clean-css'], function () {
    return gulp.src([
            Url.View.Css + '/' + SassFile.Order.OutMinFile
        ])
        .pipe(plugins.rev())
        .pipe(gulp.dest(Url.View.Css))                               //- 输出文件本地
        .pipe(plugins.rev.manifest())                               //- 生成一个rev-manifest.json
        .pipe(gulp.dest(Url.View.Root + '/rev/css'));                       //- 将 rev-manifest.json 保存到 rev 目录内
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//发布时，JS静态文件md5
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//清理MD5生成的js
gulp.task('clean-js', function () {
    return gulp.src(Url.View.Js+ '/all-*.min.js')
        .pipe(plugins.clean());
});
//监视sass变化后，立即解析变化的sass文件，之后再合并、压缩
gulp.task('rev-j', ['clean-js'], function () {
    return gulp.src([
            Url.View.Js+ '/'+JsPlugins.OutFile.AllMin
        ])
        .pipe(plugins.rev())
        .pipe(gulp.dest(Url.View.Js))                               //- 输出文件本地
        .pipe(plugins.rev.manifest())                               //- 生成一个rev-manifest.json
        .pipe(gulp.dest(Url.View.Root + '/rev/js'));                       //- 将 rev-manifest.json 保存到 rev 目录内
});

//按md5，修改文件中的css样式表路径
gulp.task('rev',['rev-c','rev-j'], function () {
    return gulp.src([Url.View.Root + '/rev/*/*.json', Url.App.Root + '/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(plugins.revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest(Url.Demo.Root));                     //- 替换后的文件输出的目录
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
////以下为发布项目---命令gulp up
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//可做文件复制功能
gulp.task('up-html', function () {
    return gulp.src([Url.App.Root + '*.html']) // 要压缩的html文件
        .pipe(gulp.dest(Url.Demo.Root + '/'));
});
//可做文件复制功能
gulp.task('up-css',['rev'], function () {
    return gulp.src([Url.App.Root + '/css/**']) // 要压缩的html文件
        .pipe(gulp.dest(Url.Demo.Root + '/css'));
});
//可做文件复制功能
gulp.task('up-js',['up-css'], function () {
    return gulp.src([Url.App.Root + '/scripts/**']) // 要压缩的html文件
        .pipe(gulp.dest(Url.Demo.Root + '/scripts'));
});
//可做文件复制功能
gulp.task('up-all',['up-js'], function () {
    gulp.src([Url.App.Root + '/img/**']) // 要压缩的html文件
        .pipe(gulp.dest(Url.Demo.Root + '/img'));
});
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//发布时，所有的静态文件
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('up', ['up-all']);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//开发时，监控所有静态文件的变化
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('watch', [
    'watch-allcss',
    'watch-alljs'
]);
//watch等于'sass','watch-sass', 'watch-css'
//'watch-css' 又等于clean-css,concat-css，rev-css

//默认任务
gulp.task('default', function () {  //每个gulpfile.js里都应当有一个dafault任务，它是缺省任务入口（类似C语言的main()入口），运行gulp的时候实际只是调用该任务（从而来调用其它的任务）
    gulp.run('?');    //执行帮助
});



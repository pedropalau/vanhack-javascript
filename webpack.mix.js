let mix = require('laravel-mix');

const public = (process.env.PUBLIC_PATH || 'public').replace(/\/$/, '')

mix
    .setPublicPath(public)

    .js('main.js', `${public}/main.js`)
    
    .styles('style.css', `${public}/style.css`)
    
    .browserSync({
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || 3000,
        proxy: false,
        server: public,
        files: [ `${public}/**/*` ],
    });
const bootstrap = require('./server/server');

async function runApp() {
    const app = await bootstrap(4000, 'dbHost', 'spare-products')
    return app;
}

(async ()=> {
    await runApp();
})();

module.exports = runApp;
const config = require('config');

function authorize() {
    return (req, res, next) => {
        (async()=> {
            console.log(".... request is authorized...")
            next()
        })()
    }
}

module.exports = authorize;
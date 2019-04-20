const config = require('config');

function authorize() {
    try {
        return (req, res, next) => {
            (async () => {
                const tokenPayload = JSON.parse(req.headers['x-payload-header']),
                    userId = tokenPayload.id,
                    userRole = tokenPayload.role,
                    reqResource = req.route.path,
                    reqMethod = req.method.toLowerCase(),
                    roles = config.get('acl.roles');

                for (let role in roles) {
                    if (role === userRole) {
                        const roleObj = roles[role],
                            allowedResources = roleObj.resources,
                            allowedPermissions = roleObj.permissions;


                        if (allowedResources.includes(reqResource) && allowedPermissions.includes(reqMethod)) {
                            next();
                        } else {
                            return res.json({ msg: "Insufficient permissions to access resource" }) // 403
                        }
                        break;
                    }
                } 
            })()
        }
    } catch (e) {
    }
}

module.exports = authorize;
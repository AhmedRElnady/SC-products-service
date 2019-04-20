module.exports = {
    MS: {
        product: {
           url: "http://localhost:4000",
           prefix: "products"
        },
        cart: {
           url: "http://localhost:5000",
           prefix: "shopping-carts"
        }
     },
     acl: {
        roles: {
           ADMIN: {
              resources: [
                  "/",
                  "/:id"
              ],
              permissions: ["post", "patch", "delete"]
           }, 
           CUSTOMER: {
              resources: [],
              permissions: []
           }
        }
     }
}
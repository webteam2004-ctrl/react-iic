import assert from "node:assert/strict";
import { requirePermission } from "./src/middlewares/rbac.middleware.js";

const runMiddleware = (admin, module, action) => {
    const response = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    let nextCalled = false;
    requirePermission(module, action)({ admin }, response, () => {
        nextCalled = true;
    });
    return { response, nextCalled };
};

const missingAuth = runMiddleware(undefined, "contact_messages", "read");
assert.equal(missingAuth.response.statusCode, 401);
assert.equal(missingAuth.nextCalled, false);

const insufficient = runMiddleware(
    { role: "admin", permissions: { contact_messages: ["read"] } },
    "contact_messages",
    "update"
);
assert.equal(insufficient.response.statusCode, 403);
assert.equal(insufficient.nextCalled, false);

const authorized = runMiddleware(
    { role: "admin", permissions: { manage_home: ["read", "update"] } },
    "manage_home",
    "update"
);
assert.equal(authorized.response.statusCode, null);
assert.equal(authorized.nextCalled, true);

const superAdmin = runMiddleware(
    { role: "super_admin", permissions: {} },
    "manage_home",
    "delete"
);
assert.equal(superAdmin.response.statusCode, null);
assert.equal(superAdmin.nextCalled, true);

console.log("RBAC middleware checks passed: 401, 403, authorized access, super-admin bypass.");

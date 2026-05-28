import assert from "node:assert/strict";
import { canShowAdminNav } from "../src/components/layout/adminNavState";

assert.equal(canShowAdminNav({ role: "ADMIN" }), true, "admins can see admin navigation");
assert.equal(canShowAdminNav({ role: "BUYER" }), false, "buyers cannot see admin navigation");
assert.equal(canShowAdminNav({ role: "SELLER" }), false, "sellers cannot see admin navigation");
assert.equal(canShowAdminNav(null), false, "anonymous users cannot see admin navigation");

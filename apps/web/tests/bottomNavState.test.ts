import assert from "node:assert/strict";
import { isBottomNavActive } from "../src/components/layout/bottomNavState";

assert.equal(isBottomNavActive("/", "/"), true, "home is active on the homepage");
assert.equal(isBottomNavActive("/listings", "/"), false, "home is not active on listings");
assert.equal(isBottomNavActive("/me/settings", "/me"), true, "nested account pages keep account active");
assert.equal(isBottomNavActive("/messages", "/messages"), true, "messages is active on messages");

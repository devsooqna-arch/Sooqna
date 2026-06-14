import assert from "node:assert/strict";
import { listingStatusLabel, listingConditionLabel, iconActionLabel } from "../src/lib/listingUiLabels";

assert.equal(listingStatusLabel("pending"), "بانتظار المراجعة", "pending status should never render as PENDING");
assert.equal(listingStatusLabel("published"), "منشور", "published status should be Arabic");
assert.equal(listingConditionLabel("new"), "جديد", "new condition should have one clear Arabic label");
assert.equal(listingConditionLabel("used"), "مستعمل", "used condition should have one clear Arabic label");

assert.equal(iconActionLabel("message"), "مراسلة البائع", "message icon buttons should have an Arabic accessible label");
assert.equal(iconActionLabel("favorite-add"), "إضافة إلى المفضلة", "favorite icon buttons should describe the add action");
assert.equal(iconActionLabel("favorite-remove"), "إزالة من المفضلة", "favorite icon buttons should describe the remove action");

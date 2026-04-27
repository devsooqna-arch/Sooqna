import { wpExactRedirects, wpPatternRedirects } from "../wp-redirects.mjs";

const exactCount = wpExactRedirects.length;
const patternCount = wpPatternRedirects.length;
const totalCount = exactCount + patternCount;

console.log(
  `[redirects] valid: exact=${exactCount}, patterns=${patternCount}, total=${totalCount}`
);

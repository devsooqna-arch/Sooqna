import { shouldExposeDeveloperRoutes } from "./securityPolicy";

describe("route exposure policy", () => {
  it("does not expose developer routes in production", () => {
    expect(shouldExposeDeveloperRoutes("production")).toBe(false);
  });

  it("exposes developer routes outside production", () => {
    expect(shouldExposeDeveloperRoutes("development")).toBe(true);
    expect(shouldExposeDeveloperRoutes("test")).toBe(true);
  });
});

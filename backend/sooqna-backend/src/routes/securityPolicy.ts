export function shouldExposeDeveloperRoutes(nodeEnv: string): boolean {
  return nodeEnv !== "production";
}

export function shouldExposeApiDocs(nodeEnv: string): boolean {
  return nodeEnv !== "production";
}

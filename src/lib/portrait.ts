export type Portrait = { src: string; width: number; height: number };

// Numeric account id, so a username change cannot point the site at someone else's image.
export const AVATAR_HOST = "avatars.githubusercontent.com";
export const AVATAR_PATH = "/u/2903699";
export const AVATAR_URL = `https://${AVATAR_HOST}${AVATAR_PATH}?v=4`;
const AVATAR_SIZE = 460;
const REVISION_LENGTH = 16;

// Shown only when GitHub cannot be reached and no earlier check is cached.
export const FALLBACK_PORTRAIT: Portrait = { src: "/images/mohamed-shez-enhanced.png", width: 1024, height: 1024 };

/**
 * Builds the portrait from avatar response headers only: no profile fields are read.
 * GitHub's avatar URL never changes when the photo does, so its content-hash ETag is
 * added to the URL. A new photo then gets a new image-optimizer and browser cache key.
 */
export function portraitFromResponse(response: Pick<Response, "ok" | "headers">): Portrait | null {
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return null;
  const revision = response.headers.get("etag")?.replace(/^W\//, "").replace(/[^a-zA-Z0-9]/g, "").slice(0, REVISION_LENGTH);
  return { src: revision ? `${AVATAR_URL}&rev=${revision}` : AVATAR_URL, width: AVATAR_SIZE, height: AVATAR_SIZE };
}

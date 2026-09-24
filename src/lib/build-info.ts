import "server-only";
import build from "@/generated/build-info.json";

// Explicit whitelist: no environment variables or credentials enter this DTO.
export const buildInfo = {
  version: build.version,
  commit: build.commit,
  builtAt: build.builtAt,
  tag: build.tag,
  tagUrl: build.tagUrl,
};

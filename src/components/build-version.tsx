import { buildInfo } from "@/lib/build-info";

export function BuildVersion() {
  return <div className="mt-2 font-code text-[.65rem] text-muted" data-testid="build-version">
    {buildInfo.tagUrl
      ? <a href={buildInfo.tagUrl} target="_blank" rel="noopener noreferrer" aria-label={`View build ${buildInfo.version} on GitHub`}>{buildInfo.version} ↗</a>
      : <span>{buildInfo.version}</span>}
  </div>;
}

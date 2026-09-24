/**
 * Allocate above existing semantic releases (including legacy build tags).
 * O(t) time, O(1) extra space for t tag names. CI serializes releases;
 * GitHub createRef is the final atomic guard and never overwrites a tag.
 * @param {string} base
 * @param {string[]} tags
 */
export function nextReleaseVersion(base, tags) {
  const parse = (/** @type {string} */ value) => value.split('.').map(Number);
  if (!/^\d+\.\d+\.\d+$/.test(base)) throw new Error('Invalid package version');
  let next = parse(base);
  for (const tag of tags) {
    const match = /^v(\d+\.\d+\.\d+)(?:-build\.\d+\.\d+)?$/.exec(tag);
    if (!match) continue;
    const used = parse(match[1]);
    if (used.some(n => !Number.isSafeInteger(n))) throw new Error('Version exceeds safe integer range');
    if (used[0] > next[0] || (used[0] === next[0] && (used[1] > next[1] || (used[1] === next[1] && used[2] >= next[2])))) {
      next = [used[0], used[1], used[2] + 1];
    }
  }
  if (next.some(n => !Number.isSafeInteger(n))) throw new Error('Version exceeds safe integer range');
  return `v${next.join('.')}`;
}

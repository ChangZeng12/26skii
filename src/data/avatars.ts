/**
 * 头像缩略图索引：文件名 → 构建后的 URL。
 * 缩略图由 scripts/make-avatars.py 从 src/icon/ 的原图生成；原图不会被打包。
 */
const files = import.meta.glob<string>('../assets/avatars/*.jpg', { eager: true, query: '?url', import: 'default' });

const AVATAR_URLS: ReadonlyMap<string, string> = new Map(
  Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1), url]),
);

export const avatarUrl = (file: string | undefined): string | undefined =>
  file === undefined ? undefined : AVATAR_URLS.get(file);

/**
 * 外部链接。Google Maps 用官方的 Maps URLs 格式（无需 API key）：
 * https://developers.google.com/maps/documentation/urls/get-started#search-action
 *
 * 用文本搜索而不是经纬度：坐标只会落一个无名图钉，文本搜索会打开雪场本身的地点卡片
 * （营业时间、路线、评价）。默认查询是「雪场名 + ski resort + 州代码」，州代码用来区分同名雪场
 * （Hidden Valley 在 PA 和 MO 各有一个）。2026-10-05 逐个核对过：默认查询对少数雪场
 * 打不开地点卡片或会跳到别处（Killington-Pico 会跳到 Pico），这些在数据里用 mapsQuery 覆盖。
 */
export interface MapsTarget {
  name: string;
  state: string;
  mapsQuery?: string;
}

export function googleMapsQuery({ name, state, mapsQuery }: MapsTarget): string {
  if (mapsQuery) return mapsQuery;
  // 名字里已经有 Resort / Ski 就不再重复，避免「Liberty Mountain Resort ski resort」这种查询
  const subject = /\b(resort|ski)\b/i.test(name) ? name : `${name} ski resort`;
  return `${subject}, ${state}`;
}

export function googleMapsUrl(target: MapsTarget): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsQuery(target))}`;
}

/** 'https://www.skicb.com/' → 'skicb.com'：按钮上显示域名，让人点之前就知道会去哪 */
export function displayHost(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

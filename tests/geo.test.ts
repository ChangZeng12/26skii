import { describe, expect, it } from 'vitest';
import { boundsOf, centroid, groupByProximity, isInsidePadding, mercatorPixels, occlusionPadding } from '../src/lib/geo';
import { ORIGINS } from '../src/lib/data';
import { ORIGIN_MERGE_PX } from '../src/components/map/map-config';

const pt = (x: number, y: number) => ({ x, y });

describe('groupByProximity', () => {
  it('传递合并：A 近 B、B 近 C，则三者同组；远处的点单独成组', () => {
    const items = ['a', 'b', 'c', 'far'] as const;
    const pos = { a: pt(0, 0), b: pt(8, 0), c: pt(16, 0), far: pt(100, 0) };
    expect(groupByProximity(items, (i) => pos[i], 10)).toEqual([['a', 'b', 'c'], ['far']]);
  });

  it('保持输入顺序，结果可作稳定 key', () => {
    const pos = [pt(50, 0), pt(0, 0), pt(52, 0)];
    expect(groupByProximity([0, 1, 2], (i) => pos[i] ?? pt(0, 0), 5)).toEqual([[0, 2], [1]]);
  });
});

describe('mercatorPixels', () => {
  it('缩放每加 1 级，两点像素距离翻倍', () => {
    const d = (z: number) => {
      const a = mercatorPixels([-74, 40.7], z);
      const b = mercatorPixels([-71, 42.4], z);
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    expect(d(5) / d(4)).toBeCloseTo(2, 6);
  });
});

describe('出发地合并（agents.md §2：东北四地在全美视野下不能互相压盖）', () => {
  const groupsAt = (zoom: number) =>
    groupByProximity(ORIGINS, (o) => mercatorPixels(o.coords, zoom), ORIGIN_MERGE_PX).map((g) => g.map((o) => o.id));

  it('全美视野（约 zoom 3.7）下，阿灵顿与巴尔的摩合并，旧金山、里诺和麦迪逊各自独立', () => {
    const groups = groupsAt(3.7);
    expect(groups).toContainEqual(['sf']);
    expect(groups).toContainEqual(['reno']);
    expect(groups).toContainEqual(['madison']);
    expect(groups.find((g) => g.includes('arlington-va'))).toContain('baltimore');
  });

  it('放大到 zoom 9 时各出发地全部分开', () => {
    expect(groupsAt(9)).toHaveLength(ORIGINS.length);
  });
});

describe('occlusionPadding', () => {
  const viewport = { width: 1440, height: 900 };

  it('左侧栏、右侧详情卡、底部面板分别计入对应方向', () => {
    const p = occlusionPadding(
      viewport,
      [
        { left: 16, top: 16, right: 360, bottom: 884 },
        { left: 1000, top: 16, right: 1360, bottom: 500 },
      ],
      24,
    );
    expect(p).toEqual({ top: 24, right: 464, bottom: 24, left: 384 });
  });

  it('横跨底部的面板计入 bottom', () => {
    const p = occlusionPadding({ width: 390, height: 844 }, [{ left: 8, top: 450, right: 382, bottom: 836 }], 24);
    expect(p.bottom).toBe(844 - 450 + 24);
  });

  it('面板挤满屏幕时按比例收缩，至少留 20% 给地图', () => {
    const p = occlusionPadding(
      { width: 1000, height: 800 },
      [
        { left: 0, top: 0, right: 450, bottom: 800 },
        { left: 520, top: 0, right: 1000, bottom: 600 },
      ],
      24,
    );
    expect(p.left + p.right).toBeCloseTo(800, 6);
  });

  it('isInsidePadding', () => {
    const padding = { top: 10, right: 10, bottom: 10, left: 300 };
    expect(isInsidePadding(pt(200, 100), viewport, padding)).toBe(false);
    expect(isInsidePadding(pt(700, 100), viewport, padding)).toBe(true);
  });
});

describe('boundsOf / centroid', () => {
  it('包围盒与中心', () => {
    expect(boundsOf([[-120, 39], [-105, 40], [-72, 44]])).toEqual([[-120, 39], [-72, 44]]);
    expect(centroid([[-77, 39], [-76, 39.5]])).toEqual([-76.5, 39.25]);
  });
});

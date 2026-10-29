// 가격(원)·배우 태그 입력 검증/정규화 — 생성(POST)·수정(PATCH) 공용
export function parsePriceActors(
  price: unknown,
  actors: unknown,
): { price: number | null; actors: string[] } | { error: string } {
  let priceVal: number | null = null;
  if (price != null && price !== '') {
    priceVal = Math.trunc(Number(price));
    if (!Number.isFinite(priceVal) || priceVal < 0 || priceVal > 100_000_000) {
      return { error: '가격이 올바르지 않습니다.' };
    }
  }
  const list = Array.isArray(actors)
    ? [...new Set(actors.map((a) => String(a).trim()).filter(Boolean))].slice(0, 20)
    : [];
  if (list.some((a) => a.length > 40)) return { error: '배우 이름이 너무 깁니다.' };
  return { price: priceVal, actors: list };
}

// 캐스팅보드 이미지 → 출연 배우 이름 추출 (Gemini 비전, REST 호출). 단건·일괄 공용
const MODEL = 'gemini-2.0-flash';

const PROMPT =
  '이 공연 캐스팅보드 이미지에서 출연 배우의 사람 이름만 뽑아 JSON 문자열 배열로 반환해. ' +
  '역할명·극장·날짜·제목·제작진은 제외하고 배우 본명만. 찾지 못하면 빈 배열. 예: ["강유희","선유하"]';

export async function extractCastFromImage(url: string): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error('이미지를 불러오지 못했습니다.');
  const mime = imgRes.headers.get('content-type') || 'image/jpeg';
  const data = Buffer.from(await imgRes.arrayBuffer()).toString('base64');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data } }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  let arr: unknown;
  try { arr = JSON.parse(text); } catch { arr = []; }
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((a) => String(a).trim()).filter(Boolean))]
    .filter((a) => a.length <= 40)
    .slice(0, 20);
}

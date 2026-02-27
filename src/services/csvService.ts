export async function parseCSV(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Fetch 실패");
  }

  const text = await res.text();
  const lines = text.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV 구조가 올바르지 않습니다.");
  }

  const headers = lines[0].split(",").map(h => h.trim());

  const idIndex = headers.indexOf("id");
  const nameIndex = headers.indexOf("name");

  if (idIndex === -1 || nameIndex === -1) {
    throw new Error("CSV에 id, name 컬럼이 필요합니다.");
  }

  return lines.slice(1).map((line) => {
    const columns = line.split(",");
    return {
      id: columns[idIndex]?.trim(),
      name: columns[nameIndex]?.trim(),
    };
  });
}

export async function getPeopleFromGoogle(url: string) {
  return parseCSV(url);
}
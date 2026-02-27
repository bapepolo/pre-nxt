const GOOGLE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRV_PA9HvlFXUA01jpvPa3gr92VKaKt25jAWKc6QoFU4SCFwG_04WVlMNB60o621aKaIZh7Lj2tOyU/pub?gid=0&single=true&output=csv";

async function parseCSV(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("CSV fetch 실패");
  }

  const text = await res.text();

  return text
    .trim()
    .split("\n")
    .slice(1)
    .filter(row => row.length > 0)
    .map(row => {
      const [id, name] = row.split(",");
      return {
        id: id?.trim(),
        name: name?.trim(),
      };
    });
}

export async function getPeopleFromLocal() {
  return parseCSV("/people.csv");
}

export async function getPeopleFromGoogle(url: string) {
  return parseCSV(url);
}

export type DataSource = "local" | "google";

export async function getPeople(
  source: DataSource,
  googleUrl?: string,
) {
  if (source === "local") {
    return getPeopleFromLocal();
  }

  if (!googleUrl) {
    throw new Error("Google URL이 필요합니다.");
  }

  return getPeopleFromGoogle(googleUrl);
}

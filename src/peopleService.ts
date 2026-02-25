export async function getPeople() {
  const res = await fetch("/people.csv");
  const text = await res.text();

  return text
    .split("\n")
    .slice(1)
    .map(row => {
      const [id, name] = row.split(",");
      return { id, name };
    });
}
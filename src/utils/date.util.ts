
export function fillMissingDates(data: any[], days: number, key: string) {
  const existing = data.map(d =>
    new Date(d.date).toISOString().split("T")[0]
  );

  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateStr = date.toISOString().split("T")[0];

    if (!existing.includes(dateStr)) {
      data.push({
        date: new Date(dateStr),
        [key]: 0
      });
    }
  }

  return data.sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
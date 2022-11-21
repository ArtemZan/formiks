export function NumberWithCommas(x: any) {
  return !isNaN(x) && typeof x === "number"
    ? x
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "";
}

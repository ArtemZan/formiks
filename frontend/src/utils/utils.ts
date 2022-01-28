export function numberWithCommas(x: number) {
  return !isNaN(x)
    ? x
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "";
}

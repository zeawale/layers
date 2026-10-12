// «1 вещь», «2 вещи», «5 вещей»
export default function itemsWord(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'вещь'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вещи'
  return 'вещей'
}

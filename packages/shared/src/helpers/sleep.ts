export default async function (seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

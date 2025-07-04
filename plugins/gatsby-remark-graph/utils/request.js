export const get = async (url) => {
  const result = await fetch(url).then((v) => v.text());
  return result;
};
export const post = async ({ url, ...param }) => {
  const result = fetch(url, {
    method: "POST",
    ...param,
  }).then((v) => v.text());
  return result;
};

export default {
  get,
};

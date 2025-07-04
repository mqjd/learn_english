import fs from "fs/promises";

const readFile = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");
  return data;
};

const isFileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
};

export const readFileIfExists = async (filePath) => {
  const exists = await isFileExists(filePath);
  if (exists) {
    const content = await readFile(filePath);
    return content;
  }
  return null;
};

const KuroutoSikou = [
  '玄'.charCodeAt(0),
  '人'.charCodeAt(0),
  '志'.charCodeAt(0),
  '向'.charCodeAt(0),
] as const;

/**
 * asciiおよび玄, 人, 志, 向の文字をフィルタする
 */
export const filterAsciiAndKuroutoSikou = (c: string) => {
  const charCode = c.charCodeAt(0);

  if (charCode <= 127) {
    return true;
  }

  return KuroutoSikou.find(e => e === charCode) !== undefined
}

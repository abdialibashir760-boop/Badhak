import strings from "./strings.json";

/** On-screen text for the active language (scripts/use_lang.sh copies strings.<lang>.json here). */
export const T = strings as {
  lang: string; relief: string; question: string; title: string[]; guilt: string; danger: string; say: string; final: string; logo: string;
};

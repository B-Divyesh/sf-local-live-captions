export type CaptionLine = { at: number; end: number; text: string; translated?: string };

export const SAMPLE_LINES: CaptionLine[] = [
  { at: 0, end: 4, text: "Today we will trace how a star changes over its lifetime.", translated: "Heute verfolgen wir, wie sich ein Stern im Laufe seines Lebens verändert." },
  { at: 5, end: 9, text: "Gravity pulls the cloud inward while pressure pushes back.", translated: "Die Schwerkraft zieht die Wolke nach innen, während der Druck dagegenhält." },
  { at: 10, end: 14, text: "That balance can last for billions of years.", translated: "Dieses Gleichgewicht kann Milliarden von Jahren bestehen." },
  { at: 15, end: 20, text: "Please stop me if the diagram is unclear.", translated: "Bitte unterbrechen Sie mich, wenn das Diagramm unklar ist." }
];

export function toSrt(lines: CaptionLine[]): string {
  const stamp = (seconds: number) => `00:00:${String(Math.floor(seconds)).padStart(2, "0")},000`;
  return lines.map((line, index) => `${index + 1}\n${stamp(line.at)} --> ${stamp(line.end)}\n${line.text}`).join("\n\n") + "\n";
}

export function toTxt(lines: CaptionLine[]): string {
  return lines.map((line) => line.text).join("\n") + "\n";
}

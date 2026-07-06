import {
  Briefcase,
  Keyboard,
  Landmark,
  Languages,
  Palette,
  Printer,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  keyboard: Keyboard,
  printer: Printer,
  landmark: Landmark,
  palette: Palette,
  languages: Languages,
  briefcase: Briefcase,
} as const;

export type ServiceIconKey = keyof typeof ICONS;

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as ServiceIconKey] ?? Briefcase;
  return <Icon {...props} />;
}

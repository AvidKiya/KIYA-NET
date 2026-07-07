import {
  Briefcase, Car, GraduationCap, Keyboard, Landmark, Languages,
  Palette, Printer, Scale, Shield, TrendingUp, type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  keyboard: Keyboard, printer: Printer, landmark: Landmark,
  palette: Palette, languages: Languages, briefcase: Briefcase,
  scale: Scale, "graduation-cap": GraduationCap, "trending-up": TrendingUp,
  car: Car, shield: Shield,
};

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Briefcase;
  return <Icon {...props} />;
}

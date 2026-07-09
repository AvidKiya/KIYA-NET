import type { LucideProps } from "lucide-react";
import {
  Briefcase, Brain, Car, CheckCircle2, ChevronDown, Circle, Clock3, Coffee, Copy,
  CreditCard, FileCheck2, FileText, FolderLock, GraduationCap, HeartHandshake, Home,
  Info, Landmark, LayoutGrid, Mail, MapPin, Menu, MessageCircle, MessageSquareText,
  Palette, Phone, PlusCircle, Rocket, Scale, Search, Shield, ShieldCheck, Sparkles,
  Star, TrendingUp, UploadCloud, User, Wallet, Zap,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Briefcase, Brain, Car, CheckCircle2, ChevronDown, Circle, Clock3, Coffee, Copy,
  CreditCard, FileCheck2, FileText, FolderLock, GraduationCap, HeartHandshake, Home,
  Info, Landmark, LayoutGrid, Mail, MapPin, Menu, MessageCircle, MessageSquareText,
  Palette, Phone, PlusCircle, Rocket, Scale, Search, Shield, ShieldCheck, Sparkles,
  Star, TrendingUp, UploadCloud, User, Wallet, Zap,
};

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] || Circle;
  return <Icon {...props} />;
}

export interface CutMenuItem {
  name: string;
  description?: string;
  priceCents: number | null;
  review?: string;
}
export interface CutMenuCategory {
  id: string;
  title: string;
  subtitle: string;
  items: CutMenuItem[];
}

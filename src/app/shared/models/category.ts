import { CategoryType } from './article';

export interface Category {
  id: CategoryType;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  featured: boolean;
  articleCount: number;
}

export interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
}

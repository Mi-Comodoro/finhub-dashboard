export interface MenuItem {
  name: string;
  icon: string;
  path: string;
  isActive?: boolean;
}

export interface NavigationSectionProps {
  /** Section title */
  title: string;
  /** Menu items for this section */
  items: MenuItem[];
  /** Custom classes */
  className?: string;
}

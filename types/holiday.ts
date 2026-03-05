export interface Holiday {
  id: string;
  name: string;
  description: string;
  category: string;
  countryCode?: string;
  countryName?: string;
  date: string | null;
  daysUntil: number | null;
  enabled: boolean;
  reminderOffsets: number[];
  reminderTime: string;
  hasPreference: boolean;
}

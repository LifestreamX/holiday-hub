// Nager.Date API Service
// https://date.nager.at/

const NAGER_API_BASE = 'https://date.nager.at/api/v3';

export interface NagerHoliday {
  date: string; // YYYY-MM-DD format
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export interface NagerCountryInfo {
  countryCode: string;
  name: string;
}

/**
 * Fetch public holidays for a specific year and country from Nager.Date API
 */
export async function fetchPublicHolidays(
  year: number,
  countryCode: string,
): Promise<NagerHoliday[]> {
  try {
    const response = await fetch(
      `${NAGER_API_BASE}/PublicHolidays/${year}/${countryCode}`,
    );

    if (!response.ok) {
      throw new Error(
        `Nager.Date API error: ${response.status} ${response.statusText}`,
      );
    }

    const holidays: NagerHoliday[] = await response.json();
    return holidays;
  } catch (error) {
    console.error('Error fetching holidays from Nager.Date:', error);
    throw error;
  }
}

/**
 * Fetch available countries from Nager.Date API
 */
export async function fetchAvailableCountries(): Promise<NagerCountryInfo[]> {
  try {
    const response = await fetch(`${NAGER_API_BASE}/AvailableCountries`);

    if (!response.ok) {
      throw new Error(
        `Nager.Date API error: ${response.status} ${response.statusText}`,
      );
    }

    const countries: NagerCountryInfo[] = await response.json();
    return countries;
  } catch (error) {
    console.error('Error fetching countries from Nager.Date:', error);
    throw error;
  }
}

/**
 * Convert Nager.Date holiday to our database format
 */
export function convertNagerHolidayToDbFormat(nagerHoliday: NagerHoliday) {
  // Parse date parts directly from the YYYY-MM-DD string to avoid timezone issues
  const [year, monthStr, dayStr] = nagerHoliday.date.split('-');
  const month = parseInt(monthStr, 10); // 1-12
  const day = parseInt(dayStr, 10); // 1-31

  // Determine category based on types
  let category = 'public';
  if (nagerHoliday.types.includes('Public')) {
    category = 'federal';
  } else if (nagerHoliday.types.includes('Bank')) {
    category = 'bank';
  } else if (nagerHoliday.types.includes('School')) {
    category = 'school';
  } else if (nagerHoliday.types.includes('Authorities')) {
    category = 'government';
  } else if (nagerHoliday.types.includes('Optional')) {
    category = 'optional';
  } else if (nagerHoliday.types.includes('Observance')) {
    category = 'observance';
  }

  // Determine if holiday is truly calculated (like Easter, Good Friday)
  // or if it's just observed differently (fixed date holidays)
  const calculatedHolidays = [
    'easter',
    'good friday',
    'mardi gras',
    'ash wednesday',
    'ascension',
    'pentecost',
    'corpus christi',
    'palm sunday',
  ];

  const isCalculated = calculatedHolidays.some((calc) =>
    nagerHoliday.name.toLowerCase().includes(calc),
  );

  return {
    name: nagerHoliday.name,
    description: nagerHoliday.localName || nagerHoliday.name,
    category,
    ruleType: isCalculated ? 'calculated' : 'fixed',
    month: isCalculated ? null : month,
    day: isCalculated ? null : day,
    weekday: null,
    nth: null,
    countryCode: nagerHoliday.countryCode,
  };
}

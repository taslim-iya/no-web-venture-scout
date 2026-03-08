export type Business = {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: number;
  reviewCount: number;
  hasWebsite: false;
  employees?: string;
  yearEstablished?: number;
  email?: string;
};

export const CATEGORIES = [
  "All Categories",
  "Restaurant",
  "Plumber",
  "Electrician",
  "Auto Repair",
  "Hair Salon",
  "Dentist",
  "Lawyer",
  "Accountant",
  "Bakery",
  "Florist",
  "Dry Cleaning",
  "Pet Grooming",
  "Landscaping",
  "Cleaning Service",
  "Contractor",
];

export const MOCK_CITIES = [
  "Austin, TX",
  "Denver, CO",
  "Nashville, TN",
  "Phoenix, AZ",
  "Portland, OR",
  "Charlotte, NC",
  "Tampa, FL",
  "Las Vegas, NV",
];

const generateBusinesses = (): Business[] => [
  {
    id: "1",
    name: "Garcia's Auto Repair",
    category: "Auto Repair",
    address: "1420 S Congress Ave",
    city: "Austin",
    state: "TX",
    phone: "(512) 448-2291",
    rating: 4.7,
    reviewCount: 312,
    hasWebsite: false,
    employees: "5-10",
    yearEstablished: 1998,
  },
  {
    id: "2",
    name: "Rosa's Pastry & Cakes",
    category: "Bakery",
    address: "834 E 6th St",
    city: "Austin",
    state: "TX",
    phone: "(512) 555-0184",
    rating: 4.9,
    reviewCount: 541,
    hasWebsite: false,
    employees: "2-5",
    yearEstablished: 2011,
  },
  {
    id: "3",
    name: "Mike's Plumbing Solutions",
    category: "Plumber",
    address: "2200 N Lamar Blvd",
    city: "Austin",
    state: "TX",
    phone: "(512) 555-0371",
    rating: 4.5,
    reviewCount: 89,
    hasWebsite: false,
    employees: "1-5",
    yearEstablished: 2005,
  },
  {
    id: "4",
    name: "Elite Hair & Beauty Studio",
    category: "Hair Salon",
    address: "3405 Guadalupe St",
    city: "Austin",
    state: "TX",
    phone: "(512) 555-0247",
    rating: 4.6,
    reviewCount: 278,
    hasWebsite: false,
    employees: "5-10",
    yearEstablished: 2015,
  },
  {
    id: "5",
    name: "Sunshine Cleaning Co.",
    category: "Cleaning Service",
    address: "901 Red River St",
    city: "Austin",
    state: "TX",
    phone: "(512) 555-0193",
    rating: 4.8,
    reviewCount: 167,
    hasWebsite: false,
    employees: "10-20",
    yearEstablished: 2008,
  },
  {
    id: "6",
    name: "Rocky Mountain Electric",
    category: "Electrician",
    address: "1550 Blake St",
    city: "Denver",
    state: "CO",
    phone: "(720) 555-0142",
    rating: 4.4,
    reviewCount: 56,
    hasWebsite: false,
    employees: "5-10",
    yearEstablished: 2002,
  },
  {
    id: "7",
    name: "Patel's Corner Diner",
    category: "Restaurant",
    address: "2801 Larimer St",
    city: "Denver",
    state: "CO",
    phone: "(720) 555-0388",
    rating: 4.3,
    reviewCount: 423,
    hasWebsite: false,
    employees: "10-20",
    yearEstablished: 2007,
  },
  {
    id: "8",
    name: "Country Blooms Florist",
    category: "Florist",
    address: "441 Broadway",
    city: "Nashville",
    state: "TN",
    phone: "(615) 555-0291",
    rating: 4.9,
    reviewCount: 198,
    hasWebsite: false,
    employees: "2-5",
    yearEstablished: 2013,
  },
  {
    id: "9",
    name: "Desert Sun Landscaping",
    category: "Landscaping",
    address: "5200 N 7th St",
    city: "Phoenix",
    state: "AZ",
    phone: "(602) 555-0419",
    rating: 4.6,
    reviewCount: 134,
    hasWebsite: false,
    employees: "10-25",
    yearEstablished: 2003,
  },
  {
    id: "10",
    name: "Martinez & Sons Contractors",
    category: "Contractor",
    address: "780 SW Morrison St",
    city: "Portland",
    state: "OR",
    phone: "(503) 555-0276",
    rating: 4.7,
    reviewCount: 87,
    hasWebsite: false,
    employees: "15-30",
    yearEstablished: 1995,
  },
  {
    id: "11",
    name: "Furry Friends Pet Grooming",
    category: "Pet Grooming",
    address: "120 S Tryon St",
    city: "Charlotte",
    state: "NC",
    phone: "(704) 555-0334",
    rating: 4.8,
    reviewCount: 256,
    hasWebsite: false,
    employees: "5-10",
    yearEstablished: 2016,
  },
  {
    id: "12",
    name: "Bay Area Dry Cleaners",
    category: "Dry Cleaning",
    address: "3211 Henderson Blvd",
    city: "Tampa",
    state: "FL",
    phone: "(813) 555-0162",
    rating: 4.2,
    reviewCount: 78,
    hasWebsite: false,
    employees: "2-5",
    yearEstablished: 2001,
  },
  {
    id: "13",
    name: "Rivera Dental Care",
    category: "Dentist",
    address: "4500 S Maryland Pkwy",
    city: "Las Vegas",
    state: "NV",
    phone: "(702) 555-0483",
    rating: 4.5,
    reviewCount: 189,
    hasWebsite: false,
    employees: "5-15",
    yearEstablished: 2009,
  },
  {
    id: "14",
    name: "Thompson Law Office",
    category: "Lawyer",
    address: "621 17th St",
    city: "Denver",
    state: "CO",
    phone: "(720) 555-0529",
    rating: 4.4,
    reviewCount: 42,
    hasWebsite: false,
    employees: "1-5",
    yearEstablished: 2000,
  },
  {
    id: "15",
    name: "Nashville Tax & Accounting",
    category: "Accountant",
    address: "1900 Church St",
    city: "Nashville",
    state: "TN",
    phone: "(615) 555-0318",
    rating: 4.6,
    reviewCount: 93,
    hasWebsite: false,
    employees: "2-10",
    yearEstablished: 2006,
  },
  {
    id: "16",
    name: "Sunset Taqueria",
    category: "Restaurant",
    address: "7100 N Lamar Blvd",
    city: "Austin",
    state: "TX",
    phone: "(512) 555-0755",
    rating: 4.8,
    reviewCount: 892,
    hasWebsite: false,
    employees: "10-25",
    yearEstablished: 2014,
  },
  {
    id: "17",
    name: "Alpine Hair Studio",
    category: "Hair Salon",
    address: "2100 Market St",
    city: "Denver",
    state: "CO",
    phone: "(720) 555-0617",
    rating: 4.7,
    reviewCount: 341,
    hasWebsite: false,
    employees: "5-10",
    yearEstablished: 2012,
  },
  {
    id: "18",
    name: "Speedy Gonzalez Auto",
    category: "Auto Repair",
    address: "890 Gallatin Ave",
    city: "Nashville",
    state: "TN",
    phone: "(615) 555-0824",
    rating: 4.3,
    reviewCount: 147,
    hasWebsite: false,
    employees: "5-10",
    yearEstablished: 2010,
  },
];

export const allBusinesses = generateBusinesses();

export const searchBusinesses = (city: string, category: string): Business[] => {
  let results = [...allBusinesses];

  if (city && city.trim()) {
    const cityLower = city.toLowerCase();
    results = results.filter(
      (b) =>
        b.city.toLowerCase().includes(cityLower) ||
        b.state.toLowerCase().includes(cityLower) ||
        `${b.city}, ${b.state}`.toLowerCase().includes(cityLower)
    );
  }

  if (category && category !== "All Categories") {
    results = results.filter((b) => b.category === category);
  }

  return results;
};

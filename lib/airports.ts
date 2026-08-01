export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};

/** Common Umrah / Pakistan / Gulf / transit airports (IATA). */
export const AIRPORTS: Airport[] = [
  // Pakistan
  { code: "ISB", name: "Islamabad International", city: "Islamabad", country: "Pakistan" },
  { code: "LHE", name: "Allama Iqbal International", city: "Lahore", country: "Pakistan" },
  { code: "KHI", name: "Jinnah International", city: "Karachi", country: "Pakistan" },
  { code: "PEW", name: "Bacha Khan International", city: "Peshawar", country: "Pakistan" },
  { code: "MUX", name: "Multan International", city: "Multan", country: "Pakistan" },
  { code: "LYP", name: "Faisalabad International", city: "Faisalabad", country: "Pakistan" },
  { code: "SKT", name: "Sialkot International", city: "Sialkot", country: "Pakistan" },
  { code: "UET", name: "Quetta International", city: "Quetta", country: "Pakistan" },
  { code: "GWD", name: "Gwadar International", city: "Gwadar", country: "Pakistan" },
  { code: "PZH", name: "Zhob Airport", city: "Zhob", country: "Pakistan" },
  { code: "CJL", name: "Chitral Airport", city: "Chitral", country: "Pakistan" },
  { code: "GIL", name: "Gilgit Airport", city: "Gilgit", country: "Pakistan" },
  { code: "KDU", name: "Skardu Airport", city: "Skardu", country: "Pakistan" },
  { code: "BHV", name: "Bahawalpur Airport", city: "Bahawalpur", country: "Pakistan" },
  { code: "DEA", name: "Dera Ghazi Khan Airport", city: "Dera Ghazi Khan", country: "Pakistan" },
  { code: "DSK", name: "Dera Ismail Khan Airport", city: "Dera Ismail Khan", country: "Pakistan" },
  { code: "RWP", name: "Benazir Bhutto Intl (legacy)", city: "Rawalpindi", country: "Pakistan" },
  { code: "WNS", name: "Nawabshah Airport", city: "Nawabshah", country: "Pakistan" },
  { code: "PJB", name: "Panjgur Airport", city: "Panjgur", country: "Pakistan" },
  { code: "TTI", name: "Turbat International", city: "Turbat", country: "Pakistan" },
  { code: "ORW", name: "Ormara Airport", city: "Ormara", country: "Pakistan" },
  { code: "JAG", name: "Jacobabad Airport", city: "Jacobabad", country: "Pakistan" },
  { code: "SUL", name: "Sui Airport", city: "Sui", country: "Pakistan" },
  { code: "HDD", name: "Hyderabad Airport", city: "Hyderabad", country: "Pakistan" },
  { code: "RAZ", name: "Rawalakot Airport", city: "Rawalakot", country: "Pakistan" },
  { code: "XJM", name: "Mangla Airport", city: "Mangla", country: "Pakistan" },
  { code: "ATG", name: "Attock Airport", city: "Attock", country: "Pakistan" },
  { code: "BHC", name: "Bhurban Heliport", city: "Bhurban", country: "Pakistan" },
  { code: "WGB", name: "Bahawalnagar Airport", city: "Bahawalnagar", country: "Pakistan" },
  { code: "SDT", name: "Saidu Sharif Airport", city: "Saidu Sharif", country: "Pakistan" },
  { code: "HRA", name: "Mansehra Airport", city: "Mansehra", country: "Pakistan" },
  { code: "DBA", name: "Dalbandin Airport", city: "Dalbandin", country: "Pakistan" },
  { code: "KDD", name: "Khuzdar Airport", city: "Khuzdar", country: "Pakistan" },
  { code: "MJD", name: "Moenjodaro Airport", city: "Mohenjo-daro", country: "Pakistan" },
  { code: "SYW", name: "Sehwan Sharif Airport", city: "Sehwan", country: "Pakistan" },
  { code: "PAJ", name: "Parachinar Airport", city: "Parachinar", country: "Pakistan" },

  // Saudi Arabia
  { code: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia" },
  { code: "MED", name: "Prince Mohammad Bin Abdulaziz", city: "Madinah", country: "Saudi Arabia" },
  { code: "RUH", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia" },
  { code: "DMM", name: "King Fahd International", city: "Dammam", country: "Saudi Arabia" },
  { code: "AHB", name: "Abha International", city: "Abha", country: "Saudi Arabia" },
  { code: "TIF", name: "Taif International", city: "Taif", country: "Saudi Arabia" },
  { code: "YNB", name: "Yanbu Airport", city: "Yanbu", country: "Saudi Arabia" },
  { code: "GIZ", name: "Jazan Airport", city: "Jazan", country: "Saudi Arabia" },
  { code: "TUU", name: "Tabuk Airport", city: "Tabuk", country: "Saudi Arabia" },
  { code: "ELQ", name: "Prince Nayef Bin Abdulaziz", city: "Qassim", country: "Saudi Arabia" },
  { code: "HAS", name: "Hail Airport", city: "Hail", country: "Saudi Arabia" },
  { code: "AJF", name: "Al-Jawf Airport", city: "Al-Jawf", country: "Saudi Arabia" },
  { code: "EAM", name: "Nejran Airport", city: "Najran", country: "Saudi Arabia" },
  { code: "ULH", name: "Al Ula Airport", city: "Al Ula", country: "Saudi Arabia" },
  { code: "WAE", name: "Wadi al-Dawasir Airport", city: "Wadi al-Dawasir", country: "Saudi Arabia" },
  { code: "RAE", name: "Arar Airport", city: "Arar", country: "Saudi Arabia" },
  { code: "RSI", name: "Red Sea International", city: "Red Sea", country: "Saudi Arabia" },
  { code: "NUM", name: "Neom Bay Airport", city: "Neom", country: "Saudi Arabia" },
  { code: "SHW", name: "Sharurah Airport", city: "Sharurah", country: "Saudi Arabia" },
  { code: "BHH", name: "Bisha Airport", city: "Bisha", country: "Saudi Arabia" },
  { code: "AQI", name: "Qaisumah/Hafr Al Batin", city: "Qaisumah", country: "Saudi Arabia" },
  { code: "URY", name: "Gurayat Airport", city: "Gurayat", country: "Saudi Arabia" },
  { code: "DWD", name: "Dawadmi Airport", city: "Dawadmi", country: "Saudi Arabia" },
  { code: "EJH", name: "Wedjh Airport", city: "Al Wajh", country: "Saudi Arabia" },
  { code: "HOF", name: "Al-Ahsa Airport", city: "Al-Ahsa", country: "Saudi Arabia" },
  { code: "RAH", name: "Rafha Airport", city: "Rafha", country: "Saudi Arabia" },
  { code: "TUI", name: "Turaif Airport", city: "Turaif", country: "Saudi Arabia" },
  { code: "ZUL", name: "Zilfi Airport", city: "Zilfi", country: "Saudi Arabia" },
  { code: "KMC", name: "King Khaled Military City", city: "King Khaled Military City", country: "Saudi Arabia" },

  // UAE
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "UAE" },
  { code: "DWC", name: "Al Maktoum International", city: "Dubai", country: "UAE" },
  { code: "AUH", name: "Zayed International", city: "Abu Dhabi", country: "UAE" },
  { code: "SHJ", name: "Sharjah International", city: "Sharjah", country: "UAE" },
  { code: "RKT", name: "Ras Al Khaimah International", city: "Ras Al Khaimah", country: "UAE" },
  { code: "AAN", name: "Al Ain International", city: "Al Ain", country: "UAE" },
  { code: "FJR", name: "Fujairah International", city: "Fujairah", country: "UAE" },

  // Qatar / Bahrain / Kuwait / Oman
  { code: "DOH", name: "Hamad International", city: "Doha", country: "Qatar" },
  { code: "BAH", name: "Bahrain International", city: "Manama", country: "Bahrain" },
  { code: "KWI", name: "Kuwait International", city: "Kuwait City", country: "Kuwait" },
  { code: "MCT", name: "Muscat International", city: "Muscat", country: "Oman" },
  { code: "SLL", name: "Salalah Airport", city: "Salalah", country: "Oman" },
  { code: "DQM", name: "Duqm International", city: "Duqm", country: "Oman" },
  { code: "SUH", name: "Sur Airport", city: "Sur", country: "Oman" },

  // Turkey
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { code: "SAW", name: "Sabiha Gökçen", city: "Istanbul", country: "Turkey" },
  { code: "ESB", name: "Esenboğa", city: "Ankara", country: "Turkey" },
  { code: "AYT", name: "Antalya Airport", city: "Antalya", country: "Turkey" },
  { code: "ADB", name: "Adnan Menderes", city: "Izmir", country: "Turkey" },
  { code: "ADA", name: "Adana Airport", city: "Adana", country: "Turkey" },
  { code: "TZX", name: "Trabzon Airport", city: "Trabzon", country: "Turkey" },
  { code: "GZT", name: "Gaziantep Airport", city: "Gaziantep", country: "Turkey" },
  { code: "ASR", name: "Erkilet", city: "Kayseri", country: "Turkey" },
  { code: "DLM", name: "Dalaman Airport", city: "Dalaman", country: "Turkey" },
  { code: "BJV", name: "Milas–Bodrum", city: "Bodrum", country: "Turkey" },

  // Egypt / Jordan / Levant
  { code: "CAI", name: "Cairo International", city: "Cairo", country: "Egypt" },
  { code: "HRG", name: "Hurghada International", city: "Hurghada", country: "Egypt" },
  { code: "SSH", name: "Sharm El Sheikh", city: "Sharm El Sheikh", country: "Egypt" },
  { code: "ALY", name: "Alexandria Borg El Arab", city: "Alexandria", country: "Egypt" },
  { code: "LXR", name: "Luxor International", city: "Luxor", country: "Egypt" },
  { code: "AMM", name: "Queen Alia International", city: "Amman", country: "Jordan" },
  { code: "AQJ", name: "King Hussein International", city: "Aqaba", country: "Jordan" },
  { code: "BEY", name: "Beirut–Rafic Hariri", city: "Beirut", country: "Lebanon" },
  { code: "DAM", name: "Damascus International", city: "Damascus", country: "Syria" },
  { code: "ALP", name: "Aleppo International", city: "Aleppo", country: "Syria" },

  // Iran / Iraq / Afghanistan
  { code: "IKA", name: "Imam Khomeini International", city: "Tehran", country: "Iran" },
  { code: "THR", name: "Mehrabad International", city: "Tehran", country: "Iran" },
  { code: "MHD", name: "Mashhad International", city: "Mashhad", country: "Iran" },
  { code: "SYZ", name: "Shiraz International", city: "Shiraz", country: "Iran" },
  { code: "IFN", name: "Isfahan International", city: "Isfahan", country: "Iran" },
  { code: "BGW", name: "Baghdad International", city: "Baghdad", country: "Iraq" },
  { code: "EBL", name: "Erbil International", city: "Erbil", country: "Iraq" },
  { code: "BSR", name: "Basra International", city: "Basra", country: "Iraq" },
  { code: "NJF", name: "Al Najaf International", city: "Najaf", country: "Iraq" },
  { code: "KBL", name: "Kabul International", city: "Kabul", country: "Afghanistan" },

  // India / Bangladesh / Sri Lanka / Nepal
  { code: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", country: "India" },
  { code: "BLR", name: "Kempegowda International", city: "Bengaluru", country: "India" },
  { code: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "India" },
  { code: "MAA", name: "Chennai International", city: "Chennai", country: "India" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose", city: "Kolkata", country: "India" },
  { code: "COK", name: "Cochin International", city: "Kochi", country: "India" },
  { code: "TRV", name: "Trivandrum International", city: "Thiruvananthapuram", country: "India" },
  { code: "GOI", name: "Goa International", city: "Goa", country: "India" },
  { code: "AMD", name: "Sardar Vallabhbhai Patel", city: "Ahmedabad", country: "India" },
  { code: "PNQ", name: "Pune Airport", city: "Pune", country: "India" },
  { code: "JAI", name: "Jaipur International", city: "Jaipur", country: "India" },
  { code: "LKO", name: "Chaudhary Charan Singh", city: "Lucknow", country: "India" },
  { code: "ATQ", name: "Sri Guru Ram Dass Jee", city: "Amritsar", country: "India" },
  { code: "IXC", name: "Chandigarh Airport", city: "Chandigarh", country: "India" },
  { code: "SXR", name: "Sheikh ul-Alam", city: "Srinagar", country: "India" },
  { code: "DAC", name: "Hazrat Shahjalal International", city: "Dhaka", country: "Bangladesh" },
  { code: "CGP", name: "Shah Amanat International", city: "Chittagong", country: "Bangladesh" },
  { code: "CMB", name: "Bandaranaike International", city: "Colombo", country: "Sri Lanka" },
  { code: "KTM", name: "Tribhuvan International", city: "Kathmandu", country: "Nepal" },

  // Malaysia / Indonesia / Singapore / Thailand
  { code: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "SZB", name: "Sultan Abdul Aziz Shah", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "PEN", name: "Penang International", city: "Penang", country: "Malaysia" },
  { code: "JHB", name: "Senai International", city: "Johor Bahru", country: "Malaysia" },
  { code: "BKI", name: "Kota Kinabalu International", city: "Kota Kinabalu", country: "Malaysia" },
  { code: "CGK", name: "Soekarno–Hatta", city: "Jakarta", country: "Indonesia" },
  { code: "DPS", name: "Ngurah Rai", city: "Denpasar", country: "Indonesia" },
  { code: "SUB", name: "Juanda International", city: "Surabaya", country: "Indonesia" },
  { code: "SIN", name: "Singapore Changi", city: "Singapore", country: "Singapore" },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand" },
  { code: "DMK", name: "Don Mueang", city: "Bangkok", country: "Thailand" },
  { code: "HKT", name: "Phuket International", city: "Phuket", country: "Thailand" },

  // Europe hubs
  { code: "LHR", name: "Heathrow", city: "London", country: "United Kingdom" },
  { code: "LGW", name: "Gatwick", city: "London", country: "United Kingdom" },
  { code: "STN", name: "Stansted", city: "London", country: "United Kingdom" },
  { code: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom" },
  { code: "BHX", name: "Birmingham Airport", city: "Birmingham", country: "United Kingdom" },
  { code: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom" },
  { code: "GLA", name: "Glasgow Airport", city: "Glasgow", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { code: "ORY", name: "Orly", city: "Paris", country: "France" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "Spain" },
  { code: "BCN", name: "Barcelona–El Prat", city: "Barcelona", country: "Spain" },
  { code: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome", country: "Italy" },
  { code: "MXP", name: "Milan Malpensa", city: "Milan", country: "Italy" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { code: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland" },
  { code: "VIE", name: "Vienna International", city: "Vienna", country: "Austria" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { code: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden" },
  { code: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "Norway" },
  { code: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { code: "ATH", name: "Athens International", city: "Athens", country: "Greece" },
  { code: "LIS", name: "Humberto Delgado", city: "Lisbon", country: "Portugal" },
  { code: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland" },
  { code: "PRG", name: "Václav Havel", city: "Prague", country: "Czechia" },
  { code: "BUD", name: "Budapest Ferenc Liszt", city: "Budapest", country: "Hungary" },
  { code: "OTP", name: "Henri Coandă", city: "Bucharest", country: "Romania" },
  { code: "SOF", name: "Sofia Airport", city: "Sofia", country: "Bulgaria" },
  { code: "SKG", name: "Thessaloniki Airport", city: "Thessaloniki", country: "Greece" },
  { code: "MSQ", name: "Minsk National", city: "Minsk", country: "Belarus" },
  { code: "SVO", name: "Sheremetyevo", city: "Moscow", country: "Russia" },
  { code: "DME", name: "Domodedovo", city: "Moscow", country: "Russia" },
  { code: "LED", name: "Pulkovo", city: "Saint Petersburg", country: "Russia" },

  // Africa
  { code: "CMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco" },
  { code: "RAK", name: "Marrakech Menara", city: "Marrakech", country: "Morocco" },
  { code: "TUN", name: "Tunis–Carthage", city: "Tunis", country: "Tunisia" },
  { code: "ALG", name: "Houari Boumediene", city: "Algiers", country: "Algeria" },
  { code: "TIP", name: "Tripoli International", city: "Tripoli", country: "Libya" },
  { code: "ADD", name: "Bole International", city: "Addis Ababa", country: "Ethiopia" },
  { code: "NBO", name: "Jomo Kenyatta", city: "Nairobi", country: "Kenya" },
  { code: "JNB", name: "O. R. Tambo", city: "Johannesburg", country: "South Africa" },
  { code: "CPT", name: "Cape Town International", city: "Cape Town", country: "South Africa" },
  { code: "LOS", name: "Murtala Muhammed", city: "Lagos", country: "Nigeria" },
  { code: "ABV", name: "Nnamdi Azikiwe", city: "Abuja", country: "Nigeria" },
  { code: "ACC", name: "Kotoka International", city: "Accra", country: "Ghana" },
  { code: "DSS", name: "Blaise Diagne", city: "Dakar", country: "Senegal" },
  { code: "MRU", name: "Sir Seewoosagur Ramgoolam", city: "Mauritius", country: "Mauritius" },

  // East Asia / Australia
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "Hong Kong" },
  { code: "PEK", name: "Beijing Capital", city: "Beijing", country: "China" },
  { code: "PKX", name: "Beijing Daxing", city: "Beijing", country: "China" },
  { code: "PVG", name: "Shanghai Pudong", city: "Shanghai", country: "China" },
  { code: "CAN", name: "Guangzhou Baiyun", city: "Guangzhou", country: "China" },
  { code: "ICN", name: "Incheon International", city: "Seoul", country: "South Korea" },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "Japan" },
  { code: "HND", name: "Haneda", city: "Tokyo", country: "Japan" },
  { code: "KIX", name: "Kansai International", city: "Osaka", country: "Japan" },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },

  // North America
  { code: "JFK", name: "John F. Kennedy", city: "New York", country: "USA" },
  { code: "EWR", name: "Newark Liberty", city: "Newark", country: "USA" },
  { code: "LGA", name: "LaGuardia", city: "New York", country: "USA" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "USA" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "USA" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "USA" },
  { code: "IAD", name: "Washington Dulles", city: "Washington", country: "USA" },
  { code: "ATL", name: "Hartsfield–Jackson", city: "Atlanta", country: "USA" },
  { code: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "USA" },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "USA" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "USA" },
  { code: "BOS", name: "Logan International", city: "Boston", country: "USA" },
  { code: "SEA", name: "Seattle–Tacoma", city: "Seattle", country: "USA" },
  { code: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "Canada" },
  { code: "YVR", name: "Vancouver International", city: "Vancouver", country: "Canada" },
  { code: "YUL", name: "Montréal–Trudeau", city: "Montreal", country: "Canada" },
  { code: "YYC", name: "Calgary International", city: "Calgary", country: "Canada" },
  { code: "MEX", name: "Mexico City International", city: "Mexico City", country: "Mexico" },

  // Central Asia / Caucasus
  { code: "TAS", name: "Tashkent International", city: "Tashkent", country: "Uzbekistan" },
  { code: "ALA", name: "Almaty International", city: "Almaty", country: "Kazakhstan" },
  { code: "NQZ", name: "Nursultan Nazarbayev", city: "Astana", country: "Kazakhstan" },
  { code: "FRU", name: "Manas International", city: "Bishkek", country: "Kyrgyzstan" },
  { code: "DYU", name: "Dushanbe International", city: "Dushanbe", country: "Tajikistan" },
  { code: "ASB", name: "Ashgabat International", city: "Ashgabat", country: "Turkmenistan" },
  { code: "GYD", name: "Heydar Aliyev", city: "Baku", country: "Azerbaijan" },
  { code: "TBS", name: "Tbilisi International", city: "Tbilisi", country: "Georgia" },
  { code: "EVN", name: "Zvartnots", city: "Yerevan", country: "Armenia" },
];

export function airportLabel(code: string) {
  if (!code) return "";
  const airport = AIRPORTS.find((item) => item.code === code.toUpperCase());
  if (!airport) return code;
  return `${airport.code} — ${airport.city} (${airport.name})`;
}

export function airportShortLabel(code: string) {
  if (!code) return "";
  const airport = AIRPORTS.find((item) => item.code === code.toUpperCase());
  if (!airport) return code;
  return `${airport.code} — ${airport.city}`;
}

export function searchAirports(query: string, limit = 80): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    // Prefer Pakistan + Saudi first when browsing
    const priority = ["Pakistan", "Saudi Arabia", "UAE", "Qatar", "Turkey", "Bahrain", "Kuwait", "Oman"];
    return [...AIRPORTS]
      .sort((a, b) => {
        const ai = priority.indexOf(a.country);
        const bi = priority.indexOf(b.country);
        const ap = ai === -1 ? 99 : ai;
        const bp = bi === -1 ? 99 : bi;
        if (ap !== bp) return ap - bp;
        return a.city.localeCompare(b.city);
      })
      .slice(0, limit);
  }

  return AIRPORTS.filter((airport) => {
    const haystack = `${airport.code} ${airport.name} ${airport.city} ${airport.country}`.toLowerCase();
    return haystack.includes(q);
  }).slice(0, limit);
}

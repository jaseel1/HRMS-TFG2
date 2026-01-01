// 2026 Holiday Data for India
// National holidays are mandatory for all employees
// Regional holidays are state-specific, employees can take max 6 per year

import { STATE_CODE_MAP } from "./constants";

// Helper to convert state codes to full names
const expandStates = (codes: string[]): string[] => {
  return codes.map(code => STATE_CODE_MAP[code] || code).filter(Boolean);
};

export interface HolidayData {
  name: string;
  date: string;
  is_national: boolean;
  is_optional: boolean;
  states: string[] | null;
  holiday_type: "national" | "regional" | "company";
  year: number;
}

// National Holidays (mandatory for all)
export const NATIONAL_HOLIDAYS_2026: HolidayData[] = [
  { name: "Republic Day", date: "2026-01-26", is_national: true, is_optional: false, states: null, holiday_type: "national", year: 2026 },
  { name: "Independence Day", date: "2026-08-15", is_national: true, is_optional: false, states: null, holiday_type: "national", year: 2026 },
  { name: "Gandhi Jayanti", date: "2026-10-02", is_national: true, is_optional: false, states: null, holiday_type: "national", year: 2026 },
];

// Regional/Restricted Holidays (state-specific)
export const REGIONAL_HOLIDAYS_2026: HolidayData[] = [
  // January
  { name: "New Year's Day", date: "2026-01-01", is_national: false, is_optional: true, states: expandStates(["AR", "ML", "MN", "MZ", "NL", "PY", "RJ", "SK", "TG", "TN"]), holiday_type: "regional", year: 2026 },
  { name: "Gaan-Ngai", date: "2026-01-02", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "New Year Holiday", date: "2026-01-02", is_national: false, is_optional: true, states: expandStates(["MZ"]), holiday_type: "regional", year: 2026 },
  { name: "Mannam Jayanti", date: "2026-01-02", is_national: false, is_optional: true, states: expandStates(["KL"]), holiday_type: "regional", year: 2026 },
  { name: "Hazrat Ali Jayanti", date: "2026-01-03", is_national: false, is_optional: true, states: expandStates(["UP"]), holiday_type: "regional", year: 2026 },
  { name: "Missionary Day", date: "2026-01-11", is_national: false, is_optional: true, states: expandStates(["MZ"]), holiday_type: "regional", year: 2026 },
  { name: "Swami Vivekananda Jayanti", date: "2026-01-12", is_national: false, is_optional: true, states: expandStates(["WB"]), holiday_type: "regional", year: 2026 },
  { name: "Makara Sankranti", date: "2026-01-14", is_national: false, is_optional: true, states: expandStates(["AR", "GJ", "KA", "OR", "SK", "TG"]), holiday_type: "regional", year: 2026 },
  { name: "Pongal", date: "2026-01-14", is_national: false, is_optional: true, states: expandStates(["AP", "PY", "TG", "TN"]), holiday_type: "regional", year: 2026 },
  { name: "Magh Bihu", date: "2026-01-15", is_national: false, is_optional: true, states: expandStates(["AS"]), holiday_type: "regional", year: 2026 },
  { name: "Thiruvalluvar Day", date: "2026-01-15", is_national: false, is_optional: true, states: expandStates(["PY", "TN"]), holiday_type: "regional", year: 2026 },
  { name: "Kanuma Panduga", date: "2026-01-16", is_national: false, is_optional: true, states: expandStates(["AP"]), holiday_type: "regional", year: 2026 },
  { name: "Uzhavar Thirunal", date: "2026-01-16", is_national: false, is_optional: true, states: expandStates(["TN"]), holiday_type: "regional", year: 2026 },
  { name: "Sonam Losar", date: "2026-01-19", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Netaji Subhas Chandra Bose Jayanti", date: "2026-01-23", is_national: false, is_optional: true, states: expandStates(["OR", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Vasant Panchami", date: "2026-01-23", is_national: false, is_optional: true, states: expandStates(["HR", "OR", "PB", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "State Day", date: "2026-01-25", is_national: false, is_optional: true, states: expandStates(["HP"]), holiday_type: "regional", year: 2026 },
  
  // February
  { name: "Guru Ravidas Jayanti", date: "2026-02-01", is_national: false, is_optional: true, states: expandStates(["CH", "HP", "HR", "MP", "PB"]), holiday_type: "regional", year: 2026 },
  { name: "Lui-Ngai-Ni", date: "2026-02-15", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Maha Shivaratri", date: "2026-02-15", is_national: false, is_optional: true, states: expandStates(["AP", "BR", "CG", "CH", "DD", "DL", "DN", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "MH", "MP", "OR", "RJ", "TG", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Losar", date: "2026-02-18", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Chhatrapati Shivaji Maharaj Jayanti", date: "2026-02-19", is_national: false, is_optional: true, states: expandStates(["MH"]), holiday_type: "regional", year: 2026 },
  { name: "State Day", date: "2026-02-20", is_national: false, is_optional: true, states: expandStates(["AR", "MZ"]), holiday_type: "regional", year: 2026 },
  
  // March
  { name: "Holi", date: "2026-03-03", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GJ", "HP", "HR", "JH", "JK", "MH", "MP", "NL", "OR", "RJ", "SK", "TG", "TR", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Yaosang", date: "2026-03-03", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Doljatra", date: "2026-03-03", is_national: false, is_optional: true, states: expandStates(["WB"]), holiday_type: "regional", year: 2026 },
  { name: "Yaosang 2nd Day", date: "2026-03-04", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Panchayatiraj Divas", date: "2026-03-05", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "Chapchar Kut", date: "2026-03-06", is_national: false, is_optional: true, states: expandStates(["MZ"]), holiday_type: "regional", year: 2026 },
  { name: "Shab-i-Qadr", date: "2026-03-17", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  { name: "Ugadi", date: "2026-03-20", is_national: false, is_optional: true, states: expandStates(["AP", "DD", "DN", "GA", "GJ", "JK", "KA", "RJ", "TG"]), holiday_type: "regional", year: 2026 },
  { name: "Telugu New Year", date: "2026-03-20", is_national: false, is_optional: true, states: expandStates(["TN"]), holiday_type: "regional", year: 2026 },
  { name: "Jumat-ul-Wida", date: "2026-03-20", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  { name: "Gudi Padwa", date: "2026-03-20", is_national: false, is_optional: true, states: expandStates(["MH"]), holiday_type: "regional", year: 2026 },
  { name: "Idul Fitr", date: "2026-03-21", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OR", "PB", "PY", "RJ", "SK", "TG", "TN", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Sarhul", date: "2026-03-21", is_national: false, is_optional: true, states: expandStates(["JH"]), holiday_type: "regional", year: 2026 },
  { name: "Bihar Day", date: "2026-03-22", is_national: false, is_optional: true, states: expandStates(["BR"]), holiday_type: "regional", year: 2026 },
  { name: "Idul Fitr Holiday", date: "2026-03-22", is_national: false, is_optional: true, states: expandStates(["TG"]), holiday_type: "regional", year: 2026 },
  { name: "S. Bhagat Singh's Martyrdom Day", date: "2026-03-23", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  { name: "Ram Navami", date: "2026-03-27", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "BR", "CG", "DD", "DN", "GJ", "HP", "HR", "MH", "MP", "OR", "PB", "RJ", "SK", "TG", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Mahavir Jayanti", date: "2026-03-31", is_national: false, is_optional: true, states: expandStates(["CG", "CH", "DD", "DL", "DN", "GJ", "HR", "JH", "KA", "LD", "MH", "MP", "MZ", "PB", "RJ", "TN", "UP"]), holiday_type: "regional", year: 2026 },
  
  // April
  { name: "Odisha Day", date: "2026-04-01", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "Good Friday", date: "2026-04-03", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HP", "JH", "KA", "KL", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OR", "PB", "PY", "RJ", "SK", "TG", "TN", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Easter Saturday", date: "2026-04-04", is_national: false, is_optional: true, states: expandStates(["NL"]), holiday_type: "regional", year: 2026 },
  { name: "Babu Jagjivan Ram Jayanti", date: "2026-04-05", is_national: false, is_optional: true, states: expandStates(["AP", "TG"]), holiday_type: "regional", year: 2026 },
  { name: "Easter Sunday", date: "2026-04-05", is_national: false, is_optional: true, states: expandStates(["KL", "NL"]), holiday_type: "regional", year: 2026 },
  { name: "Vaisakh", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["CH", "JK", "PB"]), holiday_type: "regional", year: 2026 },
  { name: "Biju Festival", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["TR"]), holiday_type: "regional", year: 2026 },
  { name: "Dr Ambedkar Jayanti", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["AP", "BR", "CG", "CH", "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "MH", "MP", "OR", "PB", "PY", "RJ", "SK", "TG", "TN", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Tamil New Year", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["PY", "TN"]), holiday_type: "regional", year: 2026 },
  { name: "Vishu", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["KL"]), holiday_type: "regional", year: 2026 },
  { name: "Maha Vishuba Sankranti", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "Bohag Bihu", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["AS"]), holiday_type: "regional", year: 2026 },
  { name: "Cheiraoba", date: "2026-04-14", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Bohag Bihu", date: "2026-04-15", is_national: false, is_optional: true, states: expandStates(["AR"]), holiday_type: "regional", year: 2026 },
  { name: "Bohag Bihu Holiday", date: "2026-04-15", is_national: false, is_optional: true, states: expandStates(["AS"]), holiday_type: "regional", year: 2026 },
  { name: "Bengali New Year", date: "2026-04-15", is_national: false, is_optional: true, states: expandStates(["TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Himachal Day", date: "2026-04-15", is_national: false, is_optional: true, states: expandStates(["HP"]), holiday_type: "regional", year: 2026 },
  { name: "Maharshi Parasuram Jayanti", date: "2026-04-19", is_national: false, is_optional: true, states: expandStates(["GJ", "HP", "HR", "MP", "RJ"]), holiday_type: "regional", year: 2026 },
  { name: "Basava Jayanti", date: "2026-04-20", is_national: false, is_optional: true, states: expandStates(["KA"]), holiday_type: "regional", year: 2026 },
  { name: "Garia Puja", date: "2026-04-21", is_national: false, is_optional: true, states: expandStates(["TR"]), holiday_type: "regional", year: 2026 },
  
  // May
  { name: "Maharashtra Day", date: "2026-05-01", is_national: false, is_optional: true, states: expandStates(["MH"]), holiday_type: "regional", year: 2026 },
  { name: "Buddha Purnima", date: "2026-05-01", is_national: false, is_optional: true, states: expandStates(["AN", "AR", "CG", "CH", "DL", "HP", "JH", "JK", "MH", "MP", "MZ", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "May Day", date: "2026-05-01", is_national: false, is_optional: true, states: expandStates(["AS", "BR", "GA", "KA", "KL", "MN", "PY", "TG", "TN", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Guru Rabindranath Jayanti", date: "2026-05-09", is_national: false, is_optional: true, states: expandStates(["TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "State Day", date: "2026-05-16", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Kazi Nazrul Islam Jayanti", date: "2026-05-26", is_national: false, is_optional: true, states: expandStates(["TR"]), holiday_type: "regional", year: 2026 },
  { name: "Bakrid / Eid al Adha", date: "2026-05-27", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AS", "BR", "CG", "DL", "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OR", "PB", "PY", "RJ", "TG", "TN", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Bakrid / Eid al Adha Holiday", date: "2026-05-28", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  
  // June
  { name: "Pahili Raja", date: "2026-06-14", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "Raja Sankranti", date: "2026-06-15", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "YMA Day", date: "2026-06-15", is_national: false, is_optional: true, states: expandStates(["MZ"]), holiday_type: "regional", year: 2026 },
  { name: "Maharana Pratap Jayanti", date: "2026-06-17", is_national: false, is_optional: true, states: expandStates(["HP", "HR", "RJ"]), holiday_type: "regional", year: 2026 },
  { name: "Sri Guru Arjun Dev Ji's Martyrdom Day", date: "2026-06-18", is_national: false, is_optional: true, states: expandStates(["PB"]), holiday_type: "regional", year: 2026 },
  { name: "Muharram", date: "2026-06-26", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "BR", "CG", "CH", "DD", "DL", "DN", "GJ", "HP", "JH", "JK", "KA", "LD", "MH", "MP", "MZ", "OR", "RJ", "TG", "TN", "TR", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Sant Guru Kabir Jayanti", date: "2026-06-29", is_national: false, is_optional: true, states: expandStates(["CG", "HP", "HR", "PB"]), holiday_type: "regional", year: 2026 },
  { name: "Remna Ni", date: "2026-06-30", is_national: false, is_optional: true, states: expandStates(["MZ"]), holiday_type: "regional", year: 2026 },
  
  // July
  { name: "Guru Hargobind Ji's Birthday", date: "2026-07-01", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  { name: "MHIP Day", date: "2026-07-06", is_national: false, is_optional: true, states: expandStates(["MZ"]), holiday_type: "regional", year: 2026 },
  { name: "Martyrs' Day", date: "2026-07-13", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  { name: "Bhanu Jayanti", date: "2026-07-13", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Ratha Yathra", date: "2026-07-16", is_national: false, is_optional: true, states: expandStates(["MN", "OR"]), holiday_type: "regional", year: 2026 },
  { name: "U Tirot Sing Day", date: "2026-07-17", is_national: false, is_optional: true, states: expandStates(["ML"]), holiday_type: "regional", year: 2026 },
  { name: "Kharchi Puja", date: "2026-07-21", is_national: false, is_optional: true, states: expandStates(["TR"]), holiday_type: "regional", year: 2026 },
  { name: "Shaheed Udham Singh's Martyrdom Day", date: "2026-07-31", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  
  // August
  { name: "Ker Puja", date: "2026-08-07", is_national: false, is_optional: true, states: expandStates(["TR"]), holiday_type: "regional", year: 2026 },
  { name: "Tendong Lho Rum Faat", date: "2026-08-08", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Bonalu", date: "2026-08-10", is_national: false, is_optional: true, states: expandStates(["TG"]), holiday_type: "regional", year: 2026 },
  { name: "Patriots Day", date: "2026-08-13", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Haryali Teej", date: "2026-08-15", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  { name: "De Jure Transfer Day", date: "2026-08-16", is_national: false, is_optional: true, states: expandStates(["PY"]), holiday_type: "regional", year: 2026 },
  { name: "Parsi New Year", date: "2026-08-16", is_national: false, is_optional: true, states: expandStates(["DD", "DN", "GJ", "MH"]), holiday_type: "regional", year: 2026 },
  { name: "Eid e Milad", date: "2026-08-25", is_national: false, is_optional: true, states: expandStates(["AP", "CG", "DD", "DL", "DN", "GJ", "HR", "JH", "JK", "KA", "KL", "LD", "MH", "MZ", "NL", "OR", "PY", "RJ", "TG", "TN", "TR", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "First Onam", date: "2026-08-25", is_national: false, is_optional: true, states: expandStates(["KL"]), holiday_type: "regional", year: 2026 },
  { name: "Jhulan Purnima", date: "2026-08-27", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "Thiruvonam", date: "2026-08-27", is_national: false, is_optional: true, states: expandStates(["KL"]), holiday_type: "regional", year: 2026 },
  { name: "Raksha Bandhan", date: "2026-08-28", is_national: false, is_optional: true, states: expandStates(["CG", "DD", "DN", "GJ", "HR", "MP", "RJ", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Friday Following Eid e Milad", date: "2026-08-28", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  
  // September
  { name: "Janmashtami", date: "2026-09-04", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "BR", "CG", "CH", "DD", "DL", "DN", "GJ", "HP", "HR", "JH", "JK", "MP", "NL", "OR", "RJ", "SK", "TG", "TN", "TR", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Hartalika Teej", date: "2026-09-13", is_national: false, is_optional: true, states: expandStates(["CG", "SK"]), holiday_type: "regional", year: 2026 },
  { name: "Ganesh Chaturthi", date: "2026-09-15", is_national: false, is_optional: true, states: expandStates(["AP", "DD", "DN", "GA", "GJ", "KA", "MH", "OR", "PY", "TG", "TN"]), holiday_type: "regional", year: 2026 },
  { name: "Nuakhai", date: "2026-09-16", is_national: false, is_optional: true, states: expandStates(["OR"]), holiday_type: "regional", year: 2026 },
  { name: "Ganesh Chaturthi Holiday", date: "2026-09-16", is_national: false, is_optional: true, states: expandStates(["GA"]), holiday_type: "regional", year: 2026 },
  { name: "Ramdev Jayanti", date: "2026-09-21", is_national: false, is_optional: true, states: expandStates(["RJ"]), holiday_type: "regional", year: 2026 },
  { name: "Sree Narayana Guru Samadhi", date: "2026-09-21", is_national: false, is_optional: true, states: expandStates(["KL"]), holiday_type: "regional", year: 2026 },
  { name: "Teja Dashmi", date: "2026-09-21", is_national: false, is_optional: true, states: expandStates(["RJ"]), holiday_type: "regional", year: 2026 },
  { name: "Heroes' Martyrdom Day", date: "2026-09-23", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  { name: "Indra Jatra", date: "2026-09-26", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Sree Narayana Guru Jayanti", date: "2026-09-26", is_national: false, is_optional: true, states: expandStates(["KL"]), holiday_type: "regional", year: 2026 },
  
  // October
  { name: "Mahalaya Amavasye", date: "2026-10-10", is_national: false, is_optional: true, states: expandStates(["KA", "OR", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "First Day of Bathukamma", date: "2026-10-11", is_national: false, is_optional: true, states: expandStates(["TG"]), holiday_type: "regional", year: 2026 },
  { name: "Maharaja Agrasen Jayanti", date: "2026-10-11", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  { name: "Ghatasthapana", date: "2026-10-11", is_national: false, is_optional: true, states: expandStates(["RJ"]), holiday_type: "regional", year: 2026 },
  { name: "Maha Saptami", date: "2026-10-18", is_national: false, is_optional: true, states: expandStates(["AS", "OR", "SK", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Kati Bihu", date: "2026-10-18", is_national: false, is_optional: true, states: expandStates(["AS"]), holiday_type: "regional", year: 2026 },
  { name: "Maha Ashtami", date: "2026-10-19", is_national: false, is_optional: true, states: expandStates(["AP", "AS", "JH", "MN", "OR", "RJ", "SK", "TG", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Maha Navami", date: "2026-10-20", is_national: false, is_optional: true, states: expandStates(["AR", "AS", "BR", "JH", "KA", "KL", "ML", "NL", "OR", "PY", "SK", "TN", "TR", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Vijaya Dashami", date: "2026-10-21", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LD", "MH", "ML", "MP", "MZ", "NL", "OR", "PB", "RJ", "SK", "TG", "TN", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Lakshmi Puja", date: "2026-10-25", is_national: false, is_optional: true, states: expandStates(["OR", "TR", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Maharishi Valmiki Jayanti", date: "2026-10-26", is_national: false, is_optional: true, states: expandStates(["HP", "HR", "KA", "MP", "PB"]), holiday_type: "regional", year: 2026 },
  { name: "Sardar Vallabhbhai Patel Jayanti", date: "2026-10-31", is_national: false, is_optional: true, states: expandStates(["GJ"]), holiday_type: "regional", year: 2026 },
  
  // November
  { name: "Kut", date: "2026-11-01", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Puducherry Liberation Day", date: "2026-11-01", is_national: false, is_optional: true, states: expandStates(["PY"]), holiday_type: "regional", year: 2026 },
  { name: "Haryana Day", date: "2026-11-01", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  { name: "Kannada Rajyothsava", date: "2026-11-01", is_national: false, is_optional: true, states: expandStates(["KA"]), holiday_type: "regional", year: 2026 },
  { name: "Lhabab Duchen", date: "2026-11-01", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "Wangala Festival", date: "2026-11-06", is_national: false, is_optional: true, states: expandStates(["ML"]), holiday_type: "regional", year: 2026 },
  { name: "Diwali", date: "2026-11-08", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OR", "PB", "PY", "RJ", "SK", "TG", "TN", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Deepavali Holiday", date: "2026-11-09", is_national: false, is_optional: true, states: expandStates(["HR", "KA", "MH", "RJ", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Vikram Samvat New Year", date: "2026-11-09", is_national: false, is_optional: true, states: expandStates(["GJ"]), holiday_type: "regional", year: 2026 },
  { name: "Govardhan Puja", date: "2026-11-09", is_national: false, is_optional: true, states: expandStates(["CH", "DD", "DN"]), holiday_type: "regional", year: 2026 },
  { name: "Bhai Dooj", date: "2026-11-11", is_national: false, is_optional: true, states: expandStates(["GJ", "RJ", "SK", "UK", "UP"]), holiday_type: "regional", year: 2026 },
  { name: "Ningol Chakkouba", date: "2026-11-12", is_national: false, is_optional: true, states: expandStates(["MN"]), holiday_type: "regional", year: 2026 },
  { name: "Chhath Puja", date: "2026-11-15", is_national: false, is_optional: true, states: expandStates(["BR", "CG", "DD", "DN", "JH"]), holiday_type: "regional", year: 2026 },
  { name: "Chhath Puja Holiday", date: "2026-11-16", is_national: false, is_optional: true, states: expandStates(["BR"]), holiday_type: "regional", year: 2026 },
  { name: "Seng Kut Snem", date: "2026-11-23", is_national: false, is_optional: true, states: expandStates(["ML"]), holiday_type: "regional", year: 2026 },
  { name: "Karthika Purnima", date: "2026-11-24", is_national: false, is_optional: true, states: expandStates(["OR", "TG"]), holiday_type: "regional", year: 2026 },
  { name: "Guru Nanak Jayanti", date: "2026-11-24", is_national: false, is_optional: true, states: expandStates(["AN", "CG", "CH", "DD", "DL", "DN", "GJ", "HP", "HR", "JH", "JK", "LD", "MH", "MZ", "NL", "PB", "RJ", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Kanakadasa Jayanti", date: "2026-11-27", is_national: false, is_optional: true, states: expandStates(["KA"]), holiday_type: "regional", year: 2026 },
  
  // December
  { name: "Indigenous Faith Day", date: "2026-12-01", is_national: false, is_optional: true, states: expandStates(["AR"]), holiday_type: "regional", year: 2026 },
  { name: "Feast of St Francis Xavier", date: "2026-12-03", is_national: false, is_optional: true, states: expandStates(["GA"]), holiday_type: "regional", year: 2026 },
  { name: "Sheikh Muhammad Abdullah Jayanti", date: "2026-12-05", is_national: false, is_optional: true, states: expandStates(["JK"]), holiday_type: "regional", year: 2026 },
  { name: "Pa Togan Nengminza Sangma", date: "2026-12-12", is_national: false, is_optional: true, states: expandStates(["ML"]), holiday_type: "regional", year: 2026 },
  { name: "Sri Guru Teg Bahadur Ji's Martyrdom Day", date: "2026-12-14", is_national: false, is_optional: true, states: expandStates(["PB"]), holiday_type: "regional", year: 2026 },
  { name: "Death Anniversary of U SoSo Tham", date: "2026-12-18", is_national: false, is_optional: true, states: expandStates(["ML"]), holiday_type: "regional", year: 2026 },
  { name: "Guru Ghasidas Jayanti", date: "2026-12-18", is_national: false, is_optional: true, states: expandStates(["CG"]), holiday_type: "regional", year: 2026 },
  { name: "Liberation Day", date: "2026-12-19", is_national: false, is_optional: true, states: expandStates(["DD", "GA"]), holiday_type: "regional", year: 2026 },
  { name: "Hazrat Ali Jayanti", date: "2026-12-23", is_national: false, is_optional: true, states: expandStates(["UP"]), holiday_type: "regional", year: 2026 },
  { name: "Christmas Holiday", date: "2026-12-24", is_national: false, is_optional: true, states: expandStates(["ML", "MZ"]), holiday_type: "regional", year: 2026 },
  { name: "Christmas Day", date: "2026-12-25", is_national: false, is_optional: true, states: expandStates(["AN", "AP", "AR", "AS", "BR", "CG", "DD", "DL", "DN", "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OR", "PB", "PY", "RJ", "SK", "TG", "TN", "TR", "UK", "UP", "WB"]), holiday_type: "regional", year: 2026 },
  { name: "Shaheed Udham Singh Jayanti", date: "2026-12-26", is_national: false, is_optional: true, states: expandStates(["HR"]), holiday_type: "regional", year: 2026 },
  { name: "Christmas Holiday", date: "2026-12-26", is_national: false, is_optional: true, states: expandStates(["ML", "MZ", "TG"]), holiday_type: "regional", year: 2026 },
  { name: "U Kiang Nangbah", date: "2026-12-30", is_national: false, is_optional: true, states: expandStates(["ML"]), holiday_type: "regional", year: 2026 },
  { name: "Tamu Losar", date: "2026-12-30", is_national: false, is_optional: true, states: expandStates(["SK"]), holiday_type: "regional", year: 2026 },
  { name: "New Year's Eve", date: "2026-12-31", is_national: false, is_optional: true, states: expandStates(["MN", "MZ"]), holiday_type: "regional", year: 2026 },
];

// Combined holidays for 2026
export const ALL_HOLIDAYS_2026: HolidayData[] = [
  ...NATIONAL_HOLIDAYS_2026,
  ...REGIONAL_HOLIDAYS_2026,
];

// Maximum regional holidays an employee can take per year
export const MAX_REGIONAL_HOLIDAYS_PER_YEAR = 6;

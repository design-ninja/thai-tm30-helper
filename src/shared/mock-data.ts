import type { Person } from "./storage.js";
import { getPersons, savePersons } from "./storage.js";

const mockPersons: Omit<Person, "id">[] = [
  {
    firstName: "John",
    lastName: "Smith",
    passportNo: "AB1234567",
    nationality: "GBR : BRITISH",
    nationalityCode: "GBR",
    gender: "M",
    birthDate: "15/03/1985",
    phoneNo: "0812345678",
    checkInDate: "",
    checkOutDate: "",
  },
  {
    firstName: "Anna",
    lastName: "Mueller",
    passportNo: "C01234567",
    nationality: "DEU : GERMAN",
    nationalityCode: "DEU",
    gender: "F",
    birthDate: "22/07/1990",
    phoneNo: "0898765432",
    checkInDate: "",
    checkOutDate: "",
  },
  {
    firstName: "Kenji",
    lastName: "Tanaka",
    passportNo: "TK9876543",
    nationality: "JPN : JAPANESE",
    nationalityCode: "JPN",
    gender: "M",
    birthDate: "08/11/1988",
    phoneNo: "0856781234",
    checkInDate: "",
    checkOutDate: "",
  },
  {
    firstName: "Maria",
    lastName: "Santos",
    passportNo: "BR5678901",
    nationality: "BRA : BRAZILIAN",
    nationalityCode: "BRA",
    gender: "F",
    birthDate: "30/05/1992",
    phoneNo: "0823456789",
    checkInDate: "",
    checkOutDate: "",
  },
];

export async function addMockData(): Promise<void> {
  const existing = await getPersons();
  const withIds = mockPersons.map((p, i) => ({
    ...p,
    id: `${Date.now()}_mock_${i}`,
  }));
  const combined = [...existing, ...withIds];
  await savePersons(combined);
  console.log("Mock data added! Reload the page to see profiles.");
  location.reload();
}

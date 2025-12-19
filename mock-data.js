// Mock data for demo purposes
// To use: Open options page, paste this in console, then run addMockData()

const mockPersons = [
    {
        id: Date.now(),
        firstName: "John",
        lastName: "Smith",
        passportNo: "AB1234567",
        nationality: "GBR : BRITISH",
        nationalityCode: "GBR",
        gender: "M",
        birthDate: "15/03/1985",
        phoneNo: "0812345678"
    },
    {
        id: Date.now() + 1,
        firstName: "Anna",
        lastName: "Mueller",
        passportNo: "C01234567",
        nationality: "DEU : GERMAN",
        nationalityCode: "DEU",
        gender: "F",
        birthDate: "22/07/1990",
        phoneNo: "0898765432"
    },
    {
        id: Date.now() + 2,
        firstName: "Kenji",
        lastName: "Tanaka",
        passportNo: "TK9876543",
        nationality: "JPN : JAPANESE",
        nationalityCode: "JPN",
        gender: "M",
        birthDate: "08/11/1988",
        phoneNo: "0856781234"
    },
    {
        id: Date.now() + 3,
        firstName: "Maria",
        lastName: "Santos",
        passportNo: "BR5678901",
        nationality: "BRA : BRAZILIAN",
        nationalityCode: "BRA",
        gender: "F",
        birthDate: "30/05/1992",
        phoneNo: "0823456789"
    }
];

async function addMockData() {
    const existing = await Storage.getPersons();
    const combined = [...existing, ...mockPersons];
    await Storage.savePersons(combined);
    console.log('Mock data added! Reload the page to see profiles.');
    location.reload();
}

// Run this in console:
// addMockData()

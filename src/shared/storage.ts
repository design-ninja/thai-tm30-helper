export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  passportNo: string;
  nationality: string;
  nationalityCode: string;
  gender: string;
  birthDate: string;
  phoneNo: string;
  checkInDate: string;
  checkOutDate: string;
}

let idCounter = 0;

function generateUniqueId(): string {
  idCounter++;
  return `${Date.now()}_${idCounter}`;
}

export async function getPersons(): Promise<Person[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["persons"], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve((result.persons as Person[]) || []);
    });
  });
}

export async function savePersons(persons: Person[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ persons }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

export async function savePerson(
  person: Omit<Person, "id"> | Person,
  existingId: string | null = null,
): Promise<Person[]> {
  const persons = await getPersons();

  if (existingId) {
    const index = persons.findIndex((p) => p.id === existingId);
    if (index !== -1) {
      persons[index] = { ...persons[index], ...person };
    }
  } else {
    persons.push({ id: generateUniqueId(), ...person } as Person);
  }

  await savePersons(persons);
  return persons;
}

export async function deletePerson(id: string): Promise<Person[]> {
  const persons = await getPersons();
  const updatedPersons = persons.filter((p) => p.id !== id);
  await savePersons(updatedPersons);
  return updatedPersons;
}

export async function getPersonById(id: string): Promise<Person | null> {
  const persons = await getPersons();
  return persons.find((p) => p.id === id) || null;
}

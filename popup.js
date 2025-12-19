document.addEventListener('DOMContentLoaded', () => {
    const personList = document.getElementById('person-list');
    const openOptions = document.getElementById('open-options');

    // Load persons for selection
    chrome.storage.local.get(['persons'], (result) => {
        const persons = result.persons || [];
        if (persons.length === 0) {
            personList.innerHTML = '<div class="Popup__Empty">No saved profiles found.<br>Add them in settings first.</div>';
            return;
        }

        persons.forEach(person => {
            const item = document.createElement('div');
            item.className = 'Popup__PersonItem';
            item.innerHTML = `
                <div class="Popup__PersonInfo">
                    <span class="Popup__PersonName">${person.firstName} ${person.lastName}</span>
                    <span class="Popup__PersonDetails">${person.passportNo} | ${person.nationality}</span>
                </div>
                <button class="Popup__BtnEdit" title="Edit Profile">✏️</button>
            `;

            // Click on info area to fill form
            item.querySelector('.Popup__PersonInfo').addEventListener('click', () => {
                fillForm(person);
                window.close();
            });

            // Click on edit icon to open options in edit mode
            item.querySelector('.Popup__BtnEdit').addEventListener('click', (e) => {
                e.stopPropagation();
                chrome.tabs.create({ url: `options.html?edit=${person.id}` });
            });

            personList.appendChild(item);
        });
    });

    // Send message to content script to fill the form
    const fillForm = (person) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'FILL_FORM', person }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert('Error: Please refresh the TM30 form page to enable the extension.');
                        console.error(chrome.runtime.lastError);
                    }
                });
            }
        });
    };

    openOptions.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
});

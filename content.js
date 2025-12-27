// Content script v3.0 - Instant fill without delays
console.log('%c TM30 Helper Content Script v3.0 Loaded 🫡 ', 'background: #333; color: #fff; padding: 2px 5px; border-radius: 3px;');

// Minimal delay for Angular to process events
const MICRO_DELAY = 50;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Robust check for element visibility and existence
function waitForElement(selectors, timeout = 5000) {
    const start = Date.now();
    return new Promise(resolve => {
        const check = () => {
            const el = findElement(selectors);
            if (el) {
                resolve(el);
            } else if (Date.now() - start > timeout) {
                resolve(null);
            } else {
                requestAnimationFrame(check);
            }
        };
        check();
    });
}

// Scan for form controls
function scanFormControls() {
    const controls = Array.from(document.querySelectorAll('[formcontrolname]'))
        .map(el => el.getAttribute('formcontrolname'));
    if (controls.length > 0) {
        console.log('TM30 Helper: Detected FormControls:', controls);
    }
}

// Initial scan
scanFormControls();

// Use MutationObserver instead of setInterval for better performance
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            scanFormControls();
            break;
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Handle navigation
window.addEventListener('popstate', scanFormControls);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'FILL_FORM') {
        fillTM30Form(request.person);
        sendResponse({ status: 'received' });
    }
    return true;
});

async function fillTM30Form(person) {
    console.log('TM30 Helper: Starting instant fill for', person.firstName);
    const [d, m, y] = (person.birthDate || '').split('/');
    const [ciD, ciM, ciY] = (person.checkInDate || '').split('/');
    const [coD, coM, coY] = (person.checkOutDate || '').split('/');

    // 0. Select Address FIRST
    selectAddress();

    const textFields = [
        { name: 'First Name', val: person.firstName, selectors: ['input[formcontrolname="firstName"]'] },
        { name: 'Last Name', val: person.lastName, selectors: ['input[formcontrolname="familyName"]', 'input[formcontrolname="lastName"]'] },
        { name: 'Passport No.', val: person.passportNo, selectors: ['input[formcontrolname="passportNo"]'] },
        { name: 'Birth Day', val: d, selectors: ['input[formcontrolname="dayOfBirth"]'] },
        { name: 'Birth Month', val: m, selectors: ['input[formcontrolname="monthOfBirth"]'] },
        { name: 'Birth Year', val: y, selectors: ['input[formcontrolname="yearOfBirth"]'] },
        { name: 'Phone No.', val: person.phoneNo, selectors: ['input[formcontrolname="phoneNo"]'] },
        { name: 'Check-in Day', val: ciD, selectors: ['input[formcontrolname="dayOfCheckIn"]'] },
        { name: 'Check-in Month', val: ciM, selectors: ['input[formcontrolname="monthOfCheckIn"]'] },
        { name: 'Check-in Year', val: ciY, selectors: ['input[formcontrolname="yearOfCheckIn"]'] },
        { name: 'Check-out Date', val: person.checkOutDate, selectors: ['[sit-element-group="datepicker-check-out"] input', 'input[formcontrolname="checkOutDate"]'] }
    ];

    // 1. Fill all standard fields at once
    for (const field of textFields) {
        const el = findElement(field.selectors);
        if (el) {
            setNativeValue(el, field.val);
            console.log(`TM30 Helper: ✓ Filled "${field.name}" with "${field.val}"`);
        } else if (field.val) {
            console.warn(`TM30 Helper: ✗ Field "${field.name}" NOT FOUND. Tried selectors:`, field.selectors);
        }
    }

    // 2. Fill Gender
    const genderEl = findElement(['mat-select[formcontrolname="genderCode"]']);
    if (genderEl) {
        setSelectValue(genderEl, person.gender === 'M' ? 'Male' : 'Female');
    }

    // 3. Fill Nationality (Autocomplete) - needs robust waiting
    await delay(MICRO_DELAY);
    const nationEl = findElement([
        'input[formcontrolname="key"]',
        'input[formcontrolname="nationality"]',
        'input[formcontrolname="nationalityKey"]',
        'input[matautocomplete]',
        'input[aria-autocomplete="list"]'
    ]);
    if (nationEl) {
        console.log('TM30 Helper: Filling Nationality');
        const searchValue = person.nationalityCode;
        if (searchValue) {
            await setAutocompleteValue(nationEl, searchValue);
        } else {
            console.warn('TM30 Helper: No nationalityCode provided!');
        }
    } else {
        console.warn('TM30 Helper: Nationality field not found!');
    }

    console.log('TM30 Helper: Instant fill complete ✓');
}

function selectAddress() {
    console.log('TM30 Helper: Selecting address...');

    let radio = document.querySelector('mat-radio-button[sit-element="address-radio"]') ||
        document.querySelector('.style-list-address-cont mat-radio-button') ||
        document.querySelector('mat-radio-button');

    if (radio) {
        radio.click();

        const label = radio.querySelector('label');
        if (label) label.click();

        const input = radio.querySelector('input[type="radio"]');
        if (input) {
            input.click();
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        console.log('TM30 Helper: Address selected ✓');
    } else {
        console.warn('TM30 Helper: Could not find address radio button!');
    }
}

function findElement(selectors) {
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el;
    }
    return null;
}

// Reliable native value setter for Angular/React/Vue
function setNativeValue(element, value) {
    let lastValue = element.value;
    element.value = value;
    let event = new Event('input', { bubbles: true });
    
    // React/Angular sometimes override the setter, so we need to call the prototype setter
    // to ensure the internal tracker updates
    let tracker = element._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
    
    // Safe prototype lookup for the value setter
    let proto = element;
    while (proto && !Object.getOwnPropertyDescriptor(proto, 'value')) {
        proto = Object.getPrototypeOf(proto);
    }
    
    if (proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
        if (descriptor && descriptor.set) {
            descriptor.set.call(element, value);
        }
    }
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function setStandardValue(el, value) {
    setNativeValue(el, value);
}

function setSelectValue(el, value) {
    el.click();
    
    // Use requestAnimationFrame to wait for dropdown to open
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const options = Array.from(document.querySelectorAll('mat-option'));
            const option = options.find(opt => opt.innerText.toLowerCase().includes(value.toLowerCase())) ||
                options.find(opt => opt.innerText.includes('Male') || opt.innerText.includes('Female'));
            if (option) option.click();
        });
    });
}

async function setAutocompleteValue(el, value) {
    el.focus();
    el.click();
    
    // Clear value first
    setNativeValue(el, '');
    
    console.log(`TM30 Helper: Typing nationality code: ${value}`);

    // Type the value character by character for better autocomplete triggering
    // Use execCommand because it simulates real user input better than programmatic setting
    for (const char of value) {
        try {
            document.execCommand('insertText', false, char);
        } catch (e) {
            // Fallback for environments where execCommand is blocked
            const currentValue = el.value;
            setNativeValue(el, currentValue + char);
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(50);
    }

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    // Wait for options to appear using smart polling (max 3s)
    console.log('TM30 Helper: Waiting for options...');
    
    const optionSelectors = ['mat-option', '.mat-autocomplete-panel mat-option', '.mat-mdc-option'];
    
    // Custom polling to wait specifically for ANY of these to appear
    const startTime = Date.now();
    let options = [];
    
    while (Date.now() - startTime < 3000) { // 3 second timeout
        options = Array.from(document.querySelectorAll(optionSelectors.join(', ')));
        if (options.length > 0) {
            console.log(`TM30 Helper: Found ${options.length} options`);
            
            // Check if our option is present
            const normalizedValue = value.toUpperCase();
            const option = options.find(opt => opt.innerText.toUpperCase().startsWith(normalizedValue)) ||
                           options.find(opt => opt.innerText.toUpperCase().includes(normalizedValue));
            
            if (option) {
                console.log('TM30 Helper: Clicking option:', option.innerText);
                option.click();
                await delay(200);
                el.dispatchEvent(new Event('blur', { bubbles: true }));
                return; // Success!
            }
        }
        await delay(100);
    }
    
    // Fallback: If timed out but options exist, try to pick the first one
    if (options.length > 0) {
         console.warn('TM30 Helper: Timeout waiting for exact match, picking first option');
         options[0].click();
         await delay(200);
         el.dispatchEvent(new Event('blur', { bubbles: true }));
    } else {
        console.error('TM30 Helper: No nationality options appeared!');
    }
}

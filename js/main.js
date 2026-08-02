import { refreshIcons } from './icons.js';
import {
  toggleTheme, setAccent, toggleAccentPicker, restorePrefs, closeAccentPickerOnOutsideClick,
} from './prefs.js';
import { initWeather } from './weather.js';
import { renderNetwork } from './network.js';
import { initCounter } from './counter.js';
import { loadRepos } from './github.js';
import { handleForm } from './contact.js';

// Inline handlers in index.html call these through the global scope.
window.toggleTheme = toggleTheme;
window.setAccent = setAccent;
window.toggleAccentPicker = toggleAccentPicker;
window.handleForm = handleForm;

refreshIcons();
restorePrefs();
initWeather();
renderNetwork();
initCounter();
loadRepos();

document.addEventListener('click', closeAccentPickerOnOutsideClick);

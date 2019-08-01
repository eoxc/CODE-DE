import i18next from 'eoxc/src/i18next';
import registerI18nHelper from 'handlebars-i18next';
import Handlebars from 'handlebars';  // runtime also possible
registerI18nHelper(Handlebars, i18next);
export default i18next;

import { TasksArgs } from "./tasks";

let _spellcheckerInstance: typeof import("spellchecker");

function _getSpellchecker() {
    return _spellcheckerInstance || (_spellcheckerInstance = require("spellchecker"))
}

async function validateText(params: TasksArgs['SpellcheckValidate']) {
    const errors = _getSpellchecker().checkSpelling(params.text);

    if (errors)
        throw new Error(errors.map(a => params.text.slice(a.start, a.end)).join(", "))
    return null;
}

export default function setupSpellcheckTasks(on: Cypress.PluginEvents) {
    on('task', {
        validateText
    } as Cypress.Tasks)
}
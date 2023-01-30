const dataMap: {
  [k: string]: any;
} = {};

export default function setupUtilityTasks(on: Cypress.PluginEvents) {
  on("task", {
    getData: (k) => dataMap[k] || null,
    storeData: ({ key: k, value: v }) => (dataMap[k] = v),
    clearData: (k) => {
      dataMap[k] = null;
      return null as any;
    },
  } as Cypress.Tasks);
}

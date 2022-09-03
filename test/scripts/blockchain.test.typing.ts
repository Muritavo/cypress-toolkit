const exampleContractCyChain = cy.deployContract("ExampleContract", []);

exampleContractCyChain.then(a => {
    /** Here it should exist a property called contracts inside the cypress context */
    a.contracts.ExampleContract.address;
})
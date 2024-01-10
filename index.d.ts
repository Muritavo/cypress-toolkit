/// <reference types="cypress-real-events"/>
/// <reference types="cypress-wait-until"/>
/// <reference types="cypress-file-upload"/>
/// <reference types="cypress-visual-regression"/>
/// <reference path="./types/ai.d.ts"/>

/** @internal */
type mountFunc = typeof import("cypress/react")["mountHook"];
/** @internal */
type FunctionComponent = typeof import("react")["FunctionComponent"];

/** @internal */
type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;

/** @internal */
type OverloadUnionRecursive<
  TOverload,
  TPartialOverload = unknown
> = TOverload extends (...args: infer TArgs) => infer TReturn
  ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures.
    TPartialOverload extends TOverload
    ? never
    :
        | OverloadUnionRecursive<
            TPartialOverload & TOverload,
            TPartialOverload &
              ((...args: TArgs) => TReturn) &
              OverloadProps<TOverload>
          >
        | ((...args: TArgs) => TReturn)
  : never;

/** @internal */
// Inferring a union of parameter tuples or return types is now possible.
type OverloadParameters<T extends (...args: any[]) => any> = Parameters<
  OverloadUnionRecursive<T>
>;

/** @internal */
interface FuncInt {
  (arg: string, args: number): void;
  (arg: number, args: symbol): void;
}

/** @internal */
declare type MountHookResult<T> = {
  readonly current: T | null | undefined;
  readonly error: Error | null;
};

/** @internal */
type ExtractFromUnionKeys = "";
/** @internal */
type OnlyCopy = "contains" | "should" | "and" | "then" | "wait";

/** @internal */
type RerenderChain<I, T> = Cypress.Chainable<I, T>;

namespace BlockchainOperations {
  /** @internal */
  type ContractShape = {
    address: string;
    owner: string;
  };
  /** @internal */
  type BlockchainContract<ABI> = {
    address: string;
    owner: string;
    contract: import("./types/contract").GenericContract<ABI>;
  };
  /** @internal */
  type BlockchainWallets = {
    [address: string]: {
      balance: number;
      unlocked: number;
      secretKey: string;
    };
  };
  /** @internal */
  type ArrayExceptFirst<F> = F extends [arg0: any, ...rest: infer R]
    ? R
    : never;
  /** @internal */
  type StartupConfig = {
    /** The NFT projects root folder so the contracts can be deployed from */
    projectRootFolder?: string;
    /**
     * This indicates the port the ganache server will run at
     * @default 8545
     * */
    port?: number;
    /** When this flag is set, it will always create a new non deterministic instance */
    deterministic?: boolean;
  };
  /** @internal */
  type TupleToFunctionTuple<
    A,
    T,
    F = T[0],
    N = [F] extends [undefined] ? true : false
  > = true extends N
    ? []
    :
        | [F, ...TupleToFunctionTuple<A, ArrayExceptFirst<T>>]
        | [
            [
              (contracts: A["contracts"]) => F,
              ...TupleToFunctionTuple<A, ArrayExceptFirst<T>>
            ]
          ];
  interface Commands<A extends any = any> {
    /**
     * This will start up a server to deploy the contracts into
     * @param projectRootFolder The root folder for the project with the contracts
     */
    startBlockchain(config?: StartupConfig): Cypress.Chainable<
      (A extends {} ? (A extends undefined ? {} : A) : {}) & {
        wallets: BlockchainWallets;
      }
    >;

    /**
     * Deploys a contact and returns the address that it has been deployed to
     * @param contractName The name of the contract
     * @param initializationArgs The arguments for initializing the contract ("calls the initialize method")
     */
    deployContract<
      ABI extends readonly any[],
      const CN extends
        | string
        | readonly [ContractName: string, Identifier: string]
    >(
      contractName: CN,
      abi: ABI,
      ...initializationArgs: (any | ((ctr: A["contracts"]) => any))[]
    ): Cypress.DeployContractResult<A, ABI, CN>;

    invokeContract<
      CN extends keyof A["contracts"],
      MethodName extends keyof A["contracts"][CN]["contract"]["methods"]
    >(
      withWalllet:
        | string
        | ((contracts: A["contracts"], wallets: A["wallets"]) => string),
      contractName: CN,
      method: MethodName,
      ...params: TupleToFunctionTuple<
        A,
        Parameters<A["contracts"][CN]["contract"]["methods"][MethodName]>
      >
    ): Cypress.Chainable<
      // Extracts the ABI from the type
      A["contracts"][CN]["contract"] extends import("./types/contract").GenericContract<
        infer ABI
      >
        ? // If the ABI method is of state view
          (ABI[number] & { name: MethodName })["stateMutability"] extends "view"
          ? // Returns the output type
            import("./types/contract").MapTypeToJS<
              (ABI[number] & { name: MethodName })["outputs"][0]["type"],
              []
            >
          : // Or else, keep the old return
            A
        : // It should never fall here
          never
    >;
  }
  interface Tasks {
    startBlockchain(props?: StartupConfig): Promise<BlockchainWallets>;
    deployContract(p: {
      contractName: string;
      args: any[];
    }): Promise<ContractShape>;
  }
}

namespace UtilityOperations {
  interface Commands {
    /** Saves some data on the current cypress process */
    storeData(key: string, value: any): void;

    /** Retrieves some data on the current cypress process */
    getData(key: string): any;

    /** Removes some data on the current cypress process */
    clearData(key: string): any;
  }

  interface Tasks {
    storeData(arg: { key: string; value: any }): Cypress.Chainable<void>;
    getData(key: string): Cypress.Chainable<any>;
    clearData(key: string): Cypress.Chainable<any>;
  }
}

namespace RenderingOperations {
  interface Commands {
    /**
     * This function mounts the provided component in a PIP window.
     *
     * Not recomended for flows that render components directly on body (like modals, popups, etc...)
     *
     * Caveats:
     * - Only works on chrome/chrome based browsers at the point of implementation
     * - There is currently a bug that requires you to manually change the path to https (this is only working at cypress 12, cypress 13 is stuck on loading).
     * More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=1486404&q=component%3ABlink%3EMedia%3EPictureInPicture%20localhost&can=2
     * - When closing the pip, the component is remounted on the current page. So it is restored to the initial state.
     * - When the PIP is open for the first time, it changes focus to the pip window.
     *
     * ```tsx
     * // On your test render the component
     * const chain = cy.mountPip((var1: any, var2: any) =>
     *  <YourComponent propA={var1} propB={var2}/>
     * )
     * chain.remount("x", "pto");
     *
     * // ... Do your cypress assertions
     *
     * // If necessary, rerender with different props, keeping state
     * chain.remount("hello", "world");
     * ```
     *
     * Even though the cypress commands work (kind of) on the pip window, applications that inject elements on body can be out of reach of cypress commands. If there is need to interact/query said elements you can do so like the following.
     * ```
     * // Renders something that triggers a modal for example
     * chain.remount()
     *
     * // Grab the cypress document
     * cy.wrap(window.document.body).within(() => {
     *  // The following commands will be run inside the non pip document
     *  cy.contains("stuff")
     *  cy.get("button")
     * })
     * ```
     */
    mountPip<T extends FunctionComponent>(
      renderFunc: T
    ): RerenderChain<Subject, T>;

    /**
     * This function was created to reduce boilerplate for rerendering.
     *
     * This way, you can chain multiple rerenders and test multiple component states
     */
    mountChain<T extends FunctionComponent>(
      renderFunc: T
    ): RerenderChain<Subject, T>;

    /**
     * Checks if an element is visible in the viewport
     *
     * **OVERFLOW ELEMENTS CAN BE DETECTED AS VISIBLE IN THE VIEWPORT. TAKE CARE WHEN USING THIS FUNCTION**
     */
    inViewport(mode?: "dimension-wise" | "width-wise" | "height-wise"): void;
  }
}

namespace EmulatorOperations {
  /** @internal */
  type Admin = ReturnType<typeof import("firebase-admin")["auth"]>;
  /** @internal */
  type KeysWithValsOfType<T, V> = keyof {
    [P in keyof T as T[P] extends V ? P : never]: P;
  };
  /** @internal */
  type AdminAuthInterfaceFunctions = KeysWithValsOfType<
    Admin,
    (...params: any[]) => any
  >;

  interface Commands {
    /**
     * This function tries to start an emulator
     *
     * It also keeps the emulator running until it changes @param databaseToImport.
     * @param projectName A required project name for the emulator to start with
     * @param forceStart Force startup
     * @param databaseToImport a (preferably absolute) path to the emulator backup
     * @param suiteId an identifier for the emulator, so it can detect when to reinstanciate between tests (usefull for describe blocks)
     *
     * If you require the emulator to be recreated after the tests use the function cy.killEmulator() on a afterEach block
     */
    startEmulator(
      projectName: string,
      databaseToImport?: string,
      suiteId?: string,
      exportDataOnExit?: boolean,
      only?: TasksArgs["StartEmulatorTask"]["only"]
    ): Cypress.Chainable<void>;

    /**
     * This function force kills all emulator related ports
     */
    killEmulator(): Cypress.Chainable<void>;

    /**
     * Adds a new user to the emulator
     *
     * @param localId To define a deterministic id for the user
     */
    addUser(
      email: string,
      password: string,
      projectName: string,
      localId?: string
    ): Cypress.Chainable<{}>;

    /**
     * Clear the current firestore database
     */
    clearFirestore(projectName: string): Cypress.Chainable<void>;

    /**
     * Clear the current firestore database
     */
    clearAuth(projectName: string): Cypress.Chainable<void>;

    /**
     * Gives access to the admin interface for managing and setting up the emulator environment
     */
    setupEmulator(
      setupFunc: (
        firestore: ReturnType<typeof firebase.default.firestore>,
        storage: ReturnType<typeof firebase.default.storage>,
        admin: ReturnType<typeof import("firebase-admin")["auth"]>
      ) => Promise<void>,
      project: string,
      storageBucket?: string
    ): Cypress.Chainable<void>;

    /**
     * Clears a collection so you don't need to manually clean each item
     */
    deleteCollection(
      collectionPath: string,
      projectName: string
    ): Cypress.Chainable<any>;

    /**
     * Deletes all files from the storage emulator
     */
    clearEmulatorStorage(
      projectName: string,
      storageBucket: string,
      folder: string
    ): Cypress.Chainable<any>;
  }
  interface Tasks {
    startEmulator: (args: TasksArgs["StartEmulatorTask"]) => Promise<null>;
    killEmulator: () => Promise<null>;
    invokeAuthAdmin: <F extends AdminAuthInterfaceFunctions>(args: {
      projectId: string;
      port: string;
      functionName: F;
      params: Parameters<Admin[F]>;
    }) => Promise<any>;
  }
}

namespace FileManagementOperations {
  interface Commands {
    /**
     * Reads a file that maybe doesn't exist
     * If it exists, returns it's content, if it doesn't returns null
     */
    readOptionalFile(
      filepath: string,
      encoding?: BufferEncoding,
      options?: Cypress.Loggable
    ): Cypress.Chainable<string | null>;
  }

  interface Tasks {
    readFileMaybe: (args: TasksArgs["readFileMaybe"]) => Promise<string | null>;
  }
}

namespace InteractionOperations {
  interface Commands {
    /**
     * Emulates an interaction that executes a mousedown, mousemove, and a mouseup
     * @param x How much to move on x
     * @param y How much to move on y
     */
    dragElement(x: number, y: number): Cypress.Chainable<void>;
  }
}

declare namespace Cypress {
  interface Chainable<Subject = any, RerenderFunc = any>
    extends BlockchainOperations.Commands<Subject>,
      EmulatorOperations.Commands,
      RenderingOperations.Commands,
      UtilityOperations.Commands,
      InteractionOperations.Commands,
      FileManagementOperations.Commands,
      AIOperations.Commands {
    /**
     * This finds an element based on their testids
     */
    byTestId(testId: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Generates a random image from a string
     *
     * chains to a base64 string of the image
     */
    randomImage(width: number, height: number, seed: string): Chainable<string>;

    /**
     * Mount hook with a wrapper
     */
    mountHookWrap: <T>(
      hookFn: (...args: any[]) => T,
      Wrapper: React.FunctionComponent
    ) => Cypress.Chainable<MountHookResult<T>>;

    /**
     * Generate a delayed function for usage with cypress
     */
    delayedSpy: (
      shouldSucceed: boolean,
      timeout: number,
      resolveOrRejectWith: any
    ) => ReturnType<(typeof cy)["spy"]>;

    /**
     * If a previous image exists, compare with it. If not set the current image as previous image
     */
    comparePreviousUI: (snapshotId) => Cypress.Chainable<void>;

    /**
     * A copy of cy.task to allow intelissense support
     */
    execTask<E extends keyof Cypress.CustomTasks = keyof Cypress.CustomTasks>(
      event: E,
      arg?: Parameters<Cypress.CustomTasks[E]>[0],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<
      Awaited<ReturnType<Cypress.CustomTasks[E]>> extends null
        ? void
        : Awaited<ReturnType<Cypress.CustomTasks[E]>>
    >;
    /**
     * This function should be called after calling cy.mountChain
     *
     * With this you can call the render function again, with new arguments
     */
    remount: (
      ...props: Parameters<RerenderFunc>
    ) => RerenderChain<Subject, RerenderFunc>;

    /**
     * Expects a rejection from a function call
     */
    expectRejection: (
      asyncFunc: () => Promise<any>,
      expectedMessage: string
    ) => Cypress.Chainable<void>;

    /**
     * Captures a snapshot of the current HTML
     */
    snapshot(): Cypress.Chainable<void>;
  }
  interface CustomTasks
    extends BlockchainOperations.Tasks,
      EmulatorOperations.Tasks,
      UtilityOperations.Tasks,
      FileManagementOperations.Tasks {}
  interface Tasks extends CustomTasks {}

  type DeployContractResult<A, ABI, CN> = Cypress.Chainable<
    (A extends {} ? (A extends undefined ? {} : A) : {}) & {
      contracts: A["contracts"] & {
        [s in CN extends string
          ? CN
          : CN[1]]: BlockchainOperations.BlockchainContract<ABI>;
      };
    }
  >;
}

/** @internal */
type TasksArgs = import("./src/scripts/tasks").TasksArgs;
/** @internal */
type EachFunction = <T extends Tenant = Tenant, P extends any>(
  tenantConfig: {
    [TID in Exclude<Tenant, Exclude<Tenant, T>>]: P;
  },
  name: string,
  fn: (a: P) => any
) => void;

/** @internal */
declare namespace jest {
  interface It {
    eachTenant: EachFunction;
  }
}
/** @internal */
interface Each {
  <T extends Array>(
    iterations: T,
    title: string,
    testFn: (element: T[number]) => any
  ): void;
  only: Each;
}
declare namespace Mocha {
  interface TestFunction {
    eachTenant: EachFunction & { only: EachFunction };
    each: Each;
  }
}

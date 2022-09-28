var text2png = require('text2png');

const firstEmoji = 0x1F604;
const emojisCount = 0x1F64F - firstEmoji;

/**
 * Generates an random colored image with specified width, height and quality
 * @param width width of the image
 * @param height height of the image
 * @param quality quality of the image
 */
export const generateImage = function (cols: number, rows: number, strRandom: string, orientation: "vertical" | "horizontal" = "vertical") {
    strRandom = orientation === "vertical" ? strRandom : `${strRandom}${orientation}`
    const numFromStr = strRandom.split("").reduce((r, char) => r + char.charCodeAt(0), 0)
    const rest = numFromStr % emojisCount;
    const e = (i: number) => String.fromCodePoint(firstEmoji + rest + i)

    let template = ``;
    for (let i = 0; i < rows; i++) {
        for (let c = 0; c < cols; c++) {
            template += e((cols * i) + c);
        }
        template += '\n';
    }

    const instance = text2png(template, {
        output: "dataURL",
        padding: 10,
        font: '50px monospace',
        color: `rgb(${256 - (rest % 256)}, ${256 - (numFromStr % 256)}, ${256 - (Math.abs(numFromStr - rest) % 256)})`,
        backgroundColor: `rgb(${rest % 256}, ${numFromStr % 256}, ${Math.abs(numFromStr - rest) % 256})`
    })
    return instance
};

export const filterLogs = () => {
    const origLog = Cypress.log;
    Cypress.log = function (opts, ...other) {
        if (
            (opts.displayName && ["xhr", "image"].includes(opts.displayName)) ||
            (opts.name && ["Coverage", "readfile"].includes(opts.name)) ||
            ["@cypress/code-coverage"].some((a) => opts.message ? opts.message[0] && String(opts.message[0]).includes(a) : false)
        ) {
            delete opts.message;
            delete opts.displayName;
            delete opts.type;
            const p = new Proxy(
                {},
                {
                    get: () => {
                        return () => p;
                    },
                }
            );

            return p;
        }

        return origLog(opts, ...other) as any;
    };
}

Cypress.Commands.add("randomImage", (width: number, height, seed) => {
    const widthPts = width / 100;
    const heightPts = height / 100;
    return generateImage(widthPts, heightPts, seed);
})

Cypress.Commands.add('expectRejection', (rejectionFunc: () => Promise<any>, expectedMessage) => {
    return new Cypress.Promise(async (res, rej) => {
        try {
            await rejectionFunc();
            rej('The provided function did not reject')
        } catch (e: any) {
            try {
                
                expect(e.toString()).to.include(expectedMessage);
                res()
            } catch (e) {
                rej(e)
            }
        }
    }) as any
})

cy.delayedSpy = (shouldSucceed, timeout, resolveOrRejectWith) => {
    return cy.spy(() => {
        return new Promise<void>((r, rej) => {
            setTimeout(() => {
                const result = typeof resolveOrRejectWith === "function" ? resolveOrRejectWith() : resolveOrRejectWith
                if (shouldSucceed)
                    r(result)
                else
                    rej(result)
            }, timeout)
        })
    })
}
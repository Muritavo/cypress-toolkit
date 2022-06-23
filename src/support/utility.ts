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
        padding: 100,
        font: '500px monospace',
        color: `rgb(${256 - (rest % 256)}, ${256 - (numFromStr % 256)}, ${256 - (Math.abs(numFromStr - rest) % 256)})`,
        backgroundColor: `rgb(${rest % 256}, ${numFromStr % 256}, ${Math.abs(numFromStr - rest) % 256})`
    })
    return instance
};

Cypress.Commands.add("randomImage", (width, height, seed) => {
    const widthPts = width / 100;
    const heightPts = height / 100;
    return generateImage(widthPts, heightPts, seed);
})
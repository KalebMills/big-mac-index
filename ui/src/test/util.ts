import * as assert from 'assert';
import { BigMacIndexConverted, BigMacIndex } from "../interfaces"
import { convertBigMacIndexData } from "../util"

describe('#convertBigMacIndexData', () => {
    it('Can properly convert index data', () => {
        const EXPECTED: BigMacIndexConverted = {
            country: 'Argentina',
            date: '2000-04-01',
            localPrice: 2.5,
            dollarEx: 1.0,
            dollarPrice: 2.5,
            dollarPPP: '0.9960159362549802',
            dollarValuation: '-0.3984063745019806'
        }
        const INPUT: BigMacIndex = {
            country: 'Argentina',
            date: '2000-04-01',
            localPrice: '2.5',
            dollarEx: '1.0',
            dollarPrice: '2.5',
            dollarPPP: '0.9960159362549802',
            dollarValuation: '-0.3984063745019806'
        }

        const ACTUAL: BigMacIndexConverted = convertBigMacIndexData(INPUT);

        assert.deepStrictEqual(ACTUAL, EXPECTED);
    })
})
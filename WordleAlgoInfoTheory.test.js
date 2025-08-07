describe('WordleAlgoInfoTheory getPattern', () => {
    const WordleAlgoInfoTheory = require('./WordleAlgoInfoTheory')
    const logger = {log:()=>{}, debug:()=>{}, debugTable:()=>{}, table:()=>{}}
    const algo = new WordleAlgoInfoTheory({}, logger)

    test('handles duplicate letters correctly', () => {
        expect(algo.getPattern('ccccc', 'cigar')).toBe('20000')
        expect(algo.getPattern('cacti', 'cigar')).toBe('21001')
    })
})

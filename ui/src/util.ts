import { BigMacIndex, BigMacIndexConverted } from "./interfaces";
import { getBigMacIndex } from './actions/big-mac';

const VERSION_KEY = 'BIG_MAC_DATA_VERSION';
const BIG_MAC_DATA_KEY = 'BIG_MAC_DATA';


//First check if our version of the data is up to date, if so load from our cache, otherwise fetch newest data and update our local version and local data
export const loadBigMacIndexData = (version: string): Promise<BigMacIndex[]> => {
    const localVersion = localStorage.getItem(VERSION_KEY);

    if (!!localVersion && (localVersion == version)) {
        const data = localStorage.getItem(BIG_MAC_DATA_KEY);
        
        if (data) {
            return Promise.resolve(JSON.parse(data) as BigMacIndex[]);
        } else {
            return getBigMacIndex()
            .then(data => {
                localStorage.setItem(VERSION_KEY, data.version);
                localStorage.setItem(BIG_MAC_DATA_KEY, JSON.stringify(data.data));
                return data.data;
            });
        }
    } else {
        return getBigMacIndex()
        .then(data => {
            localStorage.setItem(VERSION_KEY, data.version);
            localStorage.setItem(BIG_MAC_DATA_KEY, JSON.stringify(data.data));
            return data.data;
        });
    }
}

//This function is made soley for conversion and does no validation
export const convertBigMacIndexData = (input: BigMacIndex): BigMacIndexConverted => {
    return {
        country: input.country,
        date: input.date,
        dollarEx: parseInt(input.dollarEx),
        dollarPrice: parseInt(input.dollarPrice),
        dollarPPP: input.dollarPPP,
        dollarValuation: input.dollarValuation,
        localPrice: parseInt(input.localPrice)
    }
}
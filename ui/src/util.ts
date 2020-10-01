import { Dispatch, SetStateAction } from 'react';
import { BigMacIndex, BigMacIndexConverted } from "./interfaces";
import { getBigMacIndex } from './actions/big-mac';
import { BigMacComponentState } from './pages/big-mac';
import chance from 'chance';

const VERSION_KEY = 'BIG_MAC_DATA_VERSION';
const BIG_MAC_DATA_KEY = 'BIG_MAC_DATA';


//First check if our version of the data is up to date, if so load from our cache, otherwise fetch newest data and update our local version and local data
export const loadBigMacIndexData = (version?: string): Promise<BigMacIndex[]> => {
    const localVersion = localStorage.getItem(VERSION_KEY);

    if ((!!localVersion && (localVersion == version) ) || !version) {
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

export const setBigMacDataToState = (data: BigMacIndex[], setState: Dispatch<SetStateAction<BigMacComponentState>>, country: string) => {
    const currentCountryData: BigMacIndex | undefined = data.find(entry => entry.country == country);
    const filteredData = data.filter(entry => entry.country != country);
    const randomCountryData = filteredData[chance().integer({ min: 0, max: filteredData.length - 1 })];

    if (currentCountryData && randomCountryData) {
        setState((prevState: BigMacComponentState) => {
            return {
                ...prevState,
                user: {
                    ...prevState.user,
                    localData: convertBigMacIndexData(currentCountryData),
                    randomData: convertBigMacIndexData(randomCountryData),
                    country
                }
            }
        });
    } else {
        //TODO: Send some kind of error to the client showing that an error occurred internally
        console.log(`currentCountryData or randomCountryData is not valid`)
    }
}
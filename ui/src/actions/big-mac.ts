import axios from 'axios';
import { BigMacIndex, CountryResponse } from '../interfaces';


//Usually this is defined via .env or some sort of configuration. For simplicity, it's defined here.
const API_HOST = 'localhost:9658';

export const GENERIC_ERROR_MESSAGE = 'An error occurred with your request';

export const getBigMacIndex = (): Promise<{ version: string, data: BigMacIndex[] }> => {
    return axios.get(`http://${API_HOST}/big-mac-index`)
    .then(data => {
        if (data.status === 200) {
            return data.data;
        } else {
            return Promise.reject(new Error(GENERIC_ERROR_MESSAGE));
        }
    });
}

export const getBigMacIndexVersion = (): Promise<string> => {
    return axios.get(`http://${API_HOST}/big-mac-index/version`)
    .then(data => data.data.data);
}

export const getMyCountry = (): Promise<CountryResponse> => {
    return axios.get<CountryResponse>(`http://${API_HOST}/country`)
    .then(data => {
        if (data.status === 200) {
            return data.data; 
        } else {
            return Promise.reject(new Error(GENERIC_ERROR_MESSAGE));
        }
    })
}
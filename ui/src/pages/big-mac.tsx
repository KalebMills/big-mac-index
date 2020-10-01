import React, { useState, useEffect } from 'react';
import { Input } from '../components/base';
import * as actions from '../actions/big-mac';
import '../styles/big-mac.scss';
import { convertBigMacIndexData, loadBigMacIndexData } from '../util';
import { BigMacIndex, BigMacIndexConverted } from '../interfaces';
import chance from 'chance';

interface BigMacComponentState {
    user: {
        country: string;
        currencyAmount: number;
        localData?: BigMacIndexConverted;
        randomData?: BigMacIndexConverted;
    }
    bigMacData: BigMacIndex[];
    loading: boolean;
}

const BigMac = (): JSX.Element => {
    const [state, setState] = useState<BigMacComponentState>({
        user: {
            country: '',
            currencyAmount: 1,
        },
        bigMacData: [],
        loading: true
    });

    useEffect(() => {
        Promise.all([
            actions.getMyCountry()
            .then(data => {
                console.log(JSON.stringify(data), data.data.country_name);
                setState({
                    ...state,
                    user: { ...state.user, country: data.data.country_name! }
                });
                return;
            })
            .catch(err => {
                console.error(`An error occured when fetching user country data`);
                console.dir(err)
            }),

            actions.getBigMacIndexVersion()
            .then(version => loadBigMacIndexData(version))
            .then(data => {
                const currentCountryData: BigMacIndex | undefined = data.find(entry => entry.country == state.user.country);
                const filteredData = data.filter(entry => entry.country != state.user.country);
                const randomCountryData = filteredData[chance().integer({ min: 0, max: filteredData.length - 1 })];

                if (currentCountryData && randomCountryData) {
                    setState({
                        ...state,
                        user: {
                            ...state.user,
                            localData: convertBigMacIndexData(currentCountryData),
                            randomData: convertBigMacIndexData(randomCountryData)
                        }
                    })
                } else {
                    //TODO: Send some kind of error to the client showing that an error occurred internally
                    console.log(`currentCountryData or randomCountryData is not valid`)
                }
            })
            .catch(err => {
                console.error(`An error occurred when fetching the Big Mac Index`);
                console.dir(err);
            })
        ])
        .then(() => {
            //TODO: Here we need to hide the main section while we are loading, so when the data is here, we can have all data needed to continue the process
        })
        
    }, []);

    return (
        <div>
            <div>
                <div style={{
                    margin: 'auto',
                    marginTop: '1%',
                    marginLeft: '2%',
                    marginBottom: '1%',
                    fontSize: '20px',
                    fontWeight: 300
                }}>
                    Big Mac Index
                </div> 

                <div className='neuomorphic section'>
                    <p>You are in {state.user.country}</p>
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                        <p>Please enter an amount of money in your local currency</p>
                        <Input 
                            type={'number'} 
                            style={{ maxWidth: '40%' }} 
                            value={state.user.currencyAmount || 1}
                            onChange={e => {
                                if (!!parseInt(e.currentTarget.value)) {
                                    setState({
                                        ...state,
                                        user: {
                                            ...state.user,
                                            currencyAmount: parseInt(e.currentTarget.value)
                                        }
                                    });
                                }
                            }}
                        />
                    </div>
                </div>


                <div className='neuomorphic section'>
                    <p>You could buy {state.user.currencyAmount / (state.user.localData?.localPrice  || 0)} of Big Macs in your country</p>
                    <p>Your Dollar Purchasing Parity (PPP) is {state.user.localData?.dollarPPP} </p>
                </div>

                <div className='neuomorphic section'>
                    <p>Random Country: {state.user.randomData?.country} </p>
                    <p>You could buy {(state.user.currencyAmount / (state.user.localData?.localPrice || 0)) * (state.user.localData?.dollarPrice || 0 / (state.user.randomData?.dollarPrice || 0))} of Big Macs in {state.user.randomData?.country} with {state.user.currencyAmount}! </p>
                    <p>Your {state.user.currencyAmount} is worth about {state.user.currencyAmount * (state.user.localData?.localPrice || 0 / (state.user.randomData?.dollarPrice || 0))} in {state.user.randomData?.country} </p>
                </div>
            </div>
        </div>
    )
}

export default BigMac;
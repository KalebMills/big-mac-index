import React, { useState, useEffect } from 'react';
import { Input } from '../components/base';
import * as actions from '../actions/big-mac';
import '../styles/big-mac.scss';
import { loadBigMacIndexData, setBigMacDataToState } from '../util';
import { BigMacIndex, BigMacIndexConverted, CountryResponse } from '../interfaces';

export interface BigMacComponentState {
    user: {
        country: string;
        currencyAmount: number;
        localData: BigMacIndexConverted | null;
        randomData: BigMacIndexConverted | null;
    }
    bigMacData: BigMacIndex[] | null;
    loading: boolean;
}

const BigMac = (): JSX.Element => {
    const [state, setState] = useState<BigMacComponentState>({
        user: {
            country: '',
            currencyAmount: 1,
            localData: null,
            randomData: null
        },
        bigMacData: null,
        loading: false
    });

    useEffect(() => {
        setState(prevState => {
            return { ...prevState, loading: true }
        });

        Promise.all([ actions.getMyCountry(), actions.getBigMacIndexVersion() ])
        .then(([country, version]: [CountryResponse, string]) => {
            return loadBigMacIndexData(version)
            .then(bigMacData => {
                setBigMacDataToState(bigMacData, setState, country.data.country_name!);
                return;
            });
        })
        .then(() => {
            setState(prevState => {
                return {
                    ...prevState,
                    loading: false
                }
            });
        })
        .catch(err => {
            setState(prevState => { 
                return { ...prevState, loading: false, user: { ...state.user }};
            });

            //Here we would usually use some kind of toaster or something to let the user know an error occurred
            console.dir(err);
            console.log('Some error occurred when making your request, please try again.')
        })
    }, []);


 
    if (state.loading) {
        return <div>Loading..</div>;
    } else {
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
}

export default BigMac;
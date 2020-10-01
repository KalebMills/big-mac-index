


/*
    Some of there interfaces are duplicated from the server. In a realworld use case, we would create some base package
    that contains these items that are shared between the two. For simplicity, we instead duplicate them here.
*/


export interface BigMacIndex {
    country: string;
    date: string;
    localPrice: string;
    dollarEx: string;
    dollarPrice: string;
    dollarPPP: string;
    dollarValuation: string;
}

export interface BigMacIndexConverted {
    country: string;
    date: string;
    localPrice: number;
    dollarEx: number;
    dollarPrice: number;
    dollarPPP: string;
    dollarValuation: string;
}

export interface CountryResponse {
    status: string;
    data: {
        ipv4: string;
        continent_name: string | null;
        country_name: string | null;
        subdivision_1_name: string | null;
        subdivision_2_name: string | null
        city_name: string | null;
        latitude: string | null;
        longitude: string | null;
    }
}
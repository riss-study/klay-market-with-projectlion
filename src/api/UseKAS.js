import axios from "axios";
import {
    ACCESS_KEY_ID, 
    SECREAT_ACCESS_KEY, 
    CHAIN_ID, 
    KIP17TOKEN_CONTRACT_ABI,
    KIP17TOKEN_CONTRACT_ADDRESS,
    MARKET_CONTRACT_ABI, 
    MARKET_CONTRACT_ADDRESS
    } from '../constants';

const option={
    headers: {
        Authorization: "Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECREAT_ACCESS_KEY).toString("base64"),
        'x-chain-id': CHAIN_ID,
        'content-type': 'application/json'
    }
};

export const uploadMetaData=async (imageUrl, _name, _description) => {
    // const _description="This is a KlayLion NFT";
    // const _name="KlayLionNFT";

    const metadata={
        metadata: {
            name: _name,
            description: _description,
            image: imageUrl
        }
    }

    try {
        const response=await axios.post('https://metadata-api.klaytnapi.com/v1/metadata', metadata, option);
        console.log(`${JSON.stringify(response.data)}`);
        return response.data.uri;
    } catch (e) {
        console.error(e);
        return false;
    }
};
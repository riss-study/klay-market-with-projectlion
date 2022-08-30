import axios from "axios";
import {COUNT_CONTRACT_ADDRESS, ACCESS_KEY_ID, SECREAT_ACCESS_KEY, CHAIN_ID, KIP17TOKEN_CONTRACT_ABI, KIP17TOKEN_CONTRACT_ADDRESS, MARKET_CONTRACT_ABI, MARKET_CONTRACT_ADDRESS} from '../constants';
import * as CounterABI from '../abi/CounterContract.json';
import { abi_mintWithTokenURI, abi_safeTransferFromWithNoData } from '../abi/KIP17Token.json';
import { abi_buyNFT } from '../abi/Market.json';
import { isBrowser, isIOS, isAndroid } from 'react-device-detect';

const option={
    APP_NAME: 'KLAY_MARKET',
    URL: {
        A2A_API_PREPARE: 'https://a2a-api.klipwallet.com/v2/a2a/prepare',
        A2A_API_RESULT: 'https://a2a-api.klipwallet.com/v2/a2a/result?request_key=',
        A2A_API_QRCODECREATE: 'https://klipwallet.com/?target=/a2a?request_key=',
        A2A_API_iOSExecuteInKaKaotalk: 'kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=',
        A2A_API_MobileExecuteInKlip: 'https://klipwallet.com/?target=/a2a?request_key=',
        A2A_API_AndroidExecuteInKakaotalkPart1: 'intent://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=',
        A2A_API_AndroidExecuteInKakaotalkPart2: '#Intent;scheme=kakaotalk;package=com.kakao.talk;end',
        
        iOs_KakaotalkDownloadUrl: 'itms-apps://itunes.apple.com/app/id362057947',

    },
};

const getKlipAccessUrl=(method, request_key) => {
    if ('QR' === method) {
        return `${option.URL.A2A_API_QRCODECREATE}${request_key}`;
    } else if ('iOS' === method) {
        return `${option.URL.A2A_API_iOSExecuteInKaKaotalk}${request_key}`;
    } else if ('android' === method) {
        return `${option.URL.A2A_API_iOSExecuteInKaKaotalk}${request_key}`;
        // return `${option.A2A_API_AndroidExecuteInKakaotalkPart1}${request_key}${option.A2A_API_AndroidExecuteInKakaotalkPart2}}`
    } else {
        alert('No supported device.');
        return;
    }
};

export const buyCard=async (tokenId, setQrValue, callback) => {
    const functionJSON=JSON.stringify(abi_buyNFT);
    const params=`[\"${tokenId}\", \"${KIP17TOKEN_CONTRACT_ADDRESS}\"]`;
    executeContract(MARKET_CONTRACT_ADDRESS, functionJSON, '10000000000000000', params, setQrValue, callback);  //10000000000000000 peb = 0.01 klay
};  

export const listingCard=async (fromAddress, tokenId, setQrValue, callback) => {
    const functionJSON=JSON.stringify(abi_safeTransferFromWithNoData);
    const params=`[\"${fromAddress}\", \"${MARKET_CONTRACT_ADDRESS}\", \"${tokenId}\"]`;
    executeContract(KIP17TOKEN_CONTRACT_ADDRESS, functionJSON, '0', params, setQrValue, callback);
};

export const mintCardWithURI=async (toAddress, tokenId, uri, setQrValue, callback) => {
    const functionJSON=JSON.stringify(abi_mintWithTokenURI);
    const params=`[\"${toAddress}\", \"${tokenId}\", \"${uri}\"]`;
    executeContract(KIP17TOKEN_CONTRACT_ADDRESS, functionJSON, '0', params, setQrValue, callback);
};

export const executeContract=(txTo, functionJSON, value, params, setQrValue, callback) => {
    axios.post(
        option.URL.A2A_API_PREPARE,
        {
            bapp: {
                name: option.APP_NAME,
            },
            type: "execute_contract",
            transaction: {
                to: txTo,
                value: value,
                abi: functionJSON,
                params: params,
            }
        }
    ).then(res => {
        
        const { request_key, prepare, expiration_time }=res.data;        
        
        if (isAndroid) {
            window.location.href=getKlipAccessUrl("android", request_key);
        } else if (isIOS) {
            window.location.href=getKlipAccessUrl("iOS", request_key);
        } else if (isBrowser) {
            setQrValue(getKlipAccessUrl("QR", request_key));
        }

        let tExpired=new Date(expiration_time*1000);
        console.log(tExpired);

        let timerId=setInterval(() => {            
            axios.get(`${option.URL.A2A_API_RESULT}${request_key}`)
            .then((res2) => {
                if (res2.data.result) {
                    console.log(`[result] ${JSON.stringify(res2.data.result)}`);
                    if ('success' === res2.data.result.status) {
                        clearInterval(timerId);
                        callback(res2.data.result);
                        setQrValue('DEFAULT');
                    }
                } else if (tExpired < new Date()) {
                    console.log('QR 시간 만료');
                    clearInterval(timerId);
                    setQrValue('DEFAULT');
                }
                console.log('Result 리퀘스트 반복 요청 중22');
            });
        }, 1000);
    });
};


export const getAddress=(setQrValue, callback) => {
    axios.post(
        option.URL.A2A_API_PREPARE,
        {
            bapp: {
                name: option.APP_NAME,
            },
            type: "auth"
        }
    ).then(res => {
        const { request_key, prepare, expiration_time }=res.data;
        let url=`${option.URL.A2A_API_RESULT}${request_key}`;
        // const qrcode=`${option.URL.A2A_API_QRCODECREATE}${request_key}`;
        // setQrValue(qrcode);
        
        if (isAndroid) {
            window.location.href=getKlipAccessUrl("android", request_key);
        } else if (isIOS) {
            window.location.href=getKlipAccessUrl("iOS", request_key);
        } else if (isBrowser) {
            setQrValue(getKlipAccessUrl("QR", request_key));
        }
        
        let tExpired=new Date(expiration_time*1000);
        console.log(tExpired);
        console.log('url= ' + url);
        let timerId=setInterval(() => {            
            axios.get(url)
            .then((res2) => {
                if (res2.data.result) {
                    console.log(`[result] ${JSON.stringify(res2.data.result)}`);
                    callback(res2.data.result.klaytn_address);
                    clearInterval(timerId);
                    setQrValue('DEFAULT');
                } 
                else if (tExpired < new Date()) {
                    console.log('QR 시간 만료');
                    clearInterval(timerId);
                    setQrValue('DEFAULT');

                }
                console.log('리퀘스트 반복 요청 중');
            });
        }, 1000);
    });
};

///////////////////////////////////////////////////////////////////////////////

export const setCount=(count, setQrValue) => {
    
    axios.post(
        option.URL.A2A_API_PREPARE,
        {
            bapp: {
                name: option.APP_NAME,
            },
            type: "execute_contract",
            transaction: {
                to: COUNT_CONTRACT_ADDRESS,
                value: '0',
                abi: JSON.stringify(CounterABI.abi_setCount),
                params: `[\"${count}\"]`
            }
        }
    ).then(res => {
        const { request_key, prepare, expiration_time }=res.data;
        const qrcode=`${option.URL.A2A_API_QRCODECREATE}${request_key}`
        
        setQrValue(qrcode);
        let tExpired=new Date(expiration_time*1000);
        console.log(tExpired);

        let timerId=setInterval(() => {            
            axios.get(`${option.URL.A2A_API_RESULT}${request_key}`)
            .then((res2) => {
                if (res2.data.result) {
                    console.log(`[result] ${JSON.stringify(res2.data.result)}`);
                    if ('success' === res2.data.result.status) clearInterval(timerId);
                } else if (tExpired < new Date()) {
                    console.log('QR 시간 만료');
                    clearInterval(timerId);
                }
                console.log('Result 리퀘스트 반복 요청 중22');
            });
        }, 1000);
    });
};
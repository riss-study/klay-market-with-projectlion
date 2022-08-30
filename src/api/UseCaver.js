import axios from 'axios';
import Caver from 'caver-js';
import {ACCESS_KEY_ID, SECREAT_ACCESS_KEY, CHAIN_ID, KIP17TOKEN_CONTRACT_ABI,KIP17TOKEN_CONTRACT_ADDRESS, MARKET_CONTRACT_ABI, MARKET_CONTRACT_ADDRESS} from '../constants';
// 1 Smart contract 배포 주소 파악(가져오기)
// 2 caver.js 이용해서 스마트 컨트랙트 연동
// 3 가져온 스마트 컨트랙트 실행 결과(데이터) 웹에 표현하기

const option={
    headers: [
      {
        name: "Authorization",
        value: "Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECREAT_ACCESS_KEY).toString("base64")
      },
      {
        name: "x-chain-id",
        value: CHAIN_ID
      }
    ]
  }
  
  const caver=new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option));
  
  const NFTContract=new caver.contract(KIP17TOKEN_CONTRACT_ABI, KIP17TOKEN_CONTRACT_ADDRESS);
  const MarketContract=new caver.contract(MARKET_CONTRACT_ABI, MARKET_CONTRACT_ADDRESS);

  export const fetchCardsOf=async (address) => {
    // fetch balance
    const balance=await NFTContract.methods.balanceOf(address).call();
    console.log(`[NFT Balance] ${balance}`);
    // fetch token ids
    const tokenIds=[];
    for (let i=0; balance > i; ++i) {
        const id=await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
        tokenIds.push(id);
    }

    // fetch token urls
    const tokenUris=[];
    for (let i=0; balance > i; ++i) {
        const metadatUrl=await NFTContract.methods.tokenURI(tokenIds[i]).call(); // -> metadata kas 주소
        const response=await axios.get(metadatUrl); // 실제 metadata
        const uriJSON=response.data;
        
        tokenUris.push(uriJSON.image);
    }

    console.log(`${tokenIds}`);
    console.log(`${tokenUris}`);
    console.log(`${tokenUris[0]}`);
    console.log(`${tokenUris[1]}`);

    const nfts=[];
    for (let i=0; balance > i; ++i) {
        nfts.push({
            id: tokenIds[i],
            uri: tokenUris[i]
        });
    }

    console.log(nfts);
    return nfts;

  };
  
  export const getBalance=(address) => {
    return caver.rpc.klay.getBalance(address).then((res) => {
      const balance=caver.utils.convertFromPeb(caver.utils.hexToNumberString(res));
      console.log(`balance: ${balance}`);
      return balance;
    });
  };

//   const countContract=new caver.contract(COUNT_CONTRACT_ABI, COUNT_CONTRACT_ADDRESS);

//   export const readCount=async () => {
//     const _count=await countContract.methods.count().call();
//     console.log('count: ' + _count);
//   };
  
//   export const setCount=async (newCount) => {
//     try {
//       // 사용할 account 설정
//       const privateKey='0xfa301ace6cfdaa181b25bff5f55d35bc2017b0abae501ddee547c995d268e623';
//       const deployer=caver.wallet.keyring.createFromPrivateKey(privateKey);
//       caver.wallet.add(deployer);
//       // 스마트 컨트랙트 실행 트랜잭션 날리기
//       // 결과 확인
  
//       const receipt=await countContract.methods.setCount(newCount).send({
//         from: deployer.address, // address
//         gas: "0x4bfd200"  //
//       });
//       console.log(receipt);
//     } catch (e) {
//       console.error(`[ERROR_SET_COUNT] ${e}`);
//     }
    
//   };
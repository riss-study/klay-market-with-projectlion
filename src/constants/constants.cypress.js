import {abi, mainAddress} from '../abi/CounterContract.json';
import {KIP17TokenAbi, KIP17TokenMainAddress} from '../abi/KIP17Token.json'
import {marketAbi, marketMainAddress} from '../abi/Market.json'

export const COUNT_CONTRACT_ADDRESS=mainAddress;
// export const KIP17TOKEN_CONTRACT_ADDRESS=KIP17TokenMainAddress;
export const MARKET_CONTRACT_ADDRESS=marketMainAddress;
export const KIP17TOKEN_CONTRACT_ADDRESS='0x3965ee847d44049d55b48fd7e4af8c11fd290d7b';  // 멋사 강의에서 부여받은 nft 컨트랙 주소
export const COUNT_CONTRACT_ABI=abi;
export const KIP17TOKEN_CONTRACT_ABI=KIP17TokenAbi;
export const MARKET_CONTRACT_ABI=marketAbi;
export const ACCESS_KEY_ID='KASKW4FQ4N59LM2ZNLIJPIY8';
export const SECREAT_ACCESS_KEY='wwEmC1acgsPltjRULpQpMeyYhygxgIlpzX_0NrC0';

export const CHAIN_ID='8217';  //CYPRESS: 8217, BAOBAB: 1001
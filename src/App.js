import logo from './logo.svg';
import './App.css';
import {fetchCardsOf, getBalance} from './api/UseCaver';
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import * as KlipAPI from './api/UseKlip';
import * as KasAPI from './api/UseKAS';
import { Alert, Container, Card, Nav, Form, Button, Modal, Row, Col } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import './market.css';
import { MARKET_CONTRACT_ADDRESS } from './constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faWallet, faPlus } from '@fortawesome/free-solid-svg-icons';

const onPressBtn=(_balance, _setBalance) => {
  _setBalance(_balance);
};
const DEFAULT_QR_CODE='DEFAULT';
const DEFAULT_ADDRESS='0x0000000000000000000000000000000000000000';
const MY_ADDRESS='0xc02FbCF2731A9E200D3d315AA860440aa562B4c0';

function App() {

  // State Data
  
  // Global Data (Domain Data)
  // address
  // nft
  const [nfts, setNfts]=useState([]); // {id: '424', uri: 'https://~~'}
  const [myBalance, setMyBalance]=useState('0');
  const [myAddress, setMyAddress]=useState(DEFAULT_ADDRESS);

  // UI
  const [qrValue, setQrValue]=useState(DEFAULT_QR_CODE);
  const [tab, setTab]=useState('MARKET'); //MARKET, MINT, WALLET
  const [mintImageUrl, setMintImageUrl]=useState('');
  const [mintTokenId, setMintTokenId]=useState('');
  const [mintTokenName, setMintTokenName]=useState('');
  const [mintTokenDescription, setMintTokenDescription]=useState('');
  // tab
  // mintInput

  // modal
  const [showModal, setShowModal]=useState(false);
  const [modalProps, setModalProps]=useState({
    title: 'MODAL',
    onConfirm: () => {},
  });

  const rows=nfts.slice(nfts.length/2);

  // fetchMarketNFTs
  const fetchMarketNFTs=async () => {
    const _nfts=await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  };
  // fetchMyNFTs
  const fetchMyNFTs=async () => {

    if (DEFAULT_ADDRESS === myAddress) {
      alert("NO ADDRESS");
      return;
    }

    // [{tokenId: 328, tokenUri: "https://lh3.googleusercontent.com/FHOPiYiTEFZkXfKI8nJXociouTBHgTY8__gENyom8mikwP7NNl2GYJcw6RkvREM0kuB3ev2mdTjNmbxy6A2Z-QCyTsis51--5MVwXA=w600"}, 
    //    {tokenId: 424, tokenUri: "https://bafybeidmjf247j3ucf64rlxw3mumgei5wi5lsardc4e6cbr4yrccc7soye.ipfs.infura-ipfs.io/"}]
    // balanceOf -> 내가 가진 전체 NFT 토큰 갯수 리턴
    // tokenOfOwnerByIndex -> 내가 가진 NFT token ID 를 하나씩 가져옴 (배열로 만들기)
    // 0xc02FbCF2731A9E200D3d315AA860440aa562B4c0, 0 -> 424
    // 0xc02FbCF2731A9E200D3d315AA860440aa562B4c0, 1 -> 328
    // tokenURI -> 가져온 tokenID 를 이용해서 tokenURI 를 하나씩 가져옴

    const _nfts=await fetchCardsOf(myAddress);
    setNfts(_nfts);
  };
  // onClickMint
  const onClickMint=async (uri, tokenId, tokenName, tokenDescription) => {
    if (DEFAULT_ADDRESS === myAddress) {
      alert('No Address');
      return;
    }
    // {option} asset upload api 이용
    // metadata upload
    const metadataURL=await KasAPI.uploadMetaData(uri, tokenName, tokenDescription);
    
    if (!metadataURL) {
      alert('메타 데이터 업로드에 실패하였습니다.');
      return;
    }

    // 내 포폴로 구현할 때, nft contract 에 현재 발행된 nft last number 받아와서 +1 해주기
    // const randomTokenId=parseInt(Math.random() * 100000);
    KlipAPI.mintCardWithURI(myAddress, tokenId, metadataURL, setQrValue, (result) => {
      alert(JSON.stringify(result));
    })
  };

  const onClickCard=(id) => {
    if ('WALLET' === tab) {
      setModalProps({
        title: '해당 NFT를 마켓에 올리겠습니까?',
        onConfirm: () => {
          onClickMyCard(id);
        },
      });
    } else if ('MARKET' === tab) {
      setModalProps({
        title: '해당 NFT를 구매하시겠습니까?',
        onConfirm: () => {
          onClickMarketCard(id);
        },
      });
    }
    setShowModal(true);
  }

  // onClickMyCard
  const onClickMyCard=(tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrValue, (result) => {
      alert(JSON.stringify(result));
    });
  };

  // onClickMarketCard
  const onClickMarketCard=(tokenId) => {
    KlipAPI.buyCard(tokenId, setQrValue, (result) => {
      alert(JSON.stringify(result));
    })
  };
  // getUserData
  const getUserData=() => {
    setModalProps({
      title: 'Klip 지갑을 연동하시겠습니까?',
      onConfirm: () => {
        KlipAPI.getAddress(setQrValue, async (address) => {
          setMyAddress(address);
          const _balance= await getBalance(address);
          setMyBalance(_balance);
        });
      }
    });
    setShowModal(true);
  };

  useEffect(() => {
    getUserData();
    fetchMarketNFTs();
  }, []);

  return (
    <div className="App">
      <div style={{
        backgroundColor:'black', padding: 10
      }}>

        {/* 주소 잔고 */}
        <div style={{ color: 'white', fontSize: 30, fontWeight: "bold", padding: 10 }}>내 지갑</div>
        <div style={{ color: 'white', fontSize: 20}}>
          {myAddress}
        </div>
        <br/>
        <Alert 
          onClick={getUserData} 
          variant={'balance'} 
          style={{ 
            backgroundColor: '#f40075', fontSize: 25, cursor: 'pointer'
          }}>
            {DEFAULT_ADDRESS !== myAddress ? `${myBalance} Klay` : '지갑 연동하기'}
        </Alert>

        {'DEFAULT' !== qrValue ? (
          <Container style={{backgroundColor: 'white', width: 300, height: 300, padding: 20}}>
          <QRCode value={qrValue} size={256} style={{margin: 'auto'}} />
          <br />
          <br />
        </Container>
        ) : null}
        {/* <Container style={{backgroundColor: 'white', width: 300, height: 300, padding: 20}}>
          <QRCode value={qrValue} size={256} style={{margin: 'auto'}} />
          <br />
          <br />
        </Container> */}

        {/* 갤러리 (마켓, 내 지갑) */}
        {'MARKET' == tab || 'WALLET' === tab ? (
          <div className='container' style={{padding: 0, width: '100%', color: 'white'}}>
            {rows.map((o, rowIndex) => (
              <Row key={`rowkey${rowIndex}`}>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  <Card onClick={() => {
                    onClickCard(nfts[rowIndex*2].id)
                  }}>
                    <Card.Img src={nfts[rowIndex*2].uri} />
                  </Card>
                  [{nfts[rowIndex*2].id}]NFT
                </Col>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  {
                    nfts.length > rowIndex*2+1 ? (
                      <Card onClick={() => {
                        onClickCard(nfts[rowIndex*2+1].id)
                      }}>
                        <Card.Img src={nfts[rowIndex*2+1].uri} />
                      </Card>
                    ) : null
                  }
                  {nfts.length > rowIndex*2+1 ? (
                    <>[{nfts[rowIndex*2+1].id}]NFT</>
                  ) : null}
                </Col>
              </Row>
            ))}
          {/* {nfts.map((nft, index) => (
            <Card.Img 
              key={`imagekey${index}`}
              onClick={() => {onClickCard(nft.id)}} className='img-responsive' src={nfts[index].uri} />
          ))} */}
          </div>
        ) : null}

        {/* 발행 페이지 */}
        {'MINT' === tab ? (
          <div className='container' style={{padding: 0, width: '100%'}}>
            <Card className='text-center' style={{color: 'black', height: '50%', borderColor: '#C5B358'}}>
              <Card.Body style={{opacity: 0.9, backgroundColor: 'black'}}>
                {'' !== mintImageUrl ? <Card.Img src={mintImageUrl} height={'50%'} /> : null}
                <Form>
                  <Form.Group>
                    <Form.Control 
                    value={mintImageUrl} 
                    onChange={(e) => {
                      console.log(e.target.value);
                      setMintImageUrl(e.target.value);
                    }}
                    type='text' placeholder='발행할 토큰의 이미지 주소를 입력해주세요'/>
                    {/* Control 이 text input 칸 */}
                  </Form.Group>
                  <br />
                  <Form.Group>
                    <Form.Control 
                    value={mintTokenId} 
                    onChange={(e) => {
                      console.log(e.target.value);
                      setMintTokenId(e.target.value);
                    }}
                    type='text' placeholder='발행할 토큰 ID를 입력해주세요 (1,018,000 ~ 1,018,099 만 가능)'/>
                    {/* Control 이 text input 칸 */}
                  </Form.Group>
                  <br />
                  <Form.Group>
                    <Form.Control 
                    value={mintTokenName} 
                    onChange={(e) => {
                      console.log(e.target.value);
                      setMintTokenName(e.target.value);
                    }}
                    type='text' placeholder='발행할 토큰의 이름을 입력해주세요'/>
                    {/* Control 이 text input 칸 */}
                  </Form.Group>
                  <br />
                  <Form.Group>
                    <Form.Control 
                    value={mintTokenDescription} 
                    onChange={(e) => {
                      console.log(e.target.value);
                      setMintTokenDescription(e.target.value);
                    }}
                    type='text' as='textarea' rows={3} placeholder='발행할 토큰의 설명을 입력해주세요'/>
                    {/* Control 이 text input 칸 */}
                  </Form.Group>
                  <br />
                  <Button 
                    onClick={() => {onClickMint(mintImageUrl, mintTokenId, mintTokenName, mintTokenDescription)}}
                    variant='primary' style={{backgroundColor:'#810034', borderColor:'#810034'}}>발행하기</Button>
                </Form>
              </Card.Body>
            </Card>

          </div>
        ) : null}

        <br/>
        
        {/* <button onClick={fetchMyNFTs}>NFT 가져오기</button> */}
        
        <br />
        <br />
        <br />
        <br />
        
        {/* 탭 */}
        <nav style={{backgroundColor: '#1b1717', height: 45, color: 'white'}} className='navbar fixed-bottom navbar-light' role={'navigation'}>
          <Nav className='w-100'>
            <div className='d-flex flex-row justify-content-around w-100'>
              
              <div onClick={()=>{
                setTab('MARKET');
                fetchMarketNFTs();
              }}
               className='row d-flex flex-column justify-content-center align-items-center'>
                <div><FontAwesomeIcon color='white' size='lg' icon={faHome}></FontAwesomeIcon></div>
              </div>

              <div onClick={()=>{
                setTab('MINT');
              }}
               className='row d-flex flex-column justify-content-center align-items-center'>
                <div><FontAwesomeIcon color='white' size='lg' icon={faPlus}></FontAwesomeIcon></div>
              </div>

              <div onClick={()=>{
                setTab('WALLET');
                fetchMyNFTs();
              }}
               className='row d-flex flex-column justify-content-center align-items-center'>
                <div><FontAwesomeIcon color='white' size='lg' icon={faWallet}></FontAwesomeIcon></div>

              </div>

            </div>
          </Nav>
        </nav>        

        {/* 모달 */}
        <Modal
          centered
          size='sm'
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
        >
          <Modal.Header style={{ border: 0, backgroundColor: 'black', opacity: 0.8, color: 'white' }}>
            <Modal.Title>{modalProps.title}</Modal.Title>
          </Modal.Header>
          <Modal.Footer style={{ border: 0, backgroundColor: 'black', opacity: 0.8 }}>
            <Button variant='secondary' onClick={() => {setShowModal(false)}}>닫기</Button>
            <Button variant='primary' onClick={() => {
              modalProps.onConfirm();
              setShowModal(false);
            }}
            style={{ backgroundColor: '#810034', borderColor: '#810034' }}
            >진행</Button>
          </Modal.Footer>
        </Modal>
        
        </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState, useContext } from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Image,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { NFTContext } from '../context/NFTContext';
import { Loader } from '../components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import Head from 'next/head';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const MINT_STAGES = ['Adding the NFT to the blockchain', 'Putting the token on the marketplace'];

export default function MintPage() {
  const { nftimage, createSale, isLoadingNFT } = useContext(NFTContext);
  const [fileUrl, setFileUrl] = useState(null);
  const [mintStage, setMintStage] = useState(-1);
  const [errorStage, setErrorStage] = useState(-1);
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const toast = useToast();
  const [status, setStatus] = useState("");
  const router = useRouter()

  useEffect(() => {
    if(nftimage === "") {
      router.push('/draw')
    }
  }, []);

  const checkForm = () => {
    if (!name?.trim()) return false;
    if (!description?.trim()) return false;
    if (!price?.trim()) return false;
    return true;
  };

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescChange = (e) => setDescription(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);

  const uploadToInfura = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
};

const createMarket = async () => {
    //const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
        const added = await client.add(data);
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
        await createSale(url, formInput.price);
        router.push('/');
    } catch (error) {
        console.log('Error uploading file: ', error);
    }
};

  const onMintPressed = async () => {
    if (checkForm() === false) {
      toast({
        title: 'Details not complete',
        description: 'Enter the details carefully',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'bottom-right',
      });
      return;
    }
    setMintStage(1)

    await uploadToInfura(nftimage);
    
    await createMarket();

    toast({
      title: 'NFT minted',
      description: 'Your NFT has been minted successfully',
      status: 'success',
      duration: 9000,
      isClosable: true,
      position: 'bottom-right',
    });
    setMintStage(2)
    setStatus(status);
  }; 

  const Minting = () => (
    <>
      <div className="flex min-h-screen w-full text-white p-5 justify-center items-center">
        <div className="pl-10 pr-10 pb-10 pt-0 bg-gray rounded-lg ">
          <div className="flex flex-col min-h-screen w-full text-white p-5 justify-center items-center">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <h2 className="text-2xl">Minting...</h2>
            <p className="text-sm leading-relaxed text-gray-600">Your NFT is being minted!</p>
            <p className="text-sm leading-relaxed text-gray-600">This may take a while :)</p>
          </div>
        </div>

        {errorStage !== -1 ? (
          <Link href="/create" passHref>
            <Button
              as="a"
              backgroundColor="#915bff"
              border="1px solid #915bff"
              _hover={{
                backgroundColor: '#000',
                border: '1px solid #915bff',
                color: 'white',
              }}
              alignItems="center"
              justifyContent="center"
              mb={{ base: 2, sm: 0 }}
              cursor="pointer"
            >
              Go back to Create
            </Button>
          </Link>
        ) : (
          <></>
        )}
      </div>
    </>
  );

  const Minted = () => (
    <div className="flex  min-h-screen w-full text-white justify-center items-center">
      <div className=" space-y-4 p-10 bg-gray rounded-lg">
        <div className="space-y-2">
          <h2 className="text-2xl">Minted! 🎉</h2>
          <p className="text-sm leading-relaxed text-gray-600">Yayy! Your NFT has been minted.</p>
        </div>
        {/*<div className="space-y-5">
          {MINT_STAGES.map((label, step) => (
            <div key={step} className="flex items-center gap-2">
              <BiCheckCircle className="w-6 h-6 text-green" />
              <span className="leading-relaxed text-green">{label}</span>
            </div>
          ))}
        </div>*/}
        <div className=" gap-3 pt-5">
          <Link href="/draw" >
            <Button
              as="a"
              backgroundColor="#915bff"
              border="1px solid #915bff"
              _hover={{
                backgroundColor: '#000',
                border: '1px solid #915bff',
                color: 'white',
              }}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: 'full', sm: 'auto' }}
              mb={{ base: 2, sm: 0 }}
              size="lg"
              cursor="pointer"
            >
              Go Back to draw
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  if (isLoadingNFT) {
    return (
      <div className="flexCenter" style={{ height: '51vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className=" flex flex-col w-full h-full">
      <Head>
        <title>Mint NFT</title>
      </Head>
      {mintStage === MINT_STAGES.length && <Confetti className="w-full h-screen" recycle={true} />}
      {nftimage === 'sd' ? (
        <div className="text-white w-full h-full flex items-center justify-center bg-black">
          <p className="text-2xl">Create a pixel art to mint!</p>
        </div>
      ) : mintStage === 2 ? (
        <div className="flex w-full items-center">
          <Minted />
        </div>
      ) : mintStage === 1 ? (
        <div className="flex items-center">
          <Minting />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-grow items-center md:mt-[-50px] mt-0">
          <Flex p={8} flex={1} align={'center'} justify={'center'} className="text-white">
            <Stack spacing={4} w={'full'} maxW={'md'}>
              <Heading fontSize={'2xl'}>{`Let's setup your NFT's name and price!`}</Heading>
              <FormControl id="name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input type="text" value={name} onChange={handleNameChange} />
              </FormControl>
              <FormControl id="description" isRequired>
                <FormLabel>Description</FormLabel>
                <Input type="text" value={description} onChange={handleDescChange} />
              </FormControl>
              <FormControl id="description" isRequired>
                <FormLabel>Price</FormLabel>
                <Input type="text" value={price} onChange={handlePriceChange} />
              </FormControl>
              <Stack spacing={20}>
                {currentAccount ?<button
                  className="border-2 border-solid border-purple px-2 py-1 rounded-md font-bold bg-purple hover:bg-black hover:text-white"
                  onClick={onMintPressed}
                >
                  Mint NFT
                </button> : <ConnectWallet /> }
              </Stack>
            </Stack>
          </Flex>
          <Flex flex={1}>
            <div className="overflow-auto transform scale-75 border border-gray-200 shadow-xl rounded-xl">
              <Image src={nftimage} alt="NFT Image" />
            </div>
          </Flex>
        </div>
      )}
    </div>
  );
}
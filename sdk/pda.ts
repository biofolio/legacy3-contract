import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { Legacy3Type } from './idl/legacy3';

const getSeed = (seed: string, program: Program<Legacy3Type>): Buffer => {
  return Buffer.from(
    // @ts-ignore
    JSON.parse(program.idl.constants.find((c) => c.name === seed)!.value),
  );
};

export const toBuffer = (value: anchor.BN, endian?: any, length?: any) => {
  try {
    return value.toBuffer(endian, length);
  } catch (error) {
    return value.toArrayLike(Buffer, endian, length);
  }
};

export const getConfigPubKey = (program: Program<Legacy3Type>) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [getSeed('configSeed', program)],
    program.programId,
  )[0];
};

export const getRolePubKey = (
  program: Program<Legacy3Type>,
  configPubkey: PublicKey,
  user: PublicKey,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [getSeed('roleSeed', program), configPubkey.toBuffer(), user.toBuffer()],
    program.programId,
  )[0];
};

export const getConnectionPubKey = (
  program: Program<Legacy3Type>,
  sender: PublicKey,
  receiver: PublicKey,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      getSeed('connectionSeed', program),
      sender.toBuffer(),
      receiver.toBuffer(),
    ],
    program.programId,
  )[0];
};

export const getConnectionVaultPubKey = (
  program: Program<Legacy3Type>,
  connection: PublicKey,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [getSeed('connectionVaultSeed', program), connection.toBuffer()],
    program.programId,
  )[0];
};

export const getConfigTokenAccountPubKey = (
  program: Program<Legacy3Type>,
  collection: PublicKey,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [getSeed('configTokenSeed', program), collection.toBuffer()],
    program.programId,
  )[0];
};

export const getNftMintPubKey = (
  program: Program<Legacy3Type>,
  nftName: string,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [getSeed('configTokenSeed', program), Buffer.from(nftName)],
    program.programId,
  )[0];
};

export const getAddressLookupTablePubKey = (
  authority: PublicKey,
  recentSlot: number,
) => {
  return PublicKey.findProgramAddressSync(
    [authority.toBuffer(), toBuffer(new anchor.BN(recentSlot), 'le', 8)],
    anchor.web3.AddressLookupTableProgram.programId,
  )[0];
};

export const getTokenMetadataPubKey = (token: PublicKey) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
      token.toBuffer(),
    ],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
  )[0];
};

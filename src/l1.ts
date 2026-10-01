import { getContract, type Address, type PublicClient, type GetContractReturnType } from 'viem';
import { PTLCChannelAbi, InsuranceVaultAbi, L1ValidatorAbi, DisputeTribunalAbi, ZKVerifierAbi } from './abi/index.js';

/** Typed viem bindings. For state-changing functions, pass the exported ABI to a WalletClient. */
export interface L1Bindings {
  ptlcChannel: GetContractReturnType<typeof PTLCChannelAbi, PublicClient>;
  insuranceVault: GetContractReturnType<typeof InsuranceVaultAbi, PublicClient>;
  l1Validator: GetContractReturnType<typeof L1ValidatorAbi, PublicClient>;
  disputeTribunal: GetContractReturnType<typeof DisputeTribunalAbi, PublicClient>;
  zkVerifier: GetContractReturnType<typeof ZKVerifierAbi, PublicClient>;
}

export function createL1Bindings(client: PublicClient, addresses: {
  ptlcChannel: Address; insuranceVault: Address; l1Validator: Address;
  disputeTribunal: Address; zkVerifier: Address;
}): L1Bindings {
  return {
    ptlcChannel: getContract({ address: addresses.ptlcChannel, abi: PTLCChannelAbi, client }),
    insuranceVault: getContract({ address: addresses.insuranceVault, abi: InsuranceVaultAbi, client }),
    l1Validator: getContract({ address: addresses.l1Validator, abi: L1ValidatorAbi, client }),
    disputeTribunal: getContract({ address: addresses.disputeTribunal, abi: DisputeTribunalAbi, client }),
    zkVerifier: getContract({ address: addresses.zkVerifier, abi: ZKVerifierAbi, client }),
  };
}

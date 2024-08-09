# HBAR Allowances and Atomic Transfers

This repository demonstrates how to perform HBAR allowances and atomic crypto transfers (HBAR, HTS fungible tokens, and HTS NFTs in the same transfer via a contract transaction). It uses a Hardhat project to test the flow of creating HTS tokens, approving allowances (HBAR & HTS), associating HTS tokens to Hedera accounts, and performing the atomic crypto transfer.

### [HIP 206: Hedera Token Service Precompiled Contract for Hedera SmartContract Service](https://hips.hedera.com/hip/hip-206)

- Defines a new function to the Hedera Token Service system contract that allows for the atomic transfer of HBAR, fungible tokens and non-fungible tokens.
- Function `cryptoTransfer(TransferList transferList,TokenTransferList[] tokenTransfer)`
- Exposes an existing HAPI call via smart contracts.
- Transfer honors granted allowances.

**Benefits:**

- Enables native royalty support on the EVM since native $hbar can now be transferred using spending allowances
- Direct interaction with HBAR and HTS tokens
- Eliminates the need for token wrapping.
- Enhances efficiency and reduces complexity.
- Cuts costs by removing intermediary steps i.e., wrapping assets to interact with them.
- Enables native royalty support on the EVM since native HBAR can now be transferred using spending allowances

### [HIP 906: Proxy Redirect Contract for Hbar Allowance and Approval](https://hips.hedera.com/hip/hip-906)

- Introduces a new Hedera Account Service system contract.
- Enables querying and granting approval of HBAR to a spender account from smart contracts code
- `hbarAllowance`, `hbarApprove`
- Developers do not have to context switch out of smart contract code

**Benefits:**

- Introduces new account proxy contract for HBAR allowances
- Enables grant, retrieve, and manage HBAR allowances within smart contracts
- Developers do not have to context switch out of smart contracts code
- Simplifies workflows and enhances security
- Expands potential use cases, especially for DeFi and token marketplaces

## Try It on the Browser:

[Open with GitPod](https://gitpod.io/?autostart=true#https://github.com/ed-marquez/hedera-example-hbar-allowances-and-atomic-transfers)

## Try It Locally:

### Prerequisites

- Node.js
- npm
- A Hedera account with ECDSA credentials

### Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ed-marquez/hedera-example-hbar-allowances-and-atomic-transfers.git
   cd hedera-example-hbar-allowances-and-atomic-transfers
   ```
2. **Rename the `example.env` file to `.env` and enter the ECDSA credentials for the 3 accounts needed**:
   ```bash
   mv example.env .env
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the test script:**:
   ```bash
   npx hardhat test
   ```

## Project Structure

- `.env`: Environment variables file (be sure to rename `example.env` to `.env` and fill in your credentials).
- `constants.js`: Contains constants and network configurations.
- `hardhat.config.js`: Hardhat configuration file.
- `atomicTransfer.test.js`: Contains the test script for performing the atomic transfers.

## Flow Description

1. **Initialize Environment Variables**:
   - Rename `example.env` to `.env` and fill in your ECDSA account credentials.
2. **Use Environment Variables**:
   - The credentials from `.env` are used in `constants.js`.
3. **Configure Hardhat**:
   - The constants from `constants.js` are used in `hardhat.config.js` for network and account configuration.
4. **Run Tests**:
   - Tests in `atomicTransfer.test.js` create tokens, approve allowances, associate HTS tokens to Hedera accounts, and perform the atomic crypto transfer.

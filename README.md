# HBAR Allowances and Atomic Transfers

This repository demonstrates how to perform HBAR allowances and atomic crypto transfers (HBAR, HTS fungible tokens, and HTS NFTs in the same transfer via a contract transaction). It uses a Hardhat project to test the flow of creating HTS tokens, approving allowances (HBAR & HTS), associating HTS tokens to Hedera accounts, and performing the atomic crypto transfer.

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

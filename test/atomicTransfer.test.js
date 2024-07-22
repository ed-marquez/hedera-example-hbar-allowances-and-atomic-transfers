const { expect } = require("chai");
const { ethers } = require("hardhat");

// Constants
const { OPERATOR_ID, OPERATOR_KEY_DER, OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX, NETWORKS } = require("../constants");

// Hedera SDK and SDK utilities
const { Client, AccountId, PrivateKey, Hbar } = require("@hashgraph/sdk");
const htsTokens = require("../utils/tokenOperations.js");

// ABIs
// For HBAR allowances via IHRC-632
const IHRC632ABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-account-service/IHRC632.sol/IHRC632.json");
const IHRC632ABI = new ethers.Interface(IHRC632ABI_JSON);
// For HTS token allowances via ERC interfaces
const ERC20MockABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/hip-583/ERC20Mock.sol/ERC20Mock.json");
const ERC20MockABI = new ethers.Interface(ERC20MockABI_JSON);
const ERC721MockABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/hip-583/ERC721Mock.sol/ERC721Mock.json");
const ERC721MockABI = new ethers.Interface(ERC721MockABI_JSON);
// For HTS token associations via IHRC-719
const IHRC719ABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-token-service/IHRC719.sol/IHRC719.json");
const IHRC719ABI = new ethers.Interface(IHRC719ABI_JSON);
// For HTS atomic cryptoTransfer operation
const IHederaTokenServiceABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol/IHederaTokenService.json");
const IHederaTokenServiceABI = new ethers.Interface(IHederaTokenServiceABI_JSON);

describe("HBAR Allowances and Atomic Transfers", function () {
	// Set up the network and signers
	const network = NETWORKS.testnet.name;
	const treasurySigner = new ethers.Wallet(OPERATOR_KEY_HEX, ethers.provider);
	const aliceSigner = new ethers.Wallet(ALICE_KEY_HEX, ethers.provider);
	const bobSigner = new ethers.Wallet(BOB_KEY_HEX, ethers.provider);

	// Set up the Hedera SDK client (for HTS token creation)
	const treasuryId = AccountId.fromString(OPERATOR_ID);
	const treasuryKey = PrivateKey.fromStringDer(OPERATOR_KEY_DER);
	const client = Client.forNetwork(network).setOperator(treasuryId, treasuryKey);
	client.setDefaultMaxTransactionFee(new Hbar(50));
	client.setDefaultMaxQueryPayment(new Hbar(1));

	// Token setup
	let ftTokenId, ftTokenInfo, ftTokenAddress, nftTokenId, nftTokenInfo, nftTokenAddress;

	// HTS system contract address and gas limit
	const htsSystemContractAddress = "0x0000000000000000000000000000000000000167";
	const gasLimit = 1000000; // Set your desired gas limit

	// Amounts and serial numbers to approve and spend
	const hbarAmount = new Hbar(1); // Amount of HBAR to approve and transfer
	const ftAmount = BigInt(10); // Amount of fungible tokens to approve and transfer
	const nftSerialToSpend = BigInt(5); // Serial # of NFT to approve and transfer

	before(async function () {
		console.log(`- Checking accounts and setting up HTS tokens for test cases...\n`);

		// Log the account addresses
		console.log(`- Treasury address: ${treasurySigner.address}`);
		console.log(`- Alice address: ${aliceSigner.address}`);
		console.log(`- Bob address: ${bobSigner.address}`);

		// Create Fungible Token
		[ftTokenId, ftTokenInfo] = await htsTokens.createFtFcn("HBAR ROCKS FT", "FT_HROCK", 100, treasuryId, treasuryKey, client);
		ftTokenAddress = ftTokenId.toSolidityAddress();
		ftTokenAddress = `0x${ftTokenAddress}`;
		console.log(`\n- Fungible token ID: ${ftTokenId}`);
		console.log(`- Fungible token address: ${ftTokenAddress}`);
		console.log(`- Initial fungible token supply: ${ftTokenInfo.totalSupply.low}`);

		// Create the Non-Fungible Token
		[nftTokenId, nftTokenInfo] = await htsTokens.createMintNftFcn("HBAR ROCKS NFT", "NFT_HROCK", 0, 15, treasuryId, treasuryKey, client);
		nftTokenAddress = `0x${nftTokenId.toSolidityAddress()}`;
		console.log(`\n- NFT Collection ID: ${nftTokenId}`);
		console.log(`- NFT Collection address: ${nftTokenAddress}`);
		console.log(`- NFT Collection supply: ${nftTokenInfo.totalSupply.low}`);
	});

	it("Should approve Alice to spend HBAR on behalf of Treasury", async function () {
		const treasuryIHRC632 = await ethers.getContractAt(IHRC632ABI, treasurySigner.address, treasurySigner);

		const hbarApprovalTx = await treasuryIHRC632.hbarApprove(aliceSigner.address, hbarAmount.toTinybars().toString(), { gasLimit: gasLimit });
		const hbarApprovalRx = await hbarApprovalTx.wait();
		const txHash = hbarApprovalRx.hash;
		console.log(`\n- Hash for HBAR approval transaction: \n${txHash}`);

		expect(hbarApprovalRx).to.exist;
		expect(hbarApprovalRx.status).to.eq(1);
	});

	it("Should approve Alice to spend FT on behalf of Treasury", async function () {
		const treasuryIERC20 = await ethers.getContractAt(ERC20MockABI, ftTokenAddress, treasurySigner);

		const aliceAllowanceBefore = await treasuryIERC20.allowance(treasurySigner.address, aliceSigner.address);

		const ftApprovalTx = await treasuryIERC20.approve(aliceSigner.address, ftAmount, { gasLimit: gasLimit });
		const ftApprovalRx = await ftApprovalTx.wait();
		const txHash = ftApprovalRx.hash;
		console.log(`\n- Hash for fungible token approval transaction: \n${txHash}`);

		const aliceAllowanceAfter = await treasuryIERC20.allowance(treasurySigner.address, aliceSigner.address);

		expect(aliceAllowanceBefore).to.eq(0);
		expect(aliceAllowanceAfter).to.eq(ftAmount);
	});

	it("Should approve Alice to spend NFT on behalf of Treasury", async function () {
		const treasuryIERC721 = await ethers.getContractAt(ERC721MockABI, nftTokenAddress, treasurySigner);

		const aliceAllowanceBefore = await treasuryIERC721.getApproved(nftSerialToSpend);

		const nftApprovalTx = await treasuryIERC721.approve(aliceSigner.address, nftSerialToSpend, { gasLimit: gasLimit });
		const nftApprovalRx = await nftApprovalTx.wait();
		const txHash = nftApprovalRx.hash;
		console.log(`\n- Hash for NFT approval transaction: \n${txHash}`);

		const aliceAllowanceAfter = await treasuryIERC721.getApproved(nftSerialToSpend);

		expect(aliceAllowanceBefore).to.eq("0x0000000000000000000000000000000000000000");
		expect(aliceAllowanceAfter).to.eq(aliceSigner.address);
	});

	it("Should associate the fungible token with Bob", async function () {
		const bobFtAssociation = await ethers.getContractAt(IHRC719ABI, ftTokenAddress, bobSigner);

		const associateTx = await bobFtAssociation.associate({ gasLimit: gasLimit });
		const associateRx = await associateTx.wait();
		const txHash = associateRx.hash;
		console.log(`\n- Hash for Bob/FT association transaction: \n${txHash}`);

		expect(txHash).to.not.be.null;
	});

	it("Should associate the NFT with Bob", async function () {
		const bobNftAssociation = await ethers.getContractAt(IHRC719ABI, nftTokenAddress, bobSigner);

		const associateTx = await bobNftAssociation.associate({ gasLimit: gasLimit });
		const associateRx = await associateTx.wait();
		const txHash = associateRx.hash;
		console.log(`\n- Hash for Bob/NFT association transaction: \n${txHash}`);

		expect(txHash).to.not.be.null;
	});

	it("Should perform atomic transfer of HBAR, fungible tokens, and NFTs", async function () {
		// Check Bob's balance before the atomic transfer
		const bobHbarBalanceBefore = await ethers.provider.getBalance(bobSigner.address);

		// Construct transfer lists
		const cryptoTransfers = {
			transfers: [
				{
					accountID: treasurySigner.address,
					amount: hbarAmount.negated().toTinybars().toString(),
					isApproval: true,
				},
				{
					accountID: bobSigner.address,
					amount: hbarAmount.toTinybars().toString(),
					isApproval: false,
				},
			],
		};

		const tokenTransferList = [
			{
				token: ftTokenAddress,
				transfers: [
					{
						accountID: treasurySigner.address,
						amount: -ftAmount,
						isApproval: true,
					},
					{
						accountID: bobSigner.address,
						amount: ftAmount,
						isApproval: false,
					},
				],
				nftTransfers: [],
			},
			{
				token: nftTokenAddress,
				transfers: [],
				nftTransfers: [
					{
						senderAccountID: treasurySigner.address,
						receiverAccountID: bobSigner.address,
						serialNumber: nftSerialToSpend,
						isApproval: true,
					},
				],
			},
		];

		// Execute the atomic transfer
		const treasuryIHederaTokenService = await ethers.getContractAt(IHederaTokenServiceABI, htsSystemContractAddress, aliceSigner);

		const atomicTransferTx = await treasuryIHederaTokenService.cryptoTransfer(cryptoTransfers, tokenTransferList);
		const atomicTransferRx = await atomicTransferTx.wait();
		const txHash = atomicTransferRx.hash;
		console.log(`\n- Hash for atomic crypto transfer transaction: \n${txHash}`);

		// Verify the results
		const bobHbarBalanceAfter = await ethers.provider.getBalance(bobSigner.address);
		expect(bobHbarBalanceBefore).to.not.equal(bobHbarBalanceAfter);

		const IERC20 = await ethers.getContractAt(ERC20MockABI, ftTokenAddress);
		const bobFtBalance = await IERC20.balanceOf(bobSigner.address);
		expect(bobFtBalance).to.equal(ftAmount);

		const IERC721 = await ethers.getContractAt(ERC721MockABI, nftTokenAddress);
		const ownerOfNftSent = await IERC721.ownerOf(nftSerialToSpend);
		expect(ownerOfNftSent).to.equal(bobSigner.address);
	});
});

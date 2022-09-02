import axios, { AxiosResponse } from 'axios';
import LRU from 'lru-cache';
import BN from 'bn.js';

const apiKey = process.env.ETHERSCAN_API_KEY;
const baseURL = 'https://api.etherscan.io/api';

interface RPCResponse<T> {
    jsonrpc: string;
    id: number;
    result: T;
}

interface EtherscanResponse<T> {
    status: string;
    message: string;
    result: T;
}

interface CountdownDetails {
    CurrentBlock: string;
    CountdownBlock: string;
    RemainingBlock: string;
    EstimateTimeInSec: string;
}

export interface BlockDetails {
    difficulty: string;
    totalDifficulty: string;
    timestamp: string;
    number: string;
}

export interface EstimatedMergeInfo {
    /// The latest block number
    latestBlockNumber: string;
    /// The total difficulty as of the latest block
    latestTotalDifficulty: string;
    /// The total difficulty that will trigger The Merge
    terminalTotalDifficulty: string;
    /// The estimated block number of the merge block
    estimatedMergeBlockNumber: string;
    /// The estimated date of The Merge, in unix seconds
    estimatedMergeDate: number;
}

/// The last several known block difficulty level for use in estimations
const latestDifficulties: BN[] = [];
/// The max number of difficulties to store for the average calculation
const maxNumberOfDifficulties = 100;
/// The total difficulty that will trigger The Merge
const terminalTotalDifficulty = new BN('58750000000000000000000');
/// The timestamp of the latest block that was fetched
let timestampOfLatestBlockFetched: number = 0;

/// Map of block number (base-10 string) to the estimated date of that block
const estimatedBlockDateCache = new LRU<string, Date>({
    max: 1000,
    ttl: 1000 * 60 * 60, // one hour
});

/// Fetch the latest block number tag
export const fetchBlockNumberTag = async (): Promise<string> => {
    const params = {
        module: 'proxy',
        action: 'eth_blockNumber',
        apikey: apiKey,
    };
    const response: AxiosResponse<RPCResponse<string>> = await axios.get(baseURL, { params });
    return response.data.result;
};

/// Fetch details about a block
export const fetchBlockDetails = async (tag: string): Promise<BlockDetails> => {
    const params = {
        module: 'proxy',
        action: 'eth_getBlockByNumber',
        tag,
        boolean: 'false', // whether to include full transactions
        apikey: apiKey,
    };
    const response: AxiosResponse<RPCResponse<BlockDetails>> = await axios.get(baseURL, { params });
    return response.data.result;
};

export const fetchEstimatedTimeUntilBlock = async (blockNo: BN): Promise<number> => {
    const params = {
        module: 'block',
        action: 'getblockcountdown',
        blockno: blockNo.toString(10),
        apikey: apiKey,
    };
    const response: AxiosResponse<EtherscanResponse<CountdownDetails>> = await axios.get(baseURL, { params });
    return parseInt(response.data.result.EstimateTimeInSec);
};

export const fetchEstimatedMergeInfo = async (): Promise<EstimatedMergeInfo> => {
    const tag = await fetchBlockNumberTag();
    const block = await fetchBlockDetails(tag);
    updateCachedValuesWithBlock(block);

    console.log(`Cached blocks: ${latestDifficulties.length}`);

    const latestBlockNumber = new BN(block.number.slice(2), 'hex');
    const latestTotalDifficulty = new BN(block.totalDifficulty.slice(2), 'hex');

    const remainingDifficulty = terminalTotalDifficulty.sub(latestTotalDifficulty);
    const averageDifficulty = calculateAverageBlockDifficulty();
    const estimatedBlocksRemaining = remainingDifficulty.div(averageDifficulty).toNumber();
    const estimatedMergeBlockNumber = latestBlockNumber.add(new BN(estimatedBlocksRemaining));
    const estimatedMergeDate = await getOrFetchEstimatedBlockDate(estimatedMergeBlockNumber);

    return {
        latestBlockNumber: latestBlockNumber.toString(10),
        latestTotalDifficulty: latestTotalDifficulty.toString(10),
        terminalTotalDifficulty: terminalTotalDifficulty.toString(10),
        estimatedMergeBlockNumber: estimatedMergeBlockNumber.toString(10),
        estimatedMergeDate: Math.floor(estimatedMergeDate.getTime() / 1000),
    };
};

// Helper functions

const updateCachedValuesWithBlock = (block: BlockDetails) => {
    const timestamp = parseInt(block.timestamp.slice(2), 16);
    if (timestamp > timestampOfLatestBlockFetched) {
        timestampOfLatestBlockFetched = timestamp;
        const difficulty = new BN(block.difficulty.slice(2), 'hex');
        latestDifficulties.push(difficulty);
        if (latestDifficulties.length > maxNumberOfDifficulties) {
            const deleteCount = latestDifficulties.length - maxNumberOfDifficulties;
            latestDifficulties.splice(0, deleteCount);
        }
    }
};

const calculateAverageBlockDifficulty = (): BN => {
    const total = latestDifficulties.reduce((result, current) => {
        return result.add(current);
    }, new BN(0));
    const average = total.div(new BN(latestDifficulties.length));
    return average;
};

const getOrFetchEstimatedBlockDate = async (blockNo: BN): Promise<Date> => {
    const blockNumberString = blockNo.toString(10);
    const cached = estimatedBlockDateCache.get(blockNumberString);
    if (cached != null) {
        console.log(`Using cached date for block number ${blockNumberString}`);
        return cached;
    }

    console.log(`Fetching estimated time until block: ${blockNumberString}`);
    const timeUntilBlock = await fetchEstimatedTimeUntilBlock(blockNo);
    const blockDate = new Date(Date.now() + timeUntilBlock * 1000);
    estimatedBlockDateCache.set(blockNumberString, blockDate);
    return blockDate;
};

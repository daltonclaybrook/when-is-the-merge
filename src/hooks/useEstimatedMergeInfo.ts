import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

const apiBaseURL = process.env.REACT_APP_API_BASE_URL as string;

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

export const useEstimatedMergeInfo = () => {
    const [mergeInfo, setMergeInfo] = useState<EstimatedMergeInfo | null>(null);

    const fetchAndSetMergeInfo = () => {
        fetchEstimatedMergeInfo().then((mergeInfo) => {
            if (mergeInfo != null) {
                // Only set if it is non-null. This way, the users experience is still acceptable
                // if the API returns an error.
                setMergeInfo(mergeInfo);
            }
        });
    };

    useEffect(() => {
        fetchAndSetMergeInfo();
        const timer = setInterval(() => {
            fetchAndSetMergeInfo();
        }, 30 * 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);
    return mergeInfo;
};

const fetchEstimatedMergeInfo = async (): Promise<EstimatedMergeInfo | null> => {
    try {
        const response: AxiosResponse<EstimatedMergeInfo> = await axios.get(apiBaseURL);
        return response.data;
    } catch (err) {
        console.error(`Error fetching estimated merge info: ${err}`);
        return null;
    }
};

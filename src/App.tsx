import { FC, useEffect } from 'react';
import ReactGA from 'react-ga';
import './App.css';
import { useCountdown } from './hooks/useCountdown';
import { useEstimatedMergeInfo, EstimatedMergeInfo } from './hooks/useEstimatedMergeInfo';

const App: FC = () => {
    const mergeInfo = useEstimatedMergeInfo();
    useEffect(() => {
        ReactGA.pageview(window.location.pathname);
    }, []);

    return (
        <div className="App">
            <h1>
                When is{' '}
                <a href="https://blog.ethereum.org/2022/08/24/mainnet-merge-announcement/" target="_blank" rel="noreferrer">
                    <i>The Merge</i>?
                </a>
            </h1>
            {mergeInfo && <MergeInfo {...mergeInfo} />}
            {!mergeInfo && <p>Loading...</p>}
        </div>
    );
};

const MergeInfo: FC<EstimatedMergeInfo> = ({
    latestBlockNumber,
    latestTotalDifficulty,
    terminalTotalDifficulty,
    estimatedMergeBlockNumber,
    estimatedMergeDate,
}) => {
    const mergeDate = new Date(estimatedMergeDate * 1000);
    const countdownString = useCountdown(mergeDate);
    return (
        <div>
            <h2>{countdownString}</h2>
            <h3>{mergeDate.toLocaleString()}</h3>
            <p>(estimated)</p>
            <hr />
            <a href={`https://etherscan.io/block/${latestBlockNumber}`} target="_blank" rel="noreferrer">
                <h3>{latestBlockNumber}</h3>
            </a>
            <p>latest block number</p>
            <hr />
            <h3>{estimatedMergeBlockNumber}</h3>
            <p>estimated merge block number</p>
            <hr />
            <h3>{formatNumber(latestTotalDifficulty)}</h3>
            <p>latest total difficulty</p>
            <hr />
            <h3>{formatNumber(terminalTotalDifficulty)}</h3>
            <p>terminal total difficulty</p>
        </div>
    );
};

const formatNumber = (string: string) => {
    const formatter = new Intl.NumberFormat();
    return formatter.format(BigInt(string));
};

export default App;

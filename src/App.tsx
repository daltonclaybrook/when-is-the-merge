import { FC } from 'react';
import './App.css';
import { useEstimatedMergeInfo, EstimatedMergeInfo } from './useEstimatedMergeInfo';

const App: FC = () => {
    const mergeInfo = useEstimatedMergeInfo();

    return (
        <div className="App">
            <h1>
                When is <i>The Merge</i>?
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
}) => (
    <div>
        <h2>{dateString(estimatedMergeDate)}</h2>
        <hr />
        <h3>{latestBlockNumber}</h3>
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

const dateString = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
};

const formatNumber = (string: string) => {
    const formatter = new Intl.NumberFormat();
    return formatter.format(BigInt(string));
};

export default App;

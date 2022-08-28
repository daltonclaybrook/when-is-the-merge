import { FC, useEffect } from 'react';
import ReactGA from 'react-ga';
import './App.css';
import { useCountdown } from './hooks/useCountdown';
import { useEstimatedMergeInfo, EstimatedMergeInfo } from './hooks/useEstimatedMergeInfo';
import logoSVG from './svg/logo.svg';
import arrowSVG from './svg/arrow.svg';

const App: FC = () => {
    const mergeInfo = useEstimatedMergeInfo();
    useEffect(() => {
        ReactGA.pageview(window.location.pathname);
    }, []);

    return (
        <div className="Container">
            <div className="TopSection">
                <Logo />
                {mergeInfo && <DateAndCountdown {...mergeInfo} />}
                {!mergeInfo && <p>Loading...</p>}
            </div>
            {mergeInfo && <BottomGrid {...mergeInfo} />}
        </div>
    );
};

const Logo: FC = () => (
    <div className="LogoContainer">
        <h1>When is The Merge?</h1>
        <a href="https://blog.ethereum.org/2022/08/24/mainnet-merge-announcement/" target="_blank" rel="noreferrer">
            <img className="Logo" src={logoSVG} alt="The Merge Logo" />
        </a>
    </div>
);

const DateAndCountdown: FC<EstimatedMergeInfo> = ({ estimatedMergeDate }) => {
    const mergeDate = new Date(estimatedMergeDate * 1000);
    const countdownString = useCountdown(mergeDate) ?? '';
    return (
        <>
            <LabelPair size="Large" label="Estimated date" value={formatDate(mergeDate)} />
            <LabelPair size="Large" label="Countdown" value={countdownString} />
        </>
    );
};

const BottomGrid: FC<EstimatedMergeInfo> = ({
    latestBlockNumber,
    estimatedMergeBlockNumber,
    latestTotalDifficulty,
    terminalTotalDifficulty,
}) => (
    <div className="BottomSection">
        <div className="HorizontalLine" />

        <div className="BottomRow">
            <div className="BottomBox">
                <LabelPair
                    size="Medium"
                    label="Latest block"
                    value={`${latestBlockNumber}`}
                    linkURL={`https://etherscan.io/block/${latestBlockNumber}`}
                />
            </div>
            <div className="BoxSeparator" />
            <div className="BottomBox">
                <LabelPair size="Medium" label="Estimated merge block" value={`${estimatedMergeBlockNumber}`} />
            </div>
        </div>

        <div className="HorizontalLine" />

        <div className="BottomRow">
            <div className="BottomBox">
                <LabelPair size="Small" label="Latest total difficulty" value={formatNumber(latestTotalDifficulty)} />
            </div>
            <div className="BoxSeparator" />
            <div className="BottomBox">
                <LabelPair size="Small" label="Terminal total difficulty" value={formatNumber(terminalTotalDifficulty)} />
            </div>
        </div>

        <div className="HorizontalLine" />
    </div>
);

interface LabelPairProps {
    label: string;
    value: string;
    size: 'Small' | 'Medium' | 'Large';
    linkURL?: string;
}

const LabelPair: FC<LabelPairProps> = ({ label, value, size, linkURL }) => (
    <div className="LabelPair">
        <h6 className={`Label ${size}`}>{label}</h6>
        <a className="LabelPairLinkContainer" href={linkURL} target="_blank" rel="noreferrer">
            <h3 className={`Value ${size}`}>{value}</h3>
            {linkURL && <img src={arrowSVG} alt="Arrow" />}
        </a>
    </div>
);

// Helper functions

const formatNumber = (string: string) => {
    const formatter = new Intl.NumberFormat();
    return formatter.format(BigInt(string));
};

const formatDate = (date: Date) => {
    const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
    return `${dateFormatter.format(date)}\n${timeFormatter.format(date)}`;
};

export default App;

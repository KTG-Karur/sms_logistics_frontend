import { FC } from 'react';

interface IconPieChartProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconPieChart: FC<IconPieChartProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                opacity={duotone ? '0.5' : '1'}
                d="M20.5 13.5C20.5 16.5 19 19 16.5 20.5C14 22 10.5 22 8 20.5C5.5 19 4 16.5 4 13.5C4 9.5 7.5 6 11.5 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20.5 9.5C20.5 6.5 18 4 15 4C12 4 9.5 6.5 9.5 9.5C9.5 12.5 12 15 15 15C18 15 20.5 12.5 20.5 9.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path
                d="M15 15V4C15 2.5 13.5 1.5 12.5 2C10 3 8 5.5 8 9.5C8 13.5 10 16 14 17.5C15 18 16 17 16 15.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15 4.5C17.5 5.5 19.5 8 20 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
};

export default IconPieChart;
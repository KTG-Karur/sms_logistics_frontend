import { FC } from 'react';

interface IconCashProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconCash: FC<IconCashProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M2 9C2 7.89543 2.89543 7 4 7H20C21.1046 7 22 7.89543 22 9V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M17 12H17.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M7 12H7.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M4 7V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : duotone ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M4 7C2.89543 7 2 7.89543 2 9V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17V9C22 7.89543 21.1046 7 20 7H4Z"
                        fill="currentColor"
                    />
                    <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        fill="currentColor"
                    />
                    <path
                        d="M6 3C4.89543 3 4 3.89543 4 5V7H20V5C20 3.89543 19.1046 3 18 3H6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M17 12C17 12.5523 16.5523 13 16 13C15.4477 13 15 12.5523 15 12C15 11.4477 15.4477 11 16 11C16.5523 11 17 11.4477 17 12Z"
                        fill="white"
                    />
                    <path
                        d="M9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12Z"
                        fill="white"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        d="M4 7C2.89543 7 2 7.89543 2 9V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17V9C22 7.89543 21.1046 7 20 7H4Z"
                        fill="currentColor"
                    />
                    <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        fill="white"
                    />
                    <path
                        d="M6 3C4.89543 3 4 3.89543 4 5V7H20V5C20 3.89543 19.1046 3 18 3H6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M17 12H17.01C17.01 12.5523 16.5623 13 16.01 13C15.4577 13 15.01 12.5523 15.01 12C15.01 11.4477 15.4577 11 16.01 11C16.5623 11 17.01 11.4477 17.01 12H17Z"
                        fill="white"
                    />
                    <path
                        d="M8 12H8.01C8.01 12.5523 7.56228 13 7.01 13C6.45772 13 6.01 12.5523 6.01 12C6.01 11.4477 6.45772 11 7.01 11C7.56228 11 8.01 11.4477 8.01 12H8Z"
                        fill="white"
                    />
                </svg>
            )}
        </>
    );
};

export default IconCash;
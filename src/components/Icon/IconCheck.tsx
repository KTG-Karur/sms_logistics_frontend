// IconCheck.tsx
import { FC } from 'react';

interface IconCheckProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconCheck: FC<IconCheckProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
};

export default IconCheck;
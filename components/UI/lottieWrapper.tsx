import React from 'react'
import dynamic from 'next/dynamic'

interface LottieWrapperProps {
    animationData: unknown;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const LottieWrapper: React.FC<LottieWrapperProps> = ({
    animationData,
    className,
    loop = false,
    autoplay = true,
    style,
    onClick,
    ...props
}) => {
    const Lottie = dynamic(() => import('lottie-react'), {
        ssr: false
    });

    return (
        <Lottie
            animationData={animationData}
            className={className}
            loop={loop}
            autoplay={autoplay}
            style={style}
            onClick={onClick}
            {...props}
        />
    )
}

export default LottieWrapper
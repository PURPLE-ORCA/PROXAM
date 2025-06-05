import { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="/images/proxamlogo.png" alt="Proxam Logo" />
    );
}

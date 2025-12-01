import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type Props = RNTextProps & { className?: string };

export function MonoText({ className, style, ...props }: Props) {
  return <RNText {...props} className={className} style={[style, { fontFamily: 'Kanit' }]} />;
}

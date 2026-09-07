import React from 'react';
import { Text, TextProps } from 'react-native';

export default function AppText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.default, style]} />;
}

const styles = { default: { textAlign: 'justify' as const } };

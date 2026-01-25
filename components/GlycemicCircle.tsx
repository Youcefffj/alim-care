import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/Colors';

interface Props {
  value: number;
  max: number;
  label: string;
  onPress?: () => void;
}

export const GlycemicCircle = ({ value, max, label, onPress }: Props) => {
  const radius = 65;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / max) * circumference;
  
  // Calcul de la position du point blanc au bout de l'arc
  const progressAngle = (value / max) * 360;
  const angleInRadians = ((progressAngle - 90) * Math.PI) / 180;
  const dotX = radius + normalizedRadius * Math.cos(angleInRadians);
  const dotY = radius + normalizedRadius * Math.sin(angleInRadians);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.svgWrapper}>
        <Svg height={radius * 2} width={radius * 2}>
          <Circle
            stroke={Colors.gris}
            fill="transparent"
            strokeWidth={stroke}
            cx={radius}
            cy={radius}
            r={normalizedRadius}
          />
          <Circle
            stroke={Colors.primary}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
          {/* Point blanc au bout de l'arc */}
          <Circle
            cx={dotX}
            cy={dotY}
            r={6}
            fill="#FFF"
            stroke={Colors.primary}
            strokeWidth={2}
          />
        </Svg>
        <View style={styles.textOverlay}>
          <Text style={styles.valueText}>
            {value}/
            {'\n'}
            {max}
          </Text>
          <Text style={styles.unitText}>mg/dL</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  label: { 
    fontSize: 13, 
    color: Colors.contrastMainII, 
    marginBottom: 12, 
    fontWeight: '600',
    textAlign: 'center',
  },
  svgWrapper: { justifyContent: 'center', alignItems: 'center' },
  textOverlay: { position: 'absolute', alignItems: 'center' },
  valueText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.contrastMainII,
    textAlign: 'center',
    lineHeight: 22,
  },
  unitText: { fontSize: 11, color: Colors.grayDark, marginTop: 2 },
});
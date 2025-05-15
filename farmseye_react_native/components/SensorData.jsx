// import React from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const iconMap = {
  TEMP: <Ionicons name="thermometer" size={24} color="#000" />,
  HUMI: <MaterialCommunityIcons name="water-percent" size={24} color="#000" />,
  NO2: <MaterialCommunityIcons name="molecule-co" size={24} color="#000" />,
  CO2: <FontAwesome5 name="cloud" size={24} color="#000" />,
  NH3: <MaterialCommunityIcons name="chemical-weapon" size={24} color="#000" />,
  H2S: <MaterialCommunityIcons name="gas-cylinder" size={24} color="#000" />,
  TOLUENE: <MaterialCommunityIcons name="flask" size={24} color="#000" />,
  ILLUMI: <Ionicons name="sunny" size={24} color="#000" />,
};

const unitMap = {
  TEMP: '°C',
  HUMI: '%',
  NO2: 'ppm',
  CO2: 'ppm',
  NH3: 'ppm',
  H2S: 'ppm',
  TOLUENE: 'ppm',
  ILLUMI: 'ADC',
};

const labelMap = {
  TEMP: '온도',
  HUMI: '습도',
  NO2: '이산화질소',
  CO2: '이산화탄소',
  NH3: '암모니아',
  H2S: '황화수소',
  TOLUENE: '톨루엔',
  ILLUMI: '조도',
};

const SensorData = ({ data, eva, color, filterKeys  }) => {
  if (!data) return <Text style={styles.noData}>데이터가 없습니다.</Text>;

  const renderCard = (key, value) => {
    const 평가 = eva ? eva(value, key.toLowerCase()) : '알 수 없음';
    const 배경색 = color ? color(value, key.toLowerCase()) : '#f2f2f2';

    return (
      <View key={key} style={[styles.card, { backgroundColor: 배경색 }]}>
        {iconMap[key]}
        <Text style={styles.label}>{labelMap[key] || key}</Text>
        <Text style={styles.value}>
          {value} {unitMap[key] || ''}
        </Text>
        <Text style={styles.state}>{평가}</Text>
      </View>
  );
};

  return (
    // <ScrollView contentContainerStyle={styles.container}>
    //   <Text style={styles.title}>센서 데이터</Text>

    //   <View style={styles.grid}>
    //     {renderCard('온도', data.TEMP, '°C')}
    //     {renderCard('습도', data.HUMI, '%')}
    //     {renderCard('이산화질소 (NO2)', data.NO2, 'ppm')}
    //     {renderCard('이산화탄소 (CO2)', data.CO2, 'ppm')}
    //     {renderCard('암모니아 (NH3)', data.NH3, 'ppm')}
    //     {renderCard('황화수소 (H2S)', data.H2S, 'ppm')}
    //     {renderCard('톨루엔', data.TOLUENE, 'ppm')}
    //     {renderCard('조도', data.ILLUMI)}
    //   </View>

    //   <Text style={styles.timestamp}>마지막 업데이트: {data.TIMESTAMP}</Text>
    // </ScrollView>


    // <ScrollView contentContainerStyle={styles.container}>
    //   <Text style={styles.title}>센서 데이터</Text>

    //   <View style={styles.grid}>
    //     {Object.entries(data).map(([key, value]) => {
    //       if (key === 'TIMESTAMP') return null;
    //       return renderCard(key, value);
    //     })}
    //   </View>

    //   <Text style={styles.timestamp}>마지막 업데이트: {data.TIMESTAMP}</Text>
    // </ScrollView>

    <View style={styles.grid}>
      {Object.entries(data).map(([key, value]) => {
        if (key === 'TIMESTAMP') return null;
        if (filterKeys && !filterKeys.includes(key)) return null; // 필터링
        return renderCard(key, value);
      })}
    </View>
  )
}

export default SensorData

const styles = StyleSheet.create({
  // container: {
  //   padding: 16,
  //   alignItems: 'center',
  // },
  // title: {
  //   fontSize: 22,
  //   fontWeight: 'bold',
  //   marginBottom: 12,
  // },
  // grid: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   justifyContent: 'center',
  // },
  // card: {
  //   width: '45%',
  //   backgroundColor: '#f2f2f2',
  //   padding: 12,
  //   margin: 8,
  //   borderRadius: 8,
  //   elevation: 3,
  // },
  // label: {
  //   fontSize: 16,
  //   fontWeight: '600',
  // },
  // value: {
  //   fontSize: 18,
  //   marginTop: 4,
  // },
  // timestamp: {
  //   marginTop: 16,
  //   fontSize: 14,
  //   color: '#555',
  // },
  // noData: {
  //   padding: 20,
  //   fontSize: 16,
  //   color: 'red',
  //   textAlign: 'center',
  // },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: '45%',
    padding: 12,
    margin: 8,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  value: {
    fontSize: 18,
    marginTop: 4,
    color: '#333',
  },
  state: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    marginTop: 16,
    fontSize: 14,
    color: '#555',
  },
  noData: {
    padding: 20,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
})
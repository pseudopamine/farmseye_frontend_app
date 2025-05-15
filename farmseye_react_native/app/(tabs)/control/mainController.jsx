import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import SensorData from '@/components/SensorData';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MainControllerScreen = () => {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 센서 데이터 가져오기
  const fetchSensorData = async () => {
    try {
      const res = await axios.get('http://192.168.30.236:5000/api/sensor-data');
      setSensorData(res.data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 자동화 규칙 체크 및 적용
  const checkRules = async () => {
    try {
      const res = await axios.get('http://192.168.30.236:5000/api/rules/check');
      console.log('자동화 규칙 체크 결과:', res.data);
    } catch (err) {
      console.error('규칙 체크 오류:', err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로딩 및 주기적인 데이터 업데이트
  useEffect(() => {
    fetchSensorData();
    checkRules();

    const interval = setInterval(() => {
      fetchSensorData();
      checkRules();
    }, 5 * 60000); // 5*60초마다 갱신

    return () => clearInterval(interval);
  }, []);

  const eva = (value, type) => {
    // 간단 예시: 실제 기준값으로 조정 가능
    if (type === 'temp') return value > 30 ? '나쁨' : '좋음';
    if (type === 'humi') return value > 80 ? '매우 나쁨' : '보통';
    if (type === 'co2') return value > 1000 ? '나쁨' : '보통';
    if (type === 'no2') return value > 50 ? '나쁨' : '좋음';
    if (type === 'nh3') return value > 1 ? '나쁨' : '좋음';
    if (type === 'h2s') return value > 0.01 ? '나쁨' : '좋음';
    if (type === 'toluene') return value > 1 ? '나쁨' : '좋음';
    if (type === 'illumi') return value > 500 ? '좋음' : '어두움';
    return '알 수 없음';
  };

  const color = (value, type) => {
    const state = eva(value, type);
    switch (state) {
      case '좋음': return '#309898';
      case '보통': return '#FF9F00';
      case '나쁨': return '#F4631E';
      case '매우 나쁨': return '#CB0404';
      case '어두움': return '#2D4059';
      default: return '#71C9CE';
    }
  };

  



  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <SensorData data={sensorData} eva={eva} color={color} />
      )}
    </SafeAreaView>
  )
}

export default MainControllerScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    alignItems: 'center',
  },
  sensorName: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  sensorValue: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  error: {
    padding: 20,
    color: 'red',
    textAlign: 'center',
  },
})
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Pressable, Button, Modal, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { router } from 'expo-router';
import AirqRuleEditorScreen from './airqRuleEditor';
import SensorData from '@/components/SensorData';

const AirqControlScreen = () => {
  const [status, setStatus] = useState('');
  const [roofState, setRoofState] = useState('중간'); // 초기 상태
  const [showAutoControl, setShowAutoControl] = useState(false);

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
  }

    // 자동화 규칙 체크 및 적용
  const checkRules = async () => {
    try {
      const res = await axios.get('http://192.168.30.236:5000/api/rules/check');
      console.log('자동화 규칙 체크 결과:', res.data);
    } catch (err) {
      // console.error('규칙 체크 오류:', err);
    }
  };

    // 컴포넌트 마운트 시 데이터 로딩 및 주기적인 데이터 업데이트
    useEffect(() => {
      fetchSensorData();
      checkRules();
  
      const interval = setInterval(() => {
        fetchSensorData();
        checkRules();
      }, 5 * 60000); // 60초마다 갱신

      return () => clearInterval(interval);
  }, []);

  const eva = (value, type) => {
    // 간단 예시: 실제 기준값으로 조정 가능
    if (type === 'co2') return value > 1000 ? '나쁨' : '보통';
    if (type === 'no2') return value > 50 ? '나쁨' : '좋음';
    if (type === 'nh3') return value > 1 ? '나쁨' : '좋음';
    if (type === 'h2s') return value > 0.01 ? '나쁨' : '좋음';
    if (type === 'toluene') return value > 1 ? '나쁨' : '좋음';
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

  const angles = {
    열림: 0,
    중간: 90,
    닫힘: 180,
  };

  const handleRoofControl = async (state) => {
    const angle = angles[state];
    try {
      setStatus(`${state}으로 이동 중...`);
      await axios.post('http://192.168.30.236:5000/api/control/servo', 
        { angle },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setRoofState(state);
      setStatus(`루프가 '${state}' 상태로 설정되었습니다.`);
    } catch (error) {
      console.log(error);
      setStatus(`오류 발생: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 */}
      <View style={styles.header}>
        <Ionicons name="" size={24} color="black" />
        <Text style={styles.headerTitle}>FarmsEye</Text>
        <Ionicons name="" size={24} color="black" />
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabMenu}>
        <Pressable onPress={() => router.push('/control/tempControl')}>
          <Text style={styles.tabText}>에어컨</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/control/roofControl')}>
          <Text style={[styles.tabText, styles.activeTab]}>루프</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/control/luxControl')}>
          <Text style={styles.tabText}>조명</Text>
        </Pressable>
      </View>

      {/* 루프 이미지 */}
      <Image source={require('@/assets/images/roof.jpg')} style={styles.image} resizeMode="cover"/>

      {/* 상태 카드 */}
      <View style={styles.statusCards}>
        {/* <View style={styles.statusCard}>
          <Text style={styles.sensorLabel}>CO2</Text>
          <Text style={styles.sensorValue}>보통</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.sensorLabel}>NO2</Text>
          <Text style={styles.sensorValue}>좋음</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.sensorLabel}>NH3</Text>
          <Text style={styles.sensorValue}>나쁨</Text>
        </View> */}
        <SensorData data={sensorData} eva={eva} color={color}  filterKeys={['CO2', 'NO2', 'NH3', 'H2S']}/>
      </View>

      {/* 루프 제어 버튼 */}
      <View style={styles.controlBox}>
        {['열림', '중간', '닫힘'].map((state) => (
          <TouchableOpacity
            key={state}
            style={[styles.controlButton, roofState === state && styles.activeButton]}
            onPress={() => handleRoofControl(state)}
          >
            <Text style={styles.buttonText}>{state}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 상태 표시 */}
      <Text style={styles.statusMessage}>{status}</Text>

      {/* 자동제어 이동 */}
      <View style={{ marginHorizontal: 20, marginTop: 10 }}>
        <Button 
          title="자동 제어 설정"
          onPress={() => setShowAutoControl(true)}
          color="#309898"
        />

        <Modal
          visible={showAutoControl}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAutoControl(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}> 
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.modalTitle}>자동 제어 설정</Text>
                <AirqRuleEditorScreen />
                <Button title="닫기" onPress={() => setShowAutoControl(false)} color="#CB0404" />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  )
}

export default AirqControlScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tabMenu: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabButton: { marginHorizontal: 10 },
  tabText: { fontSize: 16, marginHorizontal: 16, color: '#888' },
  activeTab: { color: '#309898', fontWeight: 'bold' },
  image: { width: '100%', height: 140, backgroundColor: '#eef', marginBottom: 10 },
  statusCards: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  statusCard: { alignItems: 'center', backgroundColor: '#f2f2f2', padding: 14, borderRadius: 10, width: '28%' },
  sensorLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  sensorValue: { fontSize: 13, color: '#555' },
  controlBox: { flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 20, marginTop: 20 },
  controlButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  activeButton: { backgroundColor: '#309898' },
  buttonText: { color: '#000', fontSize: 16 },
  statusMessage: { textAlign: 'center', marginTop: 16, color: '#333', fontSize: 14 },
  autoControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  autoControlText: { fontSize: 16, color: '#333' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalContainer: {
    maxHeight: '80%',
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  modalScrollContent: {
    paddingBottom: 20,
  },
})
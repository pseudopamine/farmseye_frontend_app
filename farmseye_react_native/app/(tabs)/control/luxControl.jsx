import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Pressable, Image, Modal, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { router } from 'expo-router';
import LuxRuleEditorScreen from './luxRuleEditor';
import SensorData from '@/components/SensorData';

const LuxControlScreen = () => {
  const [ledState, setLedState] = useState('off');
  const [status, setStatus] = useState('');
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
    if (type === 'illumi') return value > 500 ? '좋음' : '어두움';
    return '알 수 없음';
  };

  const color = (value, type) => {
    const state = eva(value, type);
    switch (state) {
      case '좋음': return '#309898';
      case '어두움': return '#2D4059';
      default: return '#71C9CE';
    }
  };

  const controlLed = async (state) => {
    try {
      setStatus('조명 제어 중...');
      await axios.post('http://192.168.30.236:5000/api/control/led', 
        { state },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setLedState(state);
      setStatus(`조명이 ${state === 'on' ? '켜졌습니다' : '꺼졌습니다'}.`);
    } catch (error) {
      console.log(error);
      setStatus(`오류: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
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
          <Text style={styles.tabText}>루프</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/control/luxControl')}>
          <Text style={[styles.tabText, styles.activeTab]}>조명</Text>
        </Pressable>
      </View>

      {/* 조명 이미지 */}
      <Image source={require('@/assets/images/lamp.jpg')} style={styles.image} resizeMode="cover"/>

      {/* 제어 카드 */}
      <View style={styles.card}>
        <SensorData data={sensorData} eva={eva} color={color}  filterKeys={['ILLUMI']}/>
        
        <View style={styles.controlPanel}>
          {/* 전원 */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>전원</Text>
            <TouchableOpacity
              style={[
                styles.customButton,
                ledState === 'on' ? styles.activeOn : styles.inactive,
              ]}
              onPress={() => controlLed('on')}
            >
              <Text style={styles.buttonText}>켜기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.customButton,
                ledState === 'off' ? styles.activeOff : styles.inactive,
              ]}
              onPress={() => controlLed('off')}
            >
              <Text style={styles.buttonText}>끄기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <View style={{ marginTop: 20 }}>
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
                  <LuxRuleEditorScreen />
                  <Button title="닫기" onPress={() => setShowAutoControl(false)} color="#CB0404" />
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </View>
  )
}

export default LuxControlScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tabMenu: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabText: { fontSize: 16, marginHorizontal: 16, color: '#888' },
  activeTab: { color: '#309898', fontWeight: 'bold' },
  image: { width: '100%', height: 160, resizeMode: 'contain', marginBottom: 10 },
  card: { marginHorizontal: 20, marginTop: 10 },
  cardTitle: { fontSize: 20, marginVertical: 8 },
  cardStatus: { fontSize: 16, color: '#00C896', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statusText: { marginTop: 10, fontSize: 14, color: '#666' },
  controlPanel: { marginHorizontal: 20, marginTop: 10 },
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
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  controlLabel: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  customButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeOn: {
    backgroundColor: '#309898',
  },
  activeOff: {
    backgroundColor: '#CB0404',
  },
  inactive: {
    backgroundColor: 'gray',
  },
})
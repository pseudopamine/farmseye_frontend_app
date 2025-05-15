import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { api_env } from '../../../apis/envApis';
import { getUserSubFromToken } from '../../../redux/authHelper';
import SearchDetail from './searchDetail';

const SettingHome = () => {
  const [envInfo, setEnvInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        setUserId(getUserSubFromToken(token));
      }
      setLoading(false);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      api_env()
        .then(res => {
          setEnvInfo(res.data);
        })
        .catch(err => {
          console.log('환경 데이터 에러:', err);
        });
    }
  }, [userId]);

  const getLevelInfo = (min, max, level) => {
    if (min == null || max == null) {
      return { label: '-', color: '#ccc', range: '00~00' };
    }

    const step = (max - min) / 4;
    const start = min + step * (level - 1);
    const end = min + step * level;

    const labelMap = ['좋음', '보통', '주의', '위험'];
    const colorMap = ['#3790FA', '#36C48E', '#FFD447', '#FA5A5A'];

    return {
      label: labelMap[level - 1],
      color: colorMap[level - 1],
      range: `${start.toFixed(1)}~${end.toFixed(1)}`
    };
  };

  const categories = useMemo(() => {
    if (!envInfo) return [];
    return [
      {
        icon: <FontAwesome6 name="temperature-half" size={28} color="crimson" />,
        label: "온도 (°C)",
        key: "temp",
        min: envInfo.minTem,
        max: envInfo.maxTem,
      },
      {
        icon: <Ionicons name="water" size={28} color="deepskyblue" />,
        label: "습도 (%)",
        key: "humi",
        min: envInfo.minHumi,
        max: envInfo.maxHumi,
      },
      {
        icon: <FontAwesome6 name="lightbulb" size={28} color="darkorange" />,
        label: "조도 (lx)",
        key: "illumi",
        min: envInfo.minIllumi,
        max: envInfo.maxIllumi,
      },
      {
        icon: <MaterialCommunityIcons name="molecule-co2" size={28} color="black" />,
        label: "CO₂ (ppm)",
        key: "co2",
        min: envInfo.bouCo2,
        max: envInfo.danCo2,
      },
      {
        icon: <MaterialCommunityIcons name="weather-hazy" size={28} color="#B22222" />,
        label: "NO₂ (ppb)",
        key: "no2",
        min: envInfo.bouNo2,
        max: envInfo.danNo2,
      },
      {
        icon: <MaterialCommunityIcons name="chemical-weapon" size={28} color="#8B008B" />,
        label: "NH₃ (ppm)",
        key: "nh3",
        min: envInfo.bouNh3,
        max: envInfo.danNh3,
      },
      {
        icon: <MaterialCommunityIcons name="emoticon-dead-outline" size={28} color="#2E8B57" />,
        label: "H₂S (ppm)",
        key: "h2s",
        min: envInfo.bouH2s,
        max: envInfo.danH2s,
      },
      {
        icon: <MaterialCommunityIcons name="test-tube" size={28} color="#1E90FF" />,
        label: "Toluene (ppm)",
        key: "toluene",
        min: envInfo.bouToluene,
        max: envInfo.danToluene,
      },
    ];
  }, [envInfo]);

  const openModal = (category) => {
    setSelectedCategory({
      label: category.label,
      key: category.key,
      unit: category.label.split('(')[1]?.replace(')', '') ?? '',
      initialMin: category.min ?? '',
      initialMax: category.max ?? '',
    });
  };

  const closeModal = () => setSelectedCategory(null);

  const handleSave = (updatedValues) => {
    setEnvInfo(prev => ({ ...prev, ...updatedValues }));
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <Text>로딩 중...</Text>
      ) : (
        <>
          {categories.map((category, idx) => (
            <View key={idx} style={styles.categoryBox}>
              {/* 제목 */}
              <View style={styles.titleRow}>
                {category.icon}
                <Text style={styles.titleText}>{category.label}</Text>
              </View>

              {/* 상태 4개 + 설정 */}
              <View style={styles.statusRow}>
                <View style={styles.statusItemGroup}>
                  {[1, 2, 3, 4].map(level => {
                    const info = getLevelInfo(category.min, category.max, level);
                    return (
                      <View key={level} style={styles.statusItem}>
                        <Text style={styles.statusLabel}>{info.label}</Text>
                        <Text style={styles.rangeText}>{info.range}</Text>
                        <View style={[styles.dot, { backgroundColor: info.color }]} />
                      </View>
                    );
                  })}
                </View>
                <TouchableOpacity onPress={() => openModal(category)} style={styles.settingBox}>
                  <Feather name="settings" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {selectedCategory && (
            <Modal visible={true} transparent animationType="slide">
              <SearchDetail
                title={`${selectedCategory.label} 설정`}
                initialMin={selectedCategory.initialMin}
                initialMax={selectedCategory.initialMax}
                unit={selectedCategory.unit}
                userId={userId}
                envKey={selectedCategory.key}
                onClose={closeModal}
                onSave={handleSave}
              />
            </Modal>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f0f0f0' },

  categoryBox: {
    marginBottom: 14,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusItemGroup: {
    flexDirection: 'row',
    gap: 10,
  },

  statusItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },

  rangeText: {
    fontSize: 11,
    color: '#666',
    marginVertical: 2,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  settingBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#eaeaea',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingHome;

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native'; 
import StockDetail from './stockDetail'; 
import { router, useRouter } from 'expo-router'; 
import { api_stock } from '../../../apis/stockApis'; 
import StockEditModal from './stockEditModal';
import StockRegistration from './stockRegistration';

const Stock = () => {
  // 전체 재고 데이터 저장
  const [stockInfo, setStockInfo] = useState([]);

  // 새로고침 트리거 (등록/수정 후 새로 불러오기용)
  const [userTrigger, setUserTrigger] = useState({});

  // 현재 보고 있는 페이지 번호
  const [currentPage, setCurrentPage] = useState(1);

  // 수정 모달 열기 상태
  const [modalShow, setModalShow] = useState(false);

  // 등록 모달 열기 상태
  const [registerModalShow, setRegisterModalShow] = useState(false);

  // 수정할 때 선택한 재고 데이터
  const [selectedStock, setSelectedStock] = useState(null);

  // 페이지네이션 설정
  const itemsPerPage = 5; 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = stockInfo.slice(indexOfFirstItem, indexOfLastItem); 
  const totalPages = Math.ceil(stockInfo.length / itemsPerPage); 

  // 서버에서 재고 목록 가져오기
  useEffect(() => {
    api_stock()
      .then(res => {
        setStockInfo(res.data);
        setCurrentPage(1); 
      })
      .catch(error => {
        console.log(error);
        Alert.alert('불러오기 실패', '서버에 문제가 있거나 네트워크 오류입니다.');
      });
  }, [userTrigger]); 

  // 페이지 버튼 렌더링 함수
  const renderPagination = () => (
    <View style={styles.pagination}>
      {Array.from({ length: totalPages }, (_, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            currentPage === i + 1 && styles.activePage 
          ]}
          onPress={() => setCurrentPage(i + 1)} 
        >
          <Text style={currentPage === i + 1 ? styles.activeText : styles.inactiveText}>
            {i + 1}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.registerButton}>
        <Pressable onPress={() => router.push('/stock/cameraStream')}>
          <Text style={[styles.registerButtonText]}>CCTV 확인</Text>
        </Pressable>
      </View>

      {/* ---------------------- 헤더 영역 ------------------------ */}
      <View style={styles.header}>
        <Text style={styles.title}>개체 등록</Text>

        {/* 등록 버튼 - 누르면 등록 모달 열림 */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => setRegisterModalShow(true)}
        >
          <Text style={styles.registerButtonText}>등록</Text>
        </TouchableOpacity>
      </View>

      

      {/* ------------------- 테이블 헤더 ------------------- */}
      <View style={styles.tableHeader}>
        <Text style={styles.cell}>개체수</Text>
        <Text style={styles.cell}>입고수</Text>
        <Text style={styles.cell}>출하수</Text>
        <Text style={styles.cell}>총무게</Text>
        <Text style={styles.cell}>폐사수</Text>
      </View>

      {/* ------------------ 재고 목록 ------------------ */}
      <FlatList
        data={currentItems}
        keyExtractor={item => item.stockNum.toString()} 
        renderItem={({ item }) => (
          <StockDetail
            stock={item}
            setSelectedStock={setSelectedStock} 
            setModalShow={setModalShow} 
          />
        )}
      />

      {/* ------------------ 페이지네이션 ------------------ */}
      {renderPagination()}

      {/* ------------------ 수정 모달 ------------------ */}
      {selectedStock && (
        <StockEditModal
          visible={modalShow}
          onClose={() => setModalShow(false)}
          selectedStock={selectedStock}
          setUserTrigger={setUserTrigger} 
        />
      )}

      {/* ------------------ 등록 모달 ------------------ */}
      <Modal
        visible={registerModalShow}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRegisterModalShow(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <StockRegistration
              closeModal={() => setRegisterModalShow(false)}
              setUserTrigger={setUserTrigger}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Stock;
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f9fa',
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  registerButton: {
    backgroundColor: '#309898',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    marginBottom: 5
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    flexWrap: 'wrap'
  },
  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 2
  },
  activePage: {
    backgroundColor: 'cornflowerblue'
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold'
  },
  inactiveText: {
    color: '#333'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    padding: 20,
  },

});

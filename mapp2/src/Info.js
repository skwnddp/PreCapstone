import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, getDocs,setDoc } from "firebase/firestore";
import { db } from "./firebase";  // Firestore 초기화된 객체 가져오기
import './Info.css';  // info.css 파일 불러오기

function Info() {
  const [infoData, setInfoData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "info"), (snapshot) => {
      const fetchedData = [];
      snapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });
      setInfoData(fetchedData);
    });

    return () => unsubscribe();
  }, []);

  // 기존 데이터를 모두 삭제하는 함수
  const deleteAllData = async () => {
    const querySnapshot = await getDocs(collection(db, "info"));
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  // 클릭 시 기존 데이터 삭제 및 새 데이터 추가
  const handleClick = async (restaurant) => {
    await deleteAllData(); // 기존 데이터 삭제
    // 새 데이터를 추가하는 로직
    const docRef = doc(db, "info", restaurant.name);
    const HansungData = {
      name: restaurant.name,
      description: restaurant.description,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      information: restaurant.information,
    };

    // Firestore에 새 데이터 추가
    await setDoc(docRef, HansungData);
    console.log(`${restaurant.name} 저장 완료!`);
  };

  // 데이터가 없을 경우 "선택한 맛집 정보가 없습니다." 메시지 표시
  if (!infoData || infoData.length === 0) {
    return (
      <div className="info-container">
        <h2>선택한 맛집 정보</h2>
      </div>
    );
  }

  return (
    <div className="info-container">
      <h2>선택한 맛집 정보</h2>
      <ul>
        {infoData.map((info) => (
          <li key={info.id} onClick={() => handleClick(info)}> {/* 클릭 시 데이터 삭제 및 추가 */}
            <h3>{info.name}</h3>
            <p>{info.information}</p> {/* 맛집 정보 */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Info;

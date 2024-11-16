import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore";
import { app } from './firebase';

const db = getFirestore(app);

function History() {
    const [restaurants, setRestaurants] = useState([]);

    // Firestore에서 실시간으로 맛집 데이터 가져오기
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "searchHistory"), (snapshot) => {
            const fetchedRestaurants = [];
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                data.results.forEach((result) => {
                    fetchedRestaurants.push({
                        id: `${doc.id}-${result.name}`, // 고유 ID 생성
                        docId: doc.id, // 원본 문서 ID
                        name: result.name,
                        description: result.description,
                    });
                });
            });
            setRestaurants(fetchedRestaurants);
        });

        // 컴포넌트가 언마운트될 때 실시간 리스너 해제
        return () => unsubscribe();
    }, []);

    // 맛집 삭제
    const deleteRestaurant = async (id, docId, name) => {
        try {
            const docRef = doc(db, "searchHistory", docId);
            const snapshot = await onSnapshot(docRef, (docSnap) => {
                const originalData = docSnap.data();
                if (!originalData) return;

                const updatedResults = originalData.results.filter((result) => result.name !== name);

                if (updatedResults.length > 0) {
                    setDoc(docRef, { ...originalData, results: updatedResults });
                } else {
                    deleteDoc(docRef);
                }
            });

            // 로컬 상태 업데이트
            setRestaurants((prev) => prev.filter((r) => r.id !== id));
        } catch (error) {
            console.error("Firestore에서 맛집 삭제 실패:", error);
        }
    };

    return (
        <div className="history-container">
            <h2>맛집 내역</h2>
            {restaurants.length === 0 ? (
                <p>저장된 맛집 내역이 없습니다.</p>
            ) : (
                <ul>
                    {restaurants.map((restaurant) => (
                        <li key={restaurant.id} style={{ marginBottom: "10px" }}>
                            <strong>{restaurant.name}</strong>: {restaurant.description}
                            <button
                                onClick={() => deleteRestaurant(restaurant.id, restaurant.docId, restaurant.name)}
                                style={{ color: "red", marginLeft: "10px" }}
                            >
                                삭제
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default History;
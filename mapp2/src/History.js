import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore";
import { app } from './firebase';

const db = getFirestore(app);

function History() {
    const [restaurants, setRestaurants] = useState([]);

    // Firestore에서 실시간으로 맛집 데이터 가져오기
    useEffect(() => {
        const q = query(
            collection(db, "searchHistory"),
            orderBy("timestamp", "desc"), // 최신순으로 정렬
            limit(8) // 최대 8개만 가져옴
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRestaurants = [];
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const results = data.results || []; // 결과 배열이 없을 경우 빈 배열 처리
                results.forEach((result) => {
                    fetchedRestaurants.push({
                        id: `${doc.id}-${result.name}`,
                        docId: doc.id,
                        name: result.name,
                        description: result.description,
                        timestamp: result.timestamp || data.timestamp, // 문서나 결과의 timestamp 사용
                    });
                });
            });

            // 전체 데이터를 최신순으로 정렬한 후, 최대 8개만 유지
            const limitedRestaurants = fetchedRestaurants
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 8);

            setRestaurants(limitedRestaurants);
        });

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
            {restaurants.length === 0 ? (
                <p>저장된 맛집 내역이 없습니다.</p>
            ) : (
                <ul>{restaurants.map((restaurant) => (
                    <li key={restaurant.id} style={{ marginBottom: "10px" }}>
                        <div>
                            <span style={{ fontWeight: "bold", fontSize: "15pt", color: "#f8a800" }}>{restaurant.name}</span>
                            <button
                                onClick={() => deleteRestaurant(restaurant.id, restaurant.docId, restaurant.name)}
                                style={{
                                    // position: "absolute",
                                    left: "80%",
                                    marginTop: "20px",
                                    marginLeft: "10px",
                                    backgroundColor: "rgb(235,60,0)",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                }}
                            > 삭제
                            </button><br />
                            {/* {restaurant.description} */}
                        </div>
                    </li>
                ))}
                </ul>
            )}
        </div>
    );
}

export default History;
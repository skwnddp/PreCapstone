import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { app } from './firebase'; // firebase.js에서 app 객체 가져오기

const db = getFirestore(app);

function Favorites() {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // Firestore에서 즐겨찾기 목록 실시간 업데이트
        const unsubscribe = onSnapshot(collection(db, "favorites"), (snapshot) => {
            const favoriteList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFavorites(favoriteList);
        });

        return () => unsubscribe(); // 컴포넌트 언마운트 시 정리
    }, []);

    const handleRemoveFavorite = async (id) => {
        try {
            // Firestore에서 해당 항목 삭제
            await deleteDoc(doc(db, "favorites", id));
            console.log(`${id} 항목이 삭제되었습니다.`);
        } catch (error) {
            console.error("즐겨찾기 삭제 중 오류 발생:", error);
        }
    };

    return (
        <div>
            <h2>즐겨찾기 목록</h2>
            <ul>
                {favorites.map((item) => (
                    <li key={item.id} style={{ marginBottom: "10px" }}>
                        <span>{item.name} - {item.description}</span>
                        <button
                            onClick={() => handleRemoveFavorite(item.id)}
                            style={{
                                marginLeft: "10px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                padding: "5px 10px",
                                cursor: "pointer"
                            }}
                        >
                            삭제
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Favorites;

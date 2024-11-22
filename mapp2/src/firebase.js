// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth"; // Firebase 인증 기능 추가
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore"; // Firestore 기능 추가
import { HansungData } from "./HansungData"; // HansungData 가져오기
//import { HansungInfo } from "./HansungInfo"; // HansungData 가져오기
//import { HansungReview } from "./HansungReview"; // HansungData 가져오기

// Your web app's Firebase configuration
const FierebaseApiKey = process.env.REACT_APP_FIREBASE_KEY

const firebaseConfig = {
  apiKey: FierebaseApiKey,
  authDomain: "precap-db.firebaseapp.com",
  projectId: "precap-db",
  storageBucket: "precap-db.firebasestorage.app",
  messagingSenderId: "598975747036",
  appId: "1:598975747036:web:cb380f92b438d49d8b7519",
  measurementId: "G-G2F8G3NRHM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app); // 인증 객체 초기화

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

 // Firestore 객체 생성
const db = getFirestore(app);

// HansungData를 Firestore에 저장하는 함수
const uploadHansungDataToFirestore = async () => {
  try {
      const restaurantsRef = collection(db, "restaurants");
      for (const data of HansungData) {
          await setDoc(doc(restaurantsRef, data.id), data);
          console.log(`${data.name} 저장 완료!`);
      }
      console.log("모든 HansungData 저장 완료!");
  } catch (error) {
      console.error("HansungData 저장 중 오류 발생:", error);
  }
};

// HansungInfo를 Firestore에 저장하는 함수
// const uploadHansungInfoToFirestore = async () => {
//   try {
//     const infoRef = collection(db, "restaurantInfo");
//     for (const data of HansungInfo) {
//       await setDoc(doc(infoRef, data.id), data);
//       console.log(`${data.id}의 정보 저장 완료!`);
//     }
//     console.log("모든 HansungInfo 저장 완료!");
//   } catch (error) {
//     console.error("HansungInfo 저장 중 오류 발생:", error);
//   }
// };

// HansungReview를 Firestore에 저장하는 함수
// const uploadHansungReviewToFirestore = async () => {
//   try {
//     const reviewRef = collection(db, "restaurantReviews");
//     for (const data of HansungReview) {
//       await setDoc(doc(reviewRef, data.id), data);
//       console.log(`${data.id}의 리뷰 저장 완료!`);
//     }
//     console.log("모든 HansungReview 저장 완료!");
//   } catch (error) {
//     console.error("HansungReview 저장 중 오류 발생:", error);
//   }
// };

// Export objects and functions
export {
  app,
  auth,
  analytics,
  db,
  uploadHansungDataToFirestore,
  // uploadHansungInfoToFirestore,
  // uploadHansungReviewToFirestore
};
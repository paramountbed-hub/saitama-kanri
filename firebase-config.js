// =============================================
// Firebase 設定ファイル
// =============================================
// 以下の値を Firebase Console から取得して置き換えてください。
// Firebase Console → プロジェクト設定 → マイアプリ → SDK の設定と構成
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyBAqmMHrJBByGQhe2QDSKh0eq0X9xeFNa4",
  authDomain: "saitama-kanri.firebaseapp.com",
  projectId: "saitama-kanri",
  storageBucket: "saitama-kanri.firebasestorage.app",
  messagingSenderId: "921266184536",
  appId: "1:921266184536:web:c79a0b23a49d5fca58052d"
};

// Firebase 初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

# さいたま支店 案件管理ツール

病院向け営業案件の進捗を管理する社内ツールです。  
Firebase Firestore によるリアルタイム同期・複数人同時編集に対応しています。

---

## ファイル構成

```
saitama-kanri/
├── index.html          # メインHTML
├── style.css           # スタイルシート
├── app.js              # アプリケーションロジック
├── firebase-config.js  # Firebase接続設定（★要編集）
└── README.md           # このファイル
```

---

## セットアップ手順

### 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」→ プロジェクト名（例：`saitama-kanri`）を入力
3. Google アナリティクスは「無効」でOK → 「プロジェクトを作成」

### 2. Firestore データベースの作成

1. 左メニュー「構築」→「Firestore Database」
2. 「データベースの作成」をクリック
3. **ロケーション**：`asia-northeast1`（東京）を選択
4. **セキュリティルール**：開始時は「テストモード」でOK（後で変更推奨）

### 3. ウェブアプリの登録と設定キーの取得

1. プロジェクトの概要 → 「</>」（ウェブ）アイコンをクリック
2. アプリのニックネームを入力 →「アプリを登録」
3. 表示される `firebaseConfig` の中身をコピー

### 4. `firebase-config.js` の編集

`firebase-config.js` を開き、以下の部分を実際の値に書き換えます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",            // ← 実際の値に変更
  authDomain: "saitama-kanri.firebaseapp.com",
  projectId: "saitama-kanri",
  storageBucket: "saitama-kanri.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### 5. Firestore セキュリティルール（社内運用向け）

Firebase Console →「Firestore Database」→「ルール」タブで以下に変更：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{docId} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ 社内限定URLで運用する場合はこれで問題ありませんが、  
> より厳密にしたい場合は Firebase Authentication を追加してください。

---

## GitHub Pages での公開手順

### 1. GitHub リポジトリの作成

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/ユーザー名/saitama-kanri.git
git push -u origin main
```

### 2. GitHub Pages の有効化

1. リポジトリ → 「Settings」→「Pages」
2. Source：「Deploy from a branch」
3. Branch：`main` / `/ (root)` → 「Save」
4. 数分後に `https://ユーザー名.github.io/saitama-kanri/` でアクセス可能

### 3. Firebase の承認済みドメイン追加

Firebase Console →「Authentication」→「Settings」→「承認済みドメイン」に  
`ユーザー名.github.io` を追加してください。

---

## 機能一覧

| 機能 | 内容 |
|------|------|
| 案件登録 | 病院名・稼働予定日・担当者・備考 |
| 進捗管理 | 固定10工程を「完了→次へ」で順送り |
| 進捗バー | 10工程から自動算出（0〜100%） |
| 遅延判定 | 黄（注意）・赤（遅延）を自動判定 |
| リアルタイム同期 | 複数人が同時編集してもすぐ反映 |
| 検索 | 病院名の部分一致 |
| 絞り込み | 担当者（メイン・サブどちらも対象） |
| 削除 | パスワード（0000）入力後に削除 |
| スマホ対応 | レスポンシブデザイン |

## 遅延判定ルール

| 色 | 条件 |
|----|------|
| 🟡 黄（注意） | 商談中（工程01）のまま稼働200日前を切った |
| 🔴 赤（遅延） | 工程04未完了で稼働200日前、または工程08未完了で稼働180日前 |

## 担当者リスト

奥山 義弘 / 西尾 仁志 / 江副 洋介 / 松浦 寿和 / 小嶋 直樹 /  
中村 美月 / 増田 慶太 / 佐藤 裕二 / 赤松 稔丈 / その他

---

## 注意事項

- Firebase 無料プラン（Spark）で20件程度の運用は問題ありません
- `firebase-config.js` の API キーは GitHub に公開されます  
  社内限定URLのため実害は少ないですが、Firestore セキュリティルールの設定を忘れずに

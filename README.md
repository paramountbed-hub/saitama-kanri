# さいたま支店 案件管理ツール

病院向け営業案件の進捗を管理する社内ツールです。  
Firebase Firestore によるリアルタイム同期・複数人同時編集に対応しています。

---

## ファイル構成

```
saitama-kanri/
├── index.html          # Top画面（カード表示）
├── style.css           # Top画面スタイル
├── app.js              # Top画面ロジック
├── list.html           # 全ステータス一覧画面
├── list.css            # 一覧画面スタイル
├── list.js             # 一覧画面ロジック
├── firebase-config.js  # Firebase接続設定（★要編集）
└── README.md           # このファイル
```

---

## 公開URL

```
https://paramountbed-hub.github.io/saitama-kanri/
```

---

## システム構成

| 役割 | サービス |
|------|----------|
| Web公開 | GitHub Pages（無料） |
| データベース | Firebase Firestore（無料枠） |
| リアルタイム同期 | Firestore onSnapshot() |

> Firebase は月間読み取り5万回・書き込み2万回まで無料。  
> 20件程度の社内運用では永久に無料枠内で収まります。

---

## 機能一覧

### Top画面（index.html）

| 機能 | 内容 |
|------|------|
| 案件カード表示 | 病院名・稼働予定日・担当者・進捗を表示 |
| 新規案件登録 | 基本情報＋施設詳細16項目を入力 |
| 完了→次へ | 現在の工程を完了して次工程へ進む |
| ← 戻る | 1つ前の工程に戻す |
| 詳細ボタン | 施設詳細16項目＋備考をポップアップ表示 |
| 編集ボタン | 全項目を編集 |
| 削除ボタン | パスワード（0000）入力後に削除 |
| 遅延判定 | 条件に応じて黄・赤のボーダーを自動表示 |
| 優先ソート | 遅延→注意→正常→完了の順で上部表示 |
| 病院名検索 | 部分一致で絞り込み |
| 担当者フィルタ | メイン・サブどちらも対象 |
| リアルタイム同期 | 複数人が同時編集してもすぐ反映 |
| スマホ対応 | レスポンシブデザイン |

### 一覧画面（list.html）

| 機能 | 内容 |
|------|------|
| テーブル表示 | 全案件を一覧で表示 |
| 病院名クリック | 施設詳細16項目＋備考をポップアップ表示 |
| ステータス絞り込み | 遅延／注意／正常／完了で絞り込み |
| 担当者フィルタ | メイン・サブどちらも対象 |
| Top画面に戻る | ヘッダー左上「← Top画面」ボタン |

---

## 固定工程（11工程）

| No | 工程名 |
|----|--------|
| 01 | 商談中 |
| 02 | 概算見積もり（参考価格書）提出 |
| 03 | 導入環境確認（仮想／NW環境含む） |
| 04 | 仕入れ見積もり取得 |
| 05 | 最終見積提出 |
| 06 | カスタマーサクセス打合せ |
| 07 | 受注 |
| 08 | 社内キックオフ |
| 09 | システム構築準備期間 |
| 10 | 稼働（立会等） |
| 11 | 稼働後フォロー |

---

## 遅延判定ルール

| 色 | 条件 |
|----|------|
| 🟡 注意 | 01商談中のまま稼働240日前を切った |
| 🟡 注意 | 10稼働が未完了で稼働日から1日以上経過 |
| 🔴 遅延 | 03導入環境確認が未完了で稼働210日前を切った |
| 🔴 遅延 | 05最終見積提出が未完了で稼働190日前を切った |
| 🔴 遅延 | 07受注が未完了で稼働180日前を切った |
| 🔴 遅延 | 08社内キックオフが未完了で稼働170日前を切った |

---

## 入力フォーム項目

### 基本情報
- 病院名（必須）
- 稼働予定日
- メイン担当（プルダウン）
- サブ担当（プルダウン）
- 現在のタスク（プルダウン）

### 施設情報
- 経営主体
- 許可病床数
- 病棟構成
- 導入病棟
- 導入病床数

### 機器情報
- ベッドサイド端末（既存/新規台数）
- 眠りSCAN（既存/新規台数）
- 離床CATCH（既存/新規台数）
- Wi-Fiベッドナビ（既存/新規台数）
- タブレット設置位置

### システム連携
- 電子カルテ（ベンダー/機種）
- ナースコール（メーカー/機種）
- 周辺連携機能

### スケジュール
- スケジュール状況

### 備考

---

## 担当者リスト（固定）

奥山 義弘 / 西尾 仁志 / 江副 洋介 / 松浦 寿和 / 小嶋 直樹 /  
中村 美月 / 増田 慶太 / 佐藤 裕二 / 赤松 稔丈 / その他

---

## Firebase セットアップ手順

### 1. Firebaseプロジェクト作成

1. https://console.firebase.google.com/ にアクセス
2. 「プロジェクトを追加」→ 名前入力 → Googleアナリティクス「無効」→「作成」

### 2. Firestoreデータベース作成

1. 左メニュー「構築」→「Firestore Database」
2. 「データベースの作成」→ ロケーション `asia-northeast1 (Tokyo)`
3. 「テストモードで開始」→「作成」

### 3. APIキー取得

1. 左上「⚙️」→「プロジェクトの設定」
2. 「マイアプリ」→「</>」アイコン → ニックネーム入力 →「アプリを登録」
3. 表示される `firebaseConfig` の中身をコピー

### 4. firebase-config.js を編集

```javascript
const firebaseConfig = {
  apiKey: "← 実際の値",
  authDomain: "← 実際の値",
  projectId: "← 実際の値",
  storageBucket: "← 実際の値",
  messagingSenderId: "← 実際の値",
  appId: "← 実際の値"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

### 5. Firestoreセキュリティルール

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

「公開」をクリック。

---

## GitHub Pages 公開手順

### 1. リポジトリをPublicにする

GitHub → リポジトリ → Settings → Danger Zone →「Change visibility」→ Public

### 2. Pages を有効化

Settings → Pages → Branch を `main` に変更 → Save

### 3. ファイルのアップロード・更新

リポジトリページ →「Add file」→「Upload files」→ ファイルをドラッグ＆ドロップ →「Commit changes」

### 4. 反映確認

数分後に以下のURLでアクセス可能：
```
https://paramountbed-hub.github.io/saitama-kanri/
```

キャッシュが残っている場合は `Ctrl + Shift + R` で強制リロード。

---

## 削除パスワード

```
0000
```

---

## Firestoreデータ構造

```
collection: projects
document fields:
{
  hospitalName:     string,   // 病院名
  goLiveDate:       string,   // 稼働予定日 (YYYY-MM-DD)
  mainPerson:       string,   // メイン担当
  subPerson:        string,   // サブ担当
  currentTask:      number,   // 現在のタスク番号 (0-11)
  memo:             string,   // 備考
  createdAt:        string,   // 登録日時 (ISOString)
  // 施設情報
  keieiShukai:      string,   // 経営主体
  kyokaBedNum:      string,   // 許可病床数
  byokoKosei:       string,   // 病棟構成
  donyuByoko:       string,   // 導入病棟
  donyuBedNum:      string,   // 導入病床数
  // 機器情報
  bedsideTerminal:  string,   // ベッドサイド端末
  nemiriScan:       string,   // 眠りSCAN
  rishoCatch:       string,   // 離床CATCH
  wifiNav:          string,   // Wi-Fiベッドナビ
  tabletPos:        string,   // タブレット設置位置
  // システム連携
  electronicKarte:  string,   // 電子カルテ
  nurseCall:        string,   // ナースコール
  shuhenRenkei:     string,   // 周辺連携機能
  // スケジュール
  scheduleStatus:   string,   // スケジュール状況
}
```

# 子供の小遣い管理アプリ - 要件定義まとめ

## 1. アプリケーション概要
Next.js app routerとSupabaseを使用した子供の小遣い管理アプリケーション。金銭管理、労働の対価、複利の理解を促進する教育的要素を含む。

## 2. メイン画面構成

### 2.1 上部ブロック（残高管理）
- 現在残高の表示
- 次回複利予測の表示
- 入出金ボタン（ポップアップ形式）
- 残高推移グラフ
  - 折れ線：残高推移
  - 棒グラフ：入出金
  - 横線：目標金額・キープライン（1-2本）
- 通帳ボタン（履歴表示）
- 欲しいものリストボタン

### 2.2 下部ブロック（お仕事管理）
- お仕事ボード/クエストボード（タブ切替 + スワイプ対応）
  - お仕事：定期的なタスク（週/月契約）
  - クエスト：単発タスク（即時報酬）

## 3. 主要機能詳細

### 3.1 複利システム
- デフォルト：0.05%（日曜深夜0時）
- カスタマイズ可能範囲：
  - 利率：0.01%～（0.01%刻み）
  - 支払日：週次（曜日指定）or 月次（月初/月末）

### 3.2 お仕事システム
- 支払いタイミング：週次/月次で設定可能
- 達成率による報酬計算（全タスクの合計に対して）：
  - 80%以上 → 100%報酬
  - 50-79% → 50%報酬
  - 20-49% → 20%報酬
  - 20%未満 → 達成率と同率

### 3.3 クエストシステム
- チェックと同時に即時報酬付与
- 達成時のアニメーション効果
- 報酬額の視覚的表示

### 3.4 残高アラートシステム
- 必須の最低限度額（プライマリー）
- オプションの警戒ライン（セカンダリー）
- グラフ上での視覚的表示

### 3.5 欲しいものリスト
- ドラッグ&ドロップによる並べ替え
- 項目：品目名、金額、メモ

### 3.6 通帳機能
- 日付、金額、内容の表示
- 入出金の色分け（グローバルカラー使用）
- 収入：緑系
- 支出：赤系

## 4. データベース設計

### 4.1 主要テーブル
```sql
-- ユーザー情報
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  settings JSONB
);

-- トランザクション
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (
    type IN ('interest', 'work_reward', 'quest_reward', 'manual_in', 'manual_out')
  ),
  amount INTEGER NOT NULL,
  description TEXT,
  executed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 残高スナップショット
CREATE TABLE balance_snapshots (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  balance INTEGER NOT NULL,
  snapshot_date TIMESTAMP NOT NULL,
  last_transaction_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- お仕事/クエスト
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  reward INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'work' or 'quest'
  frequency_type VARCHAR(20), -- 'weekly' or 'monthly'
  frequency_value INTEGER,
  day_pattern JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

-- 欲しいものリスト
CREATE TABLE wish_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  memo TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. セキュリティ/認証
- 子供別アカウント（2名分）
- Face ID/Touch ID対応
- 設定変更用シンプルパスワード（親用）

## 6. 特記事項
- データ修正：任意の期間で可能
- 残高計算：スナップショットシステムによる効率化
- UI/UX：シンプルさを重視
- 実装：段階的アプローチを推奨

## 7. 技術スタック
- フロントエンド：Next.js
- バックエンド：Supabase
- 認証：Supabase Auth
- データベース：PostgreSQL（Supabase）

## 8. 将来の拡張性
将来的な機能追加に備え、データベース設計段階で拡張性を確保する。フロントエンド側は必要に応じて段階的に機能を追加していく方針。

### 8.1 データベース拡張性
```sql
-- 設定や属性の拡張用JSONBフィールド
ALTER TABLE users ADD COLUMN settings JSONB;

-- トランザクションの拡張用メタデータ
ALTER TABLE transactions ADD COLUMN metadata JSONB;

-- 目標設定の拡張用フィールド
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  target_amount INTEGER NOT NULL,
  achieved_at TIMESTAMP,
  metadata JSONB,  -- 将来的な拡張用
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 将来的な機能候補
1. **カテゴリー管理**
   - 支出カテゴリーの導入
   - 収支分析機能
   - 使用傾向の可視化

2. **拡張目標設定**
   - 複数の目標設定機能
   - 短期・中期・長期目標の区分け
   - 目標達成時の報酬・称賛機能

3. **分析機能**
   - 保護者向けレポート機能
   - 貯金習慣の分析
   - お小遣いの使用傾向分析

4. **教育コンテンツ**
   - 年齢に応じた金融教育機能
   - お金の管理に関する学習コンテンツ

### 8.3 実装アプローチ
- Phase 1: 基本機能の完全実装
- Phase 2: ユーザーフィードバックの収集
- Phase 3: 必要性の高い拡張機能から段階的に実装

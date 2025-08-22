-- PostgreSQL初期化スクリプト
-- 釣りアプリ用のデータベース初期設定

-- データベースとユーザーは環境変数で設定されるため、ここでは追加設定のみ

-- UTF-8エンコーディングを確認
SHOW server_encoding;

-- タイムゾーンを日本時間に設定
SET timezone = 'Asia/Tokyo';
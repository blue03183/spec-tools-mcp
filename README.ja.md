[한국어](README.ko.md) | [中文](README.zh.md) | [English](README.md) | **[日本語](README.ja.md)**

# Spec-Tools-MCP

プロジェクト全体にスペック駆動の AI エージェントスキル、ルール、プロンプトを提供する集中型 MCP サーバーです。

AI エージェントは会話が長くなるにつれてコンテキストを失いがちです。Spec-Tools-MCP は、すべての決定・要件・進捗をチャット履歴ではなく Markdown ファイルに保存することでこの問題を解決し、どのセッションでも中断した地点から正確に再開できるようにします。

## 背景

ほとんどのスペック駆動開発 MCP は、作業ファイル（`plan.md`、`todo.md` など）をプロジェクトルートの固定された場所に保存します。一人の開発者が一度に一つの機能に取り組む場合は問題なく動作しますが、以下の状況では急速に限界に達します。

- **複数の開発者**が同じリポジトリで異なる機能を同時に開発している場合
- **複数のサブプロジェクト**が並行して進行中で、それらを切り替えたりチームメンバーに引き継いだりする必要がある場合

スペックファイルがルートレベルに存在すると、すべてが衝突します——ある開発者の `todo.md` が別の開発者のものを上書きし、どの計画がどの作業に属するのかわからなくなります。

Spec-Tools-MCP はまさにこのシナリオのために構築されました。各機能は `ai-spec/projects/<feature>/` 以下に独立したフォルダを持つため、複数の開発者やサブプロジェクトが同じリポジトリで互いに干渉することなく独立して進められます。適切な機能フォルダを指定するだけで、誰でも作業を引き継いだり再開したりできます。

## 使い方

MCP 経由で任意のプロジェクトからスキルを直接呼び出します——ファイルのコピーは不要です。

#### 1. プロジェクトにパッケージをインストール

```bash
npm install spec-tools-mcp --save-dev
```

#### 2. MCP サーバーの設定

**オプション A — プラグインとしてインストール（Claude Code）**

MCP サーバーと Skills を Claude Code プラグインとして一括インストールします：

```sh
/plugin marketplace add blue03183/spec-tools-mcp
/plugin install spec-tools-mcp@spec-tools-mcp-marketplace
```

Claude Code を再起動すると有効になります。`/mcp` または `/skills` で確認してください。

**オプション B — ワンクリックインストール（VS Code / GitHub Copilot）**

以下のボタンをクリックして、VS Code に MCP サーバーを直接インストールします：

[<img src="https://img.shields.io/badge/VS_Code-Install%20MCP%20Server-0098FF?style=flat-square&logo=visualstudiocode" alt="VS Code にインストール">](https://vscode.dev/redirect/mcp/install?name=io.github.blue03183%2Fspec-tools-mcp&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22spec-tools-mcp%22%5D%2C%22env%22%3A%7B%7D%7D)
[<img src="https://img.shields.io/badge/VS_Code_Insiders-Install%20MCP%20Server-24bfa5?style=flat-square&logo=visualstudiocode" alt="VS Code Insiders にインストール">](https://insiders.vscode.dev/redirect?url=vscode-insiders%253Amcp%252Finstall%253F%257B%2522name%2522%253A%2522io.github.blue03183%252Fspec-tools-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522spec-tools-mcp%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D)

またはプラグインとしてインストール（MCP サーバー + Skills を同時インストール）：

1. **Command Palette** を開く（`Cmd+Shift+P` / `Ctrl+Shift+P`）
2. **Chat: Install Plugin From Source** を実行
3. 次の URL を貼り付け：`https://github.com/blue03183/spec-tools-mcp`

---

**オプション C — 自動設定（推奨）**

プロジェクトルートで次のコマンドを実行してください：

```bash
npx spec-tools-mcp init
```

プロジェクトで使用中の IDE（Claude Code、Cursor、VS Code）を自動検出し、それぞれの設定ファイルを生成します。すでに設定済みの項目はスキップされます。

**オプション D — npx で実行（手動）**

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"]
    }
  }
}
```

**オプション E — ローカルインストールパスを使用**

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["./node_modules/spec-tools-mcp/mcp-server/index.js"]
    }
  }
}
```

#### 3. GitHub Copilot トラブルシューティング

**GitHub Copilot**

 `.vscode/mcp.json` ファイルを作成します（`npx spec-tools-mcp init` で自動作成されます）。
 VS Code の MCP サーバーはターミナルではなく `VSCode Extension Host` 内で実行されるため、`npx` および `node` コマンドが正しく認識されない場合があります。
 `.vscode/mcp.json` に `command` と env `PATH` を明示的に指定する必要があります：

 ```
 {
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "/Users/{ユーザー名}/.nvm/versions/node/v24.11.0/bin/npx",    // ターミナルで `which npx` を実行して確認したパスを入力してください
      "args": [
        "-y",
        "spec-tools-mcp"
      ],
      "env": {
        "PATH": "/Users/{ユーザー名}/.nvm/versions/node/v24.11.0/bin:/usr/local/bin:/usr/bin:/bin"  // ターミナルで `echo $PATH` を実行して確認したパスを入力してください
      }
    }
  }
}
 ```

 `.vscode/mcp.json` に `command` と env `PATH` を明示的に指定することで、VS Code Extension Host が `npx` コマンドを認識し、MCP サーバーが正常に起動します。
 IDE ウィンドウをリロードした後、**拡張機能** → **MCP サーバー - インストール済み** で `spec-tools-mcp` を右クリック → **サーバーを起動** を選択して手動で起動してください。

> **注意：** MCP サーバーが起動中に IDE ウィンドウをリロードした場合、サーバーを再起動する必要があります（自動では再起動されません）。

#### 4. カスタムスペックディレクトリ（オプション）

デフォルトでは、スペックファイルはプロジェクトルートの `ai-spec/` 以下に保存されます。別のパスを使用するには、`SPEC_ROOT_DIR` 環境変数を設定してください：

```json
{
  "mcpServers": {
    "spec-tools-mcp": {
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"],
      "env": { "SPEC_ROOT_DIR": "my-specs" }
    }
  }
}
```

#### 5. 再起動と確認

MCP 設定を追加したら、新しいサーバーが認識されるよう **AI エージェントを再起動**してください（IDE ウィンドウのリロードまたはチャットセッションの再起動）。

AI に次のように質問して**接続を確認**してください：

```
利用可能な MCP ツールは何ですか？
```

または `get_rules` を直接呼び出してください：

```
get_rules
```

サーバーが接続されていれば、AI が 4 つのツール（`spec_init`、`spec_todo`、`spec_work`、`get_rules`）を列挙するか、開発ルールドキュメントを返します。

#### 6. スキルの使い方

MCP サーバーが接続されたら、AI チャットで自然言語でスキルをリクエストしてください。

**VS Code（GitHub Copilot — エージェントモード）**

Copilot Chat をエージェントモードに切り替えて自然にリクエストするか、`#` コマンドでスキルを直接呼び出してください：

```
#spec_init dashboard
#spec_todo dashboard
#spec_work T-01
```

**Claude Code（CLI）**

Claude Code チャットで直接リクエストしてください：

```
spec_init で dashboard を初期化して
spec_todo で要件を分析して
spec_work で T-01 を進めて
```

#### 7. 利用可能なツール

| ツール | 説明 | 例 |
|--------|------|-----|
| `spec_init` | 新しい機能スペックプロジェクトを初期化 | `spec_init で dashboard を初期化して` |
| `spec_todo` | 企画書を分析して requirement.md · todo.md を生成 | `spec_todo で要件を分析して` |
| `spec_work` | todo 項目の計画作成 → 承認 → 実装 | `spec_work で T-01 を進めて` |
| `get_rules` | spec-development-rules.md の内容を返す | `開発ルールを見せて` |
| `spec_status` | 全 feature の todo 進捗と承認待ち項目を表示 | `現在のスペック状況を教えて` |
| `spec_handoff` | 別の開発者や新しいセッションがすぐに引き継げる引継ぎ文書を生成 | `dashboard の引継ぎ文書を作って` |
| `spec_archive` | 完了した feature を `projects/` から `archive/` へ移動 | `dashboard をアーカイブして` |
| `spec_search` | `_codebase/` からコード位置・シンボルを返す。`query` 指定時は該当セクションのみ返す | `コードベースで OrderService を検索して` |

**ツール別の役割と期待効果**

**`spec_init`**  
新機能の開発を始めるときに呼び出します。`ai-spec/projects/<feature>/` 以下に独立した作業スペースを作成し、複数の機能や開発者が同じリポジトリでファイル衝突なく作業できるようにします。また、プロジェクト共用のコードベース Wiki（`ai-spec/_codebase/`）を作成または増分更新します。初回実行時はコードベース全体を分析し、以降の実行では前回の同期以降に変更されたファイルのみを再分析します。

**`spec_todo`**  
企画書や要件が揃ったら実行します。`docs/` のファイルを分析して `requirement.md` を作成し、自己完結したタスク一覧（`todo.md`）を生成します。実装前に AI と人間が要件を共同レビューするチェックポイントとして機能します。

**`spec_work`**  
実装を開始するとき、または前のセッションを引き継ぐときに使用します。計画 → 承認 → 実装のゲートを強制し、`plan.md` を作成して人間の承認を得るまで実装をブロックします。実装開始時、Agent はまず todo 項目を `[ ] IN PROGRESS` に変更します——トークン制限などでセッションが中断されても、次のセッションで進行中のタスクを特定して再開できます。各ステップの進捗を `update.md` に記録するため、セッションが途切れても正確に中断箇所から再開できます。コードの場所はワークスペースを再スキャンする代わりに `_codebase/` を参照し、実装中に新たに発見した情報はすぐに `_codebase/` へ反映します。

**`get_rules`**  
AI が開発プロトコルを確認または再確認する必要があるときに呼び出します。`spec-development-rules.md` 全体を返し、AI が正しいスペック駆動の進め方に従うことを保証します。

**`spec_status`**  
複数の機能が並行して進行しているときに全体状況を把握したい場合に使用します。全 feature の todo 完了率と承認待ちの plan を一覧表示し、承認リクエストの見落としを防ぎます。

**`spec_handoff`**  
チームメンバーへ作業を引き継ぐ際や、長期間その機能を中断する必要があるときに使用します。機能目標・todo 状況・主要なコード位置を一つの文書にまとめ、次のセッションや別の開発者がコードベースを再調査せずにすぐ作業を引き継げるようにします。

**`spec_archive`**  
機能開発が完全に完了した後に呼び出します。feature フォルダを `ai-spec/archive/` に移動し、`projects/` をアクティブな作業のみの状態に保ちます。未完了の todo がある場合はブロックされます。

**`spec_search`**  
`_codebase/` を手動で開かずにファイル位置やシンボルをすばやく検索できます。`query` キーワードを指定すると、該当するセクションのみを返します。特定のクラスや関数が最後に記録された場所を探すときに便利です。

#### 8. ワークフロー

1. `spec_init` でプロジェクトを**初期化**
   - `requirement.md` テンプレートとオプションの `docs/` フォルダを含む `ai-spec/projects/{project-name}/` フォルダを作成
   - 共用コードベース Wiki（`ai-spec/_codebase/`）を作成または更新（初回は全体分析、以降は git の変更分のみを増分更新）

2. **企画書をアップロード**（オプション）
   - PDF、画像、その他の企画ファイルを `ai-spec/projects/{project-name}/docs/` にコピー

3. **`spec_todo` を実行**してドキュメントを分析しスペックファイルを生成
   - docs を読み込み `requirement.md` を作成——AI が続行前にレビューを求める
   - 複雑な機能（新規 API、DB スキーマ変更、コンポーネントアーキテクチャ）の場合、`design.md` の草案を作成してタスク生成前にレビューを求める
   - 自己完結したタスク項目を含む `todo.md` を生成（T-01、T-02、…）
   - `requirement.md` が既に存在する場合、分析内容は既存の要件の下に追記される

4. **`spec_work` を実行**して各タスクを実装
   - AI が選択したタスクの `plan.md` を作成し、承認を求める
   - 計画ファイルを直接レビュー——チャットで変更を説明する必要はなく、`plan.md` を直接編集して `修正完了` と入力
   - `承認` または `進めて` と入力すると実装開始
   - 承認ゲートは MCP サーバーレベルで強制: `plan.md` がまだ `[待機]` 状態の場合、実装はブロックされる
   - 実装開始時の最初のアクションとして todo 項目を `[ ] IN PROGRESS` に変更——セッションが中断された場合（トークン制限など）、次のセッションで進行中タスクを検出して再開できる
   - 各ステップが完了するたびに `update.md` に進捗を記録

5. 新しいセッションを開始して `spec_work` を再度呼び出すと**いつでも再開**可能
   - AI が `todo.md` で `IN PROGRESS` 項目を最初に確認してそのタスクへ直接移動し、`update.md` の最初の未完了項目から続行
   - `_codebase/` が蓄積されたコード位置・パターンの知識を提供するため、セッションや機能をまたいでコードベースをゼロから再スキャンする必要がない

6. 以降のタスクについてはステップ 3～4 を繰り返す

7. **作業を引き継ぐ**際は引継ぎ文書を依頼
   - `spec_handoff` が機能目標・todo 状況・現在の進捗・主要コード位置をまとめた文書を生成

8. **機能が完了**したらアーカイブして `projects/` を整理
   - `spec_archive` がフォルダを `ai-spec/archive/` へ移動——未完了の todo があればブロック

#### 9. 生成されるフォルダ構造

```
ai-spec
├─ _codebase/                      # プロジェクト共用コードベース Wiki（全機能で共有）
│   ├─ index.md                    # 全ディレクトリ構造マップ、技術スタック、モジュール-パスマッピング表
│   ├─ last-synced.md              # 最終分析時点（git hash + トリガー）
│   ├─ modules/
│   │   └─ <domain>.md             # ドメイン別：主要ファイル、コア API、パターン、依存関係
│   └─ conventions.md              # 共通規約、命名ルール、アーキテクチャパターン
├─ templates/                      # （オプション）カスタムテンプレート
│   ├─ requirement.md              # カスタム要件テンプレート
│   └─ todo.md                     # カスタム todo テンプレート
└─ projects/
    └─ <feature>                   # 機能ごとのプロジェクトフォルダ
        ├─ requirement.md          # 要件ドキュメント（Single Source of Truth）
        ├─ design.md               # アーキテクチャ設計書（複雑な機能で作成）
        ├─ todo.md                 # AI が生成したタスクリスト
        ├─ docs/                   # 元の企画ファイル（PDF、画像など）
        └─ <T-番号>-<要約>/        # タスクごとのフォルダ
            ├─ plan.md             # 設計意図、実装方針、承認ステータス
            └─ update.md           # 実装進捗ログ + レビューチェックリスト
```

**`_codebase/` の役割**：AI が発見したファイルの場所、スキーマ、パターンを全機能にわたって共有する Wiki です。機能ごとのキャッシュとは異なり、時間が経つほど知識が蓄積されます。新しい機能や完了したタスクが増えるほど、無駄な再調査が減っていきます。

**カスタムテンプレート**：`ai-spec/templates/requirement.md` または `ai-spec/templates/todo.md` を配置すると、組み込みのデフォルトの代わりに独自のテンプレート形式を使用できます。

#### 10. 注意事項

- `ai-spec/_codebase/` は継続的に蓄積されるコードベース知識ベースです。`spec_init` で一度構築すれば、以降のすべての機能・タスクでワークスペースを再スキャンすることなく参照でき、プロジェクトが大きくなるほどトークン節約の効果が高まります。
- コンテキストが長くなりすぎると AI の精度が低下することがあります。各 TODO 項目ごとに新しいセッションを開始することをお勧めします。タスク番号を直接渡すと（例：`spec_work T-02`）、そのタスクに直接ジャンプできます。

---

## コントリビューション

コントリビューションはいつでも大歓迎です！バグを見つけた場合や機能のご要望は、[issue を作成](https://github.com/blue03183/spec-tools-mcp/issues)してください。Pull Request もお待ちしています。

## ライセンス

MIT

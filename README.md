
# Sushi Browser

マルチパネル機能に特化した次世代webブラウザです。寿司料理のような素晴らしさを目指しています。 :sushi:

![OverView](https://sushib.me/data/view.gif)

# Why?

Webブラウジングの際、画面の一部しか利用できず、勿体無いと思ったことはありませんか。  
「簡単な操作で画面を最大限に活用したい」それが"Sushi Browser"のコンセプトです。

そのため、"マルチパネル、同期スクロール、サイドバー、スリムメニュー、パネル整列"などのギミックを搭載しています。  

上記に加え、"AdBlock、マウスジェスチャー、Terminal、動画・並列ダウンロード、AutoPagerize"をはじめとした便利機能も有しています。  

また、Electron(Brave's Fork)で構築されているため、マルチプラットフォーム(Windows, macOS, Linux)で利用できます。  
@TODO ダウンロードリンク


# 特徴

## マルチパネル機能  

本ブラウザ最大の特徴は、マルチパネルでの表示・操作に特化していることにあります。  
複数のwebページを並べて表示するだけでなく、様々な機能があります。

#### 1. 対面パネルでの表示

リンクを中クリック(マウスホイールを押す)することで、対面パネルにリンク先のページを開くことができます。  
１パネルの状態で中クリックすると、自動で２パネルに分割・表示されます。  
もちろん、通常のブラウザと同じくように新しいタブで開くことも設定可能です。　　

#### 2. 同期スクロール
同期スクロールボタンを押すことで、本の見開き表示のように１つのページを並べて表示することができます。  
さらに、この状態のパネル群はスクロールやページ遷移、クローズ動作も同期されます。  

#### 3. 同期ページ遷移
正規表現により、ページURLを置換し、別のページを開くことができます。
例えば、左側に英語のページ、右側にGoogle翻訳を開くようなことができます。  

#### 4. サイド(ボトム)バー
お気に入りや履歴などをサイドバーで開くことができます。サイドバーは通常と同じくwebページの表示が可能です。  
通常パネルとの違いは、ウインドウサイズを変更しても固定幅であること、同期スクロール対象でないことそれだけです。

#### 5. スリムメニュー
画面スペースを最大限に活用するために、２つの表示モードが可能です。  
1. One Lineモード：メニューバーとタブバーを統合した表示形式で、わずか30pxでのメニューを実現しています。
2. Full Screenモード：メニューバーが非表示となり、最上部にカーソルを移動することでメニューバーが表示されます。

#### 6. パネル移動
一般的なブラウザは、タブをドラッグ＆ドロップすることで、タブの移動ができます。  
本ブラウザはタブの移動に加え、タブ追加ボタンをドラッグ＆ドロップすることで、１つのパネルの全タブを他のパネルやウインドウへ移動することができます。

#### 7. Floatパネルモード
タブを右クリックして表示されるメニューからFloating Panelを選択することで、ウインドウ内で移動可能なパネルに分離することができます。  
Webブラウジング中の動画再生などに活用できる機能です。

#### 8. その他
- パネルの入れ替え：２つのパネルの位置を入れ替えることができます。
- パネルの整列：水平、垂直方向それぞれに対し、等幅に整列することができます。
- 方向の転換：横方向に並んでいるパネルを縦方向に、縦方向に並んでいるパネルを横方向に並び直すことができます。
- 同時スクロール：パネルの境目でマウスホイールを動かすことで、２つのパネルを同時にスクロールできます。
- Mobileモード：モバイル用のページヘの切り替えが行なえます。(ユーザエージェントの変更)

## ツール
特徴的なツールとして、以下機能があります。  
1. ターミナル：Linux/MacではBash,WindowsではPowerShellの操作ができます。
2. ファイルエクスプローラ：ファイル操作や閲覧ができます
3. テキストエディタ：テキストやソースコードの編集ができます
4. 動画再生：自動再生の動画機能が利用できます

上記機能を活用すれば、IDE(統合開発環境)に近い操作も可能になっています。


## Muon(Electron Fork)機能
本ブラウザは、ブラウザ機能としてMuonを利用してます。  
MuonはBrave Browserで使用されているElectronのforkで、高速なブラウザ用のフレームワークです。

1. AdBlock：ネイティブ実装の高速な広告ブロックを搭載しています。
2. Chromiun：レンダリングエンジンにChromeのオープンソース実装であるChromiumが利用されており、最新かつ高速な動作が可能です。
3. 部分的なChrome拡張機能のサポート：一部のChrome拡張機能が利用可能です。

## 便利機能

#### 1. ダウンロード機能
- 動画ダウンロード：動画や音楽情報を検知すると、自動でダウンロードリンクを表示します。
- 並列ダウンロード：1ファイルに対し、最大8並列までの並列ダウンロードが可能です。

#### 2. マウスジェスチャー
Chrome拡張機能によるマウスジェスチャーが利用できます。Mac、LinuxでもWindowsと同じ操作感で利用可能です。

#### 3. AutoPagrize
複数ページに渡るWebサイトの自動先読み機能が利用できます。(Chrome拡張)

#### 4. Anything Search
アドレスバーでの入力時および、Shiftボタンを２回押すことで、履歴からの検索が行なえます。

#### 5. データ同期(Experimental)
Sync Data機能をOnにすると複数端末間で履歴とお気に入りの同期が可能になります。

## Webテクノロジー

本ブラウザーは以下を始めとした素晴らしいwebテクノロジーを利用しています。
- muon (brave browserで使用されているElectronのforkで、高速なブラウザ用のフレームワーク)
- Inferno (An extremely fast, React-like library)
- Semantic UI React
- xterm.js (visual studio codeなどで使用されているTerminal)

# Flashの利用

# TODO

- キーボードショートカット、オプションページ
- ローカライズ(多言語化)
- カスタマイズ性の向上(トップページ、検索エンジンなど)
- Anything Searchの強化
- adblockの制御パネル
- Readmeへのbuild方法の追加
- テストコードの追加
- リファクタリング、Mobxの導入（現状、PubSubベースで密結合）
- バグフィックス
- Auto Update
- 新機能

Desktop browser for macOS, Windows, and Linux.

Follow [@brave](https://twitter.com/brave) on Twitter for important news and announcements.

For other versions of our browser, please see:
* iPhone - [brave/browser-ios](https://github.com/brave/browser-ios)
* Android - [brave/browser-android-tabs](https://github.com/brave/browser-android-tabs)

## Downloads

To download the latest release, [see our releases page](https://github.com/brave/browser-laptop/releases).

You can also [visit our website](https://brave.com/downloads.html) to get the latest stable release (along with a more user-friendly download page).

Brave supports 3 [release channels](https://github.com/brave/browser-laptop/wiki/Release-channels): release, beta, and developer.

## Community

[Join the Q&A community](https://community.brave.com/) if you'd like to get more involved with Brave. You can [ask for help](https://community.brave.com/c/help-me),
[discuss features you'd like to see](https://community.brave.com/c/feature-requests), and a lot more. We'd love to have your help so that we can continue improving Brave.

Join our [Discord community chat](https://discordapp.com/invite/k57tYrS) for higher bandwidth discussions.

## Useful documentation

* See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for tips and guidelines about contributing.
* See [docs/style.md](docs/style.md) for information on styling.
* See [docs/tests.md](docs/tests.md) for information on testing, including how to run a subset of the tests.
* See [docs/debugging.md](docs/debugging.md) for information on debugging.
* See [docs/translations.md](docs/translations.md) to learn how you can help us with translations (localization).
* See [docs/linuxInstall.md](docs/linuxInstall.md) for information on installing the browser on Linux distributions.

## Running from source

If you're setting up using Windows, please see the [Building on Windows wiki entry](https://github.com/brave/browser-laptop/wiki/(setup)-Windows-build-guide) for a full walkthrough.

For other platforms (macOS, Linux) You'll need certain packages installed before you can build and run Brave locally.

### Prerequisites

1. `nodejs` **`>= 7.9.0`**

    Install from your package manager or download from https://nodejs.org

#### On Debian / Ubuntu /Mint

````
apt-get install libgnome-keyring-dev build-essential rpm ninja-build
````

#### On Fedora

````
dnf install libgnome-keyring-devel rpm-build
dnf group install "Development Tools" "C Development Tools and Libraries"
````

### Installation

After installing the prerequisites:

1. Clone the git repository from GitHub:

        # For beta testers:
        git clone --depth 1 https://github.com/brave/browser-laptop

        # For devs over HTTPS:
        git clone https://github.com/brave/browser-laptop

        # For devs over SSH:
        git clone git@github.com:brave/browser-laptop.git

2. Open the working directory:

        cd browser-laptop

3. Install the Node dependencies:

        npm install

Instead of `npm install` you may also install with [yarn](https://github.com/yarnpkg/yarn).

### Troubleshooting

Additional notes on troubleshooting installation issues are in the [Troubleshooting](https://github.com/brave/browser-laptop/wiki/Troubleshooting) page in the Wiki.

### Preconfigured VMs

Some platforms are available as pre-configured VMs. See the [readme](https://github.com/brave/browser-laptop/blob/master/test/vms/vagrant/README.md) for details.

### Running Brave

To run a development version of the browser requires a few steps. The easiest way is just to use two
terminals. One terminal can be used just to watch for changes to the code

    npm run watch

Now actually run Brave in another terminal

    npm start

Some errors related to [brave/electron](https://github.com/brave/electron) update can be fixed by doing a clean install:

    rm -rf node_modules/
    npm install

If this does not work, please clear out your ~/.electron first and try again.

### Running webdriver tests

To run the webdriver tests

    npm run watch-test  or  npm run watch-all

Now run tests in another terminal

    npm test

See [docs/tests.md](docs/tests.md) for more information.

### Port

Brave uses port 8080 to communicate between its client and server sides by default. If you are using port 8080 for something else (e.g. a web proxy) then you can set the node config to make it use a different one.

e.g.
npm config set brave:port 9001

Additional notes on troubleshooting development issues are in the [Troubleshooting](https://github.com/brave/browser-laptop/wiki/Troubleshooting) page in the Wiki.

## Running inside of a development version of [Muon](https://github.com/brave/muon)

By default, we provide pre-built binaries when you `npm install` with our own fork of [electron-prebuilt](https://github.com/brave/electron-prebuilt).

If you want to modify the code to [Muon](https://github.com/brave/muon) (Brave's Electron fork), then you'll need to build it. An example of why you might do that would be exposing a new event to the webview (from Muon).

To start this process, you'll want to check out our [browser-laptop-bootstrap](https://github.com/brave/browser-laptop-bootstrap) repo. From there, [you can follow the steps in our wiki](https://github.com/brave/browser-laptop-bootstrap/wiki) to get up and running.

## Packaging for bundles, installers, and updates

Please [see our wiki entry](https://github.com/brave/browser-laptop/wiki/Packaging-for-bundles,-installers,-and-updates) for more information about packaging.

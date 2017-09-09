
# Sushi Browser

マルチパネル機能に特化した次世代webブラウザです。寿司料理のような魅力的なブラウザを目指しています。 :sushi:

# Why?

Webブラウジングの際、画面の一部しか利用できず、勿体無いと思ったことはありませんか。  
「簡単な操作で画面を最大限に活用したい」それが"Sushi Browser"のコンセプトです。

"マルチパネル、同期スクロール、サイドバー、スリムメニュー、パネル整列"などのギミックを搭載しています。  

上記に加え、"AdBlock、マウスジェスチャー、Terminal、動画・並列ダウンロード、AutoPagerize"をはじめとした便利機能も有しています。  

また、Electron([Brave's Fork](https://github.com/brave/muon))で構築されているため、マルチプラットフォーム(Windows, macOS, Linux)で利用できます。  

[ダウンロード](#ダウンロード)

![OverView](https://sushib.me/github/demos.gif)

## Table of Contents

* [特徴](#特徴)
  * [マルチパネル機能](#マルチパネル機能)
  * [拡張ツール](#拡張ツール)
  * <a href="#muonelectron-fork機能">Muon(Electron Fork)機能</a>
  * [便利機能](#便利機能)
  * [Webテクノロジー](#webテクノロジー)

* [ダウンロード](#ダウンロード)

* [Flashの利用](#flashの利用)

* [TODO](#todo)


# 特徴

## マルチパネル機能  

本ブラウザ最大の特徴は、マルチパネルでの表示・操作に特化していることにあります。  
複数のwebページを並べて表示するだけでなく、様々な機能があります。

#### 1. 対面パネルでの表示

リンクを **中クリック(マウスホイールを押す)** することで、対面パネルにリンク先のページを開くことができます。  
１パネルの状態で **中クリックする** と、自動で２パネルに分割・表示されます。  
もちろん、通常のブラウザと同じくように新しいタブで開くことも設定可能です。　　

#### 2. 同期スクロール
同期スクロールボタンを押すことで、本の見開き表示のように１つのページを並べて表示することができます。  
さらに、この状態のパネル群はスクロールやページ遷移、クローズ動作も同期されます。  

また、webページを右クリックして選べるメニューからは左から右への見開きと、右から左への見開きの両方向が選択できます。(通常は左から右)

#### 3. サイド(ボトム)バー
お気に入りや履歴などをサイドバーで開くことができます。サイドバーは通常と同じくwebページの表示が可能です。  
通常パネルとの違いは、ウインドウサイズを変更しても固定幅であること、同期スクロール対象でないことそれだけです。

#### 4. スリムメニュー
画面スペースを最大限に活用するために、２つの表示モードが可能です。  
1. One Lineモード：メニューバーとタブバーを統合した表示形式で、わずか30pxでのメニューを実現しています。
2. Full Screenモード：メニューバーが非表示となり、最上部にカーソルを移動することでメニューバーが表示されます。

#### 5. パネル移動
一般的なブラウザは、タブをドラッグ＆ドロップすることで、タブの移動ができます。  
本ブラウザはタブの移動に加え、タブ追加ボタンをドラッグ＆ドロップすることで、１つのパネルの全タブを他のパネルやウインドウへ移動することができます。

#### 6. Floatパネルモード
タブを右クリックして表示されるメニューからFloating Panelを選択することで、ウインドウ内で移動可能なパネルに分離することができます。  
Webブラウジング中の動画再生などに活用できる機能です。

#### 7. 同期ページ遷移

正規表現により、ページURLを置換し、別のページを開くことができます。  
左側に通常のページ、右側にGoogle翻訳を開くようなことができます。  

入力方法は、左側にURLに対する正規表現、右側に置換後のテキストを入力します。  
左側に()を使うとキャプチャされ、$数字で置換後の内容に利用できます。($$数字でエンコードしたテキストとして使えます。)  

例えば、左側を`(.+)`、右側を`https://www.google.com/search?q=$$1`とすることで、対象のURLをGoogle検索できます。

#### 8. その他
- パネルの入れ替え：２つのパネルの位置を入れ替えることができます。
- パネルの整列：水平、垂直方向それぞれに対し、等幅に整列することができます。
- 方向の転換：横方向に並んでいるパネルを縦方向に、縦方向に並んでいるパネルを横方向に並び直すことができます。
- 同時スクロール：パネルの境目でマウスホイールを動かすことで、２つのパネルを同時にスクロールできます。
- Mobileモード：モバイル用のページヘの切り替えが行なえます。(ユーザエージェントの変更)

## 拡張ツール
特徴的なツールとして、以下機能があります。  
1. ターミナル：Linux/MacではBash,WindowsではPowerShellの操作ができます。
2. ファイルエクスプローラ：ファイル操作や閲覧ができます
3. テキストエディタ：テキストやソースコードの編集ができます
4. 動画再生：自動再生の動画機能が利用できます

上記機能を活用すれば、IDE(統合開発環境)に近い操作も可能になっています。


## Muon(Electron Fork)機能
本ブラウザは、ブラウザ機能として[Muon](https://github.com/brave/muon)を利用してます。  
Muonは[Brave browser](https://github.com/brave/browser-laptop)で使用されているElectronのforkで、高速なブラウザ用のフレームワークです。

1. AdBlock：ネイティブ実装の高速な広告ブロックを搭載しています。
2. Chromiun：エンジンにChromeのオープンソース実装であるChromiumが利用されており、最新かつ高速な動作が可能です。
3. 部分的なChrome拡張機能のサポート：一部のChrome拡張機能が利用可能です。

## 便利機能

#### 1. ダウンロード機能
- 動画ダウンロード：動画や音楽情報を検知すると、自動でダウンロードリンクを表示します。
- 並列ダウンロード：1ファイルに対し、最大16並列までの並列ダウンロードが可能です。

#### 2. マウスジェスチャー
Chrome拡張機能によるマウスジェスチャーが利用できます。Mac、LinuxでもWindowsと同じ操作感で利用可能です。

#### 3. AutoPagrize
複数ページに渡るWebサイトの自動先読み機能が利用できます。(Chrome拡張)

#### 4. Anything Search
アドレスバーでの入力時および、Shiftキーを２回押すことで、履歴からの検索が行なえます。

#### 5. データ同期(Experimental)
Sync Data機能をOnにすると複数端末間で履歴とお気に入りの同期が可能になります。

## Webテクノロジー

本ブラウザーは以下を始めとした素晴らしいwebテクノロジーを利用しています。
- [Muon](https://github.com/brave/muon) ([Brave browser](https://github.com/brave/browser-laptop)で使用されているElectronのforkで、高速なブラウザ用のフレームワーク)
- [Inferno](https://github.com/infernojs/inferno) (An extremely fast, React-like library)
- [Semantic UI React](https://github.com/Semantic-Org/Semantic-UI-React)
- [xterm.js](https://github.com/sourcelair/xterm.js/) (visual studio codeなどで使用されているTerminal)

# ダウンロード

各プラットフォームに対し、インストーラとポータブル版の両方がダウンロードできます。

- [Windows Installer v0.3.0](https://sushib.me/dl/sushi-browser-0.3.0-setup-x64.exe)
- [Windows Portable v0.3.0(自己解凍)](https://sushib.me/dl/sushi-browser-0.3.0-win-x64.exe)
- [Windows Portable v0.3.0](https://sushib.me/dl/sushi-browser-0.3.0-win-x64.zip)
- [MacOS dmg v0.3.0](https://sushib.me/dl/SushiBrowser-0.3.0.dmg)
- [MacOS Portable v0.3.0](https://sushib.me/dl/sushi-browser-0.3.0-mac-x64.zip)
- [Linux rpm (for Fedora/CentOS) v0.3.0](https://sushib.me/dl/sushi-browser-0.3.0.x86_64.rpm)
- [Linux deb (for Debian/Ubuntu) v0.3.0](https://sushib.me/dl/sushi-browser_0.3.0_amd64.deb)
- [Linux Portable v0.3.0](https://sushib.me/dl/sushi-browser-0.3.0.tar.bz2)

ポータブル版の利用は、解凍後にWindowsはsushi.exeを、Mac/Linuxはsushi-browserを実行ください。

# Flashの利用

Flashが動かない場合、以下のサイトでFlashをインストールして実行ください。
- [Adobe Flash Player](https://get.adobe.com/flashplayer/)

また、Linuxの場合は上記インストール後も動作しない場合があります。  
セキュリティレベルが低下しますが、以下のコマンドで動作する可能性があります。  
```
sushi-browser --no-sandbox
```

# 新機能
#### 新機能(v0.30)
- 他のウインドウをパネルに吸着する機能（WindowsとLinuxのみ)  
  注意：Linuxで利用する場合はwmctrlをインストールください。(apt-get install wmctrl  or yum(dnf) install wmctrl)  
- 右クリックメニューで複数同時検索
- ドロップアンドドラッグによるパネル分割機能
- ダウンロード機能をAria2のラッパーに変更。性能および安定性の向上。最大分割数をaria2の最大数(16)に変更
- サイドバーのBookmarkおよびHistory機能の改善
- トップメニューのBookmarkおよびHistory機能の改善
- Top pageのような特殊ページでのマウスジェスチャー
- private tabの挙動改善
- 履歴機能にFulltext検索機能の導入（Experimental)
- 不要なデータの削除（若干のダウンロードサイズ減少）


#### 新機能(v0.20-v0.21)
- 検索エンジンを選択可能とした
- 複数同時検索機能（例えば、アドレスバーにg4 wordと入力すると、複数のパネルに異なる条件で同時に検索が可能）
- 部分的なローカライズ
- 設定ページの追加
- キーボード・ショートカットの追加および、キーバインドの設定ページの追加
- １つのウインドウの複数のパネルを複数のウインドウに変換する機能を追加
- MacOSでの挙動を改善
- トリプルクリックによる水平方向のスクロール機能を追加
- コミックpdfビューアの追加
- 右クリックメニューの並び順の改善
- マウスの中クリックの長押しと通常クリックの挙動を変更（通常クリックの場合、対面パネルにリンクが開かれる。長押しの場合は、同じパネルにbackgroundでリンクが開かれる）

![Newv03](https://sushib.me/github/myimg/new_features_0.3.gif)

# TODO

- トップページのカスタマイズ性の向上
- プラベートモードのバグ修正
- Anything Searchの強化
- adblockの制御パネル
- 標準のブラウザとして選択可能とする
- Readmeへのbuild方法の追加
- リファクタリング、Mobxの導入（現状、PubSubベースで密結合）
- テストコードの追加
- Auto Update
- マニュアル
- 新機能

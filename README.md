
# Sushi Browser

## Why?
 
When you are browsing the web you can only use a section of your screen. Have you ever thought that that's a waste?   
The concept of the "Sushi Browser" is wanting to utilize the screen to the maximum capacity just by a simple operation.  

"Multiple panels, sync scrolling, sidebar, slim menu, panel alignment etc. are some of the gimmicks it has onboard.  

[Downloads](#downloads)

![OverView](https://sushib.me/github/demos.gif)

## Table of Contents

* [Special features](#special-features)
  * [Multi panel](#multi-panel)
  * [Extension tools](#extension-tools)
  * <a href="#muon-electron-fork">Muon (Electron Fork)</a>
  * [Useful features](#useful-features)
  * [Web Technologies](#web-technologies)

* [Downloads](#downloads)

* [Use of Flash](#use-of-flash)

* [New Features](#new-features)

* [TODO](#todo)


# Special features

## Multi panel  

The browser's greatest feature is the specialized display and operation using multiple panels.   
It not only displays multiple web pages side-by-side but it also has various functions. 

#### 1. Display to the opposite panel  

By **middle clicking (pressing the mouse wheel)** the link you can open the page in the link to the opposite panel.   
**Middle clicking** with 1 panel automatically splits the display into 2 panels.   
Of course, just like ordinary browsers, it can be configured to open a new browser. 

#### 2. Sync scrolling 

By pressing the Sync scroll button, 1 page can be lined up like the pages of a book.  
Moreover, for a group of panels at this state, you can do actions such as scroll, page transition or close at the same time. 　
 
Also, right clicking the we page, you can choose from a menu for a 2-page spread that reads left to right or from right to left. (Commonly it's left to right) 

#### 3. Side (bottom) bar

You can open favorite pages or pages from your history using the side bar.  
The side bar can display web pages same as common panels. 　　  
The difference to common panels is even if you change the window size, the width remains fixed, and only this cannot be used with sync scrolling. 

#### 4. Slim menu 
In order to optimize the use of screen space, there are 2 possible display modes.  
- One Line mode: Using a display method that integrates the menu bar and tab bar, it achieves a menu with a mere 30px.   
- Full screen mode: The menu bar is not displayed and the menu is displayed by moving the cursor. 

#### 5. Panel movement
For general browser, by dragging and dropping the tab, you can move the tab.
In addition to moving the tab, this browser can be moved all the tabs of one tab to other panel or window by dragging or dropping the tab addition button.

#### 6. Float panel mode
By selecting Floating Panel from the menu that is displayed by right clicking a tab,you can detach the panel that can be moved within the window.   
It is a function that can be used for playing videos etc. while web browsing. 

#### 7. Simultaneous page transition 
By using a regular expression, the page URL can be permutated and opened in a different page.  
It can also open a normal page at the left and Google Translate at the right.   

The method of entering data is entering the regular expression for the URL at the left, and entering the text after permutation at the right.   
By using () at the left makes it CAPTCHA, and can be used for the content after permutation using numerals.   
(It can be used as text which was encoded with $$ numbers.)   

For example, by making the left side `(.+)` and the right side `https://www.google.com/search?q=$$1`, the target URL can be Google-searched. 

#### 8. Other
- Swapping panels: You can switch the position of 2 panels. 
- Aligning panels: Panels can be lined up with fixed widths horizontally or vertically. 
- Switch direction:You can realign vertically-lined panels horizontally or horizontally-lined panels vertically. 
- Simultaneous scrolling: By moving the mouse wheel, you can scroll 2 panels at the same time.
- Mobile mode: You can carry out the switch to pages for mobile device use. (Change of user agent)

## Extension tools 
As a special tool, it has the following functions. 
1. Terminal: It can operate Bash for Linux/Mac and Power Shell for Windows. 
2. File explorer: It can manage and browse files. 
3. Text editor: It can edit text and source codes etc.
4. Video playback: It can be used for automatic playback of videos. 

By taking advantage of the above functions operation close to IDE (integrated development environment) becomes possible.


## Muon (Electron Fork)
This browser uses [Muon](https://github.com/brave/muon) as a browser function.  
Muon is a framework for very fast browser with [Electron's](https://github.com/electron/electron) fork that was used for the [Brave browser](https://github.com/brave/browser-laptop).   

1. AdBlock: Equipped with a native-implemented high speed advertisement block.
2. Chromium: It uses Chromium in its engine, which implemented in Chrome's open source code. The newest, and moreover, high speed execution is possible. 
3. Partial support from Chrome extensions: It can use some of Chrome's extensions.


## Useful features

#### 1. Download function
- Video download: When downloading video and music information, download link is displayed automatically.  
- Parallel download: For 1 file it can download with a maximum of 16 parallel downloads. 

#### 2. Mouse gesture
It can use mouse gestures from Chrome's extension features. Even in Mac and Linux it can be used with the same operability as in Windows. 

#### 3. AutoPagerize
It can automatically read ahead websites that spans several pages. (Chrome Extension)

#### 4. Anything Search
When entering an address in the address bar, or by pressing the Shift key twice, it can carry out a search from the browser history. 

#### 5. Data syncing (Experimental)
Turning Sync Data on makes syncing possible from the history and favorites from multiple machines. 

## Web Technologies

This browser makes use of wonderful web technologies, starting with the following. 
- [Muon](https://github.com/brave/muon) (A fork from [Electron](https://github.com/electron/electron), used for the [Brave browser](https://github.com/brave/browser-laptop), and a framework for high speed browsers) 
- [Inferno](https://github.com/infernojs/inferno) (An extremely fast, React-like library)
- [Semantic UI React](https://github.com/Semantic-Org/Semantic-UI-React)
- [xterm.js](https://github.com/sourcelair/xterm.js/) (Terminal used for visual studio code etc.)

# Downloads
Both the installer for every platform and the portable version can be downloaded.  
To use the portable edition, please run sushi.exe for Windows and sushi-browser for Mac/Linux after decompressing.

- [Windows Installer v0.16.2](https://sushib.me/dl/sushi-browser-0.16.2-setup-x64.exe)
- [Windows Portable v0.16.2(self-extract)](https://sushib.me/dl/sushi-browser-0.16.2-win-x64.exe)
- [Windows Portable v0.16.2](https://sushib.me/dl/sushi-browser-0.16.2-win-x64.zip)
- [MacOS dmg v0.16.2](https://sushib.me/dl/SushiBrowser-0.16.2.dmg)
- [MacOS Portable v0.16.2](https://sushib.me/dl/sushi-browser-0.16.2-mac-x64.zip)
- [Linux rpm (for Fedora/CentOS) v0.16.2](https://sushib.me/dl/sushi-browser-0.16.2.x86_64.rpm)
- [Linux deb (for Debian/Ubuntu) v0.16.2](https://sushib.me/dl/sushi-browser_0.16.2_amd64.deb)
- [Linux Portable v0.16.2](https://sushib.me/dl/sushi-browser-0.16.2.tar.bz2)

# Use of Flash 
If Flash won't run, please install Flash from the following web sites.  
- [Adobe Flash Player](https://get.adobe.com/flashplayer/)

Also, for Linux, there are cases that it won't run after the above install.  
These will lower the security level but the following commands can be run. 
 
```
sushi-browser --no-sandbox
```

# New Features

#### New function(v0.162)
- Improve the volume icon so that it appears on the tab when playing videos.
- Added function to switch mute status by clicking volume icon.
- Added function to change volume from 0 to 800% when mouse over volume icon.
- Changed to disable Auto Highlight when closing search window.
- Changed Auto High Highlight's default behavior to Highlight only to the next page.
- Added option of whether to auto highlight recursively.
- Changed default behavior when opening links on sidebar and toolbar to open link on current tab.
- Added setting to open links on sidebar and toolbar.
- Changed to be able to open links on sidebar and toolbar with middle click.
- Added setting to open bookmark bar link in new tab.
- Added Session Manager to sidebar.
- Improvement of Automation Center.
- Fixed a lot of bugs.
- Updated to youtube-dl 2018.05.09.

#### New function(v0.16.2)
- Added bookmark bar
- Added display control function on top page of bookmark bar
- I made it possible to drop and drag a link to a bookmark sidebar
- Implemented a delete function (☓ button) for speed dial on the top page
- Changed on / off display method of some items of main menu to ✓
- Fixed some bugs

#### New function(v0.16.0)
- Tab freeze, tab protection, tab locking function added (It is close to Tab Mix Plus)
- Changed Pin Tab behavior to be like Chrome.
- Added Match Case, OR search, Regular expression to search function(Ctrl+F).（We referred to the source of https://github.com/intelfike/isear）
- Added search word highlight function. (such as word highlight extension)
- When right-click menu is displayed after selecting URL, right-click menu is modified so that move to URL instead of search is displayed
- Updated to Muon 5.2.7 (chromium 66.0.3359.117)

#### New function(v0.15.0)
- Added browser auto-operation function.<br/> * This is an automatic operation solution like iMacros or Selenium IDE.<br/> It is realized by implementing an API compatible with <a href="https://github.com/GoogleChrome/puppeteer">Puppeteer (Headless Chrome Automation)</a> API.<br/> Please refer <a href="https://github.com/kura52/sushi-browser/wiki/Implementation-status-of-Puppetter-APIs">here</a> for the implemented API
- Fixed Bookmark and Favicon Import bug.
- Fixed some bugs.
- Change display method of dialog(window.alert).
- Updated to youtube-dl 2018.04.16
- Updated to infernojs 5.0.4

#### New function(v0.14.6)
- Added setting that Clear the history data types when I close Browser
- Fixed Adblock bug.
- Fixed a lot of bugs.
- Updated to Muon 5.1.2
- Updated to youtube-dl 2018.03.26.1
- Updated to infernojs 5.0.1
- Updated to node-pty 0.7.4

#### New function(v0.14.5)
- Improve display of main menu.
- Fixed bug that 'Bind Selected Window' does not work on Windows.
- Fixed autofill bug.
- Fixed findInPage bug.
- Updated to youtube-dl 2018.03.10

#### New function(v0.14.4)
- Improve tab open performance.
- Changed the selection method of user data folder in portable version.
- Fix Dialog bug.
- Updated to Muon 5.0.7

#### New function(v0.14.3)
- Updated to youtube-dl 2018.02.25
- Updated to Muon 5.0.6

#### New function(v0.14.2)
- Changing the save destination of the user file in the portable version to the same level as the executable folder. (Portable Edtion became really Portable.)
- Files are saved ./resources/app.asar.unpacked/resource/portable .
- Fixed a lot of bugs.

#### New function(v0.14.1)
- Fixed install bugs
- Fixed autofill bugs

#### New function(v0.14.0)
- Added video conversion function using handbrake
- Added audio extraction and conversion function using ffmpeg
- Added function to convert video after downloading video
- Added 32 bit version of Windows
- Updated to youtube-dl 2018.02.11
- Updated to Muon 4.7.10 (chromium 64.0.3282.140)
- Fixed a lot of bugs

#### New function(v0.13.7)
- Fixed tab's drop and drag bug
- Fixed loading status
- Implemented basic auth handler(Issue #12)
- Fixed addressBar focus and Blur bug
- Added 'Download and Play Video' in Context Menu

#### New function(v0.13.6)
- Fixed control of video in iframe
- Improve chrome extension's popup behavior

#### New function(v0.13.5)
- Fixed session bug
- Fixed drag effect

#### New function(v0.13.4)
- Fixed error when dropping and dragging
- Fixed a bug that ended abnormally when searching

#### New function(v0.13.3)
- Fixed a fatal bug regarding mute
- We made widevine usable
- Updated to youtube-dl 2017.01.07
- Updated to Muon 4.5.38

#### New function(v0.13.2)
- Fixed fatal bug when loading page
- Fix some bugs
- The color of mute / pin / reload icon can be set

#### New function(v0.13.1)
- Improve Chrome Extension Function
- Improve behavior when closing window
- Fix some bugs

#### New function(v0.13.0)
- The convenience functions of the tab were implemented (Some functions of Tab Mix Plus were implemented.)
  - Open links that open in a new window in
  - When closing current tab, focus
  - Do not close window when closing last tab
  - Open New Tab next to current one
  - New Tab from Address Bar
  - Force to open in new tab: Nothing/Links to other sites/All links
  - Open New Tab in Background
  - Open New Tab next to current one
  - Max number of rows to display (Multi-row)
  - Tab minimum and maximum Width setting
  - Show tabs in page theme color
  - Background Color of Current/Unread/other Tabs
  - Text Color of Current/Unread/other Tabs
  - Color of Dashed line when dragging
  - Show Bottom Border in Current Tab
  - Add Button that can select default theme and dark theme
  - Inverse scroll direction
  - Select tab pointed
  - Switch to last selected tab when clicking current one
  - Mouse Clicking Function (Double Click, Middle Click, Alt Click)
  - New Tab Button Clicking Function (Right Click, Middle Click, Alt Click)
  - Copies the tab's URL to the clipboard
  - Load URL from clipboard
  - Paste and Open
  - Copy Tab Info
  - Copy All Tab Infos
  - Reloads all tabs
  - Reloads other tabs
  - Reloads left tabs
  - Reloads right tabs
  - Reload Tab Every
  - Mute Tab
  - Reopens all closed tabs

- Addition of the Auto Complete function
  - You can use the suggestion of the search engine now
  - The number of the indication and the order of the suggests and the histories were made controllable by the setting
  - Automatic completion is available when selecting auto complete item
- 
- Improvement of the downloading function
  - Collective downloading function by the consecutive numbers (such as downthmeall) 
  - The URLs and the dates were made usable as the file names (such as downthmeall)
  - The setting of the default downloading path was added

- Function improvement of the vertical tab 
  - It was made possible to fold the hierarchies

- Improvement of showing two kinds panels, a current panel and opposite panel, by a right-click search 
- Addition of a full screen button（Display / Non-display is configurable）
- Addition of a number display function to a back / forward button 
- Addition of a keyboard shortcut
- The bookmarklet on the address bar was made possible to execute.

- Implementation of the following Chrome Extension
  - chrome.webNavigation.getAllFrames
  - chrome.sessions.getRecentlyClosed
  - chrome.sessions.restore
  - browser.sessions.setTabValue
  - browser.sessions.getTabValue
  - browser.sessions.removeTabValue
  - browser.sessions.setWindowValue
  - browser.sessions.getWindowValue
  - browser.sessions.removeWindowValue

- Updated to youtube-dl 2017.12.31
- Updated to Muon 4.5.36 (chromium 63.0.3239.132)
- Fixed a lot of bugs

#### New function(v0.12.1)
- Updated to Muon 4.5.32
- Fixed bug due to Chromium 63 specification change
- Reduce unnecessary files
- Fixed bugs caused by downloads, databases, etc.

#### New function(v0.12.0)
- Added edit function of right click menu
- Reduction favicon and page capture image size
- Added multiple selection in download function
- Chrome Extension improvements(chrome.tabs,browser.contextMenu,browser.runtime,chrome.downloads,chrome.bookmarks)
- Added polyfill for scrollTopMax and scrollLeftMax
- Updated to youtube-dl 2017.12.23
- Updated to Muon 4.5.31 (chromium 63.0.3239.84)
- Fixed a lot of bugs

#### New function(v0.11.0)
- Add Fingerprint Protection and NoScript function
- Add setting to delete browsing data
- Add function that can install WebExtension from firefox add-ons site
- Chrome Extension improvements (chrome.commands, options_ui)
- Fixed download function bugs
- Updated to Muon 4.5.21

#### New function(v0.10.0)
- Add downloader function
- Add batch download function like DownThemAll!
- Add for video download function
- Add Full Page and Selection's Screenshot function (like Vivaldi Browser)
- Movie function bug fixes
- Many other bug fixes
- Updated to Muon 4.5.18(chromium 63.0.3239.40)

#### New function(v0.9.0)
- Enhanced video download function
- Added function to download streaming video (HLS (.m3u8)) using youtube-dl
- Added function to manipulate video with mouse and keyboard
- Added function that play video in popup window
- Added function that play video in floating panel
- Updated to Muon 4.5.15

#### New function(v0.8.0)
- Add Vertical Tabs and Tree Style Tabs
- Improvement of Tab type Extension（move,onMoved,onDetached,onAttached)
- Add automatic / user session save function
- Add tab history
- Added import passwords from Chrome.
- Added import passwords from Firefox.
- Add HTTPS Everywhere, Protection Tracking
- Improvements Video download(e.g. display number of media)
- Update youtube-dl
- Chrome Extension improvements (chrome.history, chrome.topSites, chrome_url_overrides)
- Fixed a lot of bugs and Chrome Extension API issue
- Updated to Muon 4.5.14

#### New function(v0.7.0)
- Implemented partical chrome extensions API (Experimental)
- Added function that can install Chrome extension from Chrome web store
- Implemented multi-row tabs
- By right clicking the icon on the menu bar, we made it possible to sort
- Performance Improvement
- Fixed a lot of bugs


- Extensions Path (If browser becomes unstable please delete folders)
  - Windows: C:\Users\[Name]\AppData\Roaming\sushiBrowser\resource\extension
  - MacOS: /Users/[Name]/Library/Application Support/sushiBrowser/resource/extension
  - Linux: ~/.config/sushiBrowser/resource/extension/


- Partical or All implemented APIs
  - chrome.browserAction
  - chrome.contextMenus
  - chrome.cookies
  - chrome.extension
  - chrome.i18
  - chrome.idle
  - chrome.pageAction
  - chrome.proxy
  - chrome.runtime
  - chrome.sessions
  - chrome.storage
  - chrome.tabs
  - chrome.webNavigation
  - chrome.webRequest
  - chrome.windows


#### New function(v0.6.1)
- Added session tab function
- Fixed bug at load start and stop

#### New function(v0.6.0)
- Speed up by making main synchronization processing asynchronous
- Speed up the process of creating new tabs
- Speed up display processing of Top page
- Update npm library

#### New function(v0.5.0)
- Added VPN function (Windows only). We are using the VPN Gate service and connect with MS-SSTP VPN. (It is a true VPN which is not a multiple proxy.)
- Added function to extract audio from video (using ffmpeg)
- Reduce download file size (initial launch after installation is slightly late)
- Fixed Issue #9 on MacOS(Command-scroll wheel to zoom is making my page all sorts of crazy sizes)
- Fixed Issue #10 on MacOS (Copy doesn't work on Mac OS)

#### New function(v0.4.0)
- The function to send and play URL to the external media player (such as VLC Media Player etc.) was added.
- The function to select multiple tabs and to enable tab operation and drop and drag was added.
- Fixed so that it works properly when the link is sent from the external application in the case that it is set up as a default browser.
- Fixed so that multiple applications start in parallel.

#### New function(v0.3.0-0.3.3)
- Improved top page's customizability 
- Fixed bug that does not start on Windows
- Added control of AdBlock by domain
- Added option page for extensions
- Performance improvement of the top menu history
- Add page translation function that use Simultaneous page transition to right click menu
- Reduced the number of files using asar archive
- Addition of update information notification
- Add the latest history information to the top page
- Improved performance when new window is opened
- Able bind other windows to the panel (Only for Windows and Linux )  
  Note:  Please install wmctrl when using on Linux. (apt-get install wmctrl or yum(dnf) install wmctrl)
- Multiple search at the same time by right-clicked menu
- Drop and drag to divide the panel
- Download function is changed to Aria2's wrapper. It has better performance and stability. The limit of the maximum of parallel download will be changed to 16(Aria2's maximum).
- Improvement of the sidebar bookmark and the history function.
- Improvement of the top menu bookmark and the history function.
- Mouse gesture for special pages like Top Page
- Improvement of the behavior of the private tab
- Introducing the full text search in history function (Experimental)
- Deleting unnecessary data (Reducing some download size)


#### New Function (v0.2.0-v0.2.1)
- Search engines can be selected.
- Multiple simultaneous search function, (For example, if you input "g4 word" in the address bar, you can search in multiple panels with different conditions simultaneously.)
- Partial localize.
- Addition of the setting pages.
- Addition of the keyboard shortcuts and the setting page for the key bind.
- Add a function to convert 1 window with multiple panels to multiple windows
- Improve performance with MacOS
- Add function of horizontal scrolling by using triple clicks
- Add comic pdf viewer
- Improve right click menu line order
- Changing the action of the mouse's middle click by pressing for a long time and clicking only. (For normal clicking, the opposite panel will be opened as link. When pressing for a long time, the same panel will be open in the background as link. )


# TODO

- Enhanced Anything Search
- Adblock control panel
- Addition of build method in the Readme
- Refactoring, introduction of Mobx (currently closely integrated with the PubSub base) 
- Add test code
- Auto Update
- Manual
- New features  

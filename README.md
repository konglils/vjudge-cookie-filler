[English](README.md) ｜ [中文](README.zh-CN.md)

# VJudge Cookie Filler

**VJudge Cookie Filler** is a Tampermonkey script that automatically retrieves cookies from supported online judges (OJs) so you can submit problems to [Virtual Judge](https://vjudge.net/) using your own accounts.

Currently supported OJs: Codeforces, QOJ, UVA, Luogu, and Nowcoder.  
It's easy to add support for more OJs — welcome to submit PR.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension

2. In Tampermonkey settings, switch "Config mode" to **Advanced**
<img width="1275" alt="64283956183d0e292307aa7f74749674" src="https://github.com/user-attachments/assets/9669c235-4d75-428d-b5e4-befdd04bd311" />

3. Make sure "Allow scripts to access cookies" is set to **All**, and then save
<img width="1259" alt="728e5bed67efe01ba4ba6b2298a21256" src="https://github.com/user-attachments/assets/2a2d14e7-9418-4cae-a01d-8a2e80d171d3" />

4. [Install the script](https://update.greasyfork.org/scripts/536701/VJudge%20Cookie%20Filler.user.js)

5. If you're using a Chromium-based browser, [enable developer mode](https://www.tampermonkey.net/faq.php#Q209)

## Usage

When you're on a VJudge Submit page, simply click "My Account" or "Archive". The script will automatically perform — no manual steps needed.

<img width="1126" alt="179fc45e61661f60d2abe83cbdba1328" src="https://github.com/user-attachments/assets/d8f363db-7e9c-4458-a402-31416bc52f2d" />

Your browser will pop up a new web page showing in which OJ you are trying to log, if you haven't log in yet. Just log in, close the page, and back to VJudge.

## Script Homepage

[Greasy Fork](https://greasyfork.org/zh-CN/scripts/536701-vjudge-cookie-filler) ｜ [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/3459)

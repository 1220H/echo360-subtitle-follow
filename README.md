# 🎧 Subtitle Follow

**A reading-style subtitle panel for lecture recordings.** Subtitle Follow is a free bookmarklet. It was made for **Echo360** and works with most HTML5 video players. One click opens a panel next to the video that:

- **loads the lecture's subtitles automatically** on Echo360, so you don't need to download anything,
- **scrolls with the video** at any speed and after seeking, and lets you **click any line to jump** there,
- **translates the whole lecture**, either free with Google Translate or with your own AI API key for accurate terminology,
- lets you **save new words** together with the sentence they came from,
- **exports** a bilingual VTT, a bilingual lecture transcript (Markdown) or your vocabulary list (CSV for Anki),
- can **pop out into a floating always-on-top window**, so it never covers the slides,
- can show **movie-style subtitles on the video itself** (🎬), bilingual or one language, and also in full screen. You can also shrink the panel to a **one-line subtitle bar** (▭).

[中文说明](#中文说明) · **[Install page →](https://1220H.github.io/lecture-subtitle-follow/)** · [VTT file translator](https://1220H.github.io/lecture-subtitle-follow/translator.html)

> Unofficial. Not affiliated with or endorsed by Echo360.

## Why

Many international students rewatch lectures with the transcript open beside the video. The usual routine is to download the transcript, translate it, then keep scrolling a text file by hand to find the right line. At 1.5× speed the scrolling never stops. Subtitle Follow keeps the right line in view for you and puts the translation right under it.

It is a **reading view**: you see the sentences before and after the current one, can scroll back, and can click to re-listen. The 🎬 mode also gives you movie-style subtitles on the video. For a full browser extension built around that style, have a look at **[Echo360 Online Subtitle Translator](https://github.com/bryanxianyu/echo360-online-subtitle-translator)**, a full browser extension that solves the same pain point.

## Install

Open the **[install page](https://1220H.github.io/lecture-subtitle-follow/)** and drag the red button onto your bookmarks bar. Show the bar with ⌘⇧B on Mac or Ctrl+Shift+B on Windows. You don't need to install any extension.

## Use

1. Open a lecture on Echo360 and click **🎧 Subtitle Follow**. The subtitles load by themselves.
2. **🌐 Translate → Start.** Tick *Translate automatically* and every lecture is translated as soon as it opens. This is on by default for non-English browsers.
   - **Google Translate** is free and needs no sign-up. It works fine for everyday sentences but can get subject terms wrong. In one econometrics lecture it rendered *treatment effect* as "medical treatment" and *matching* as "outfit matching".
   - **AI model** lets you paste a key for any OpenAI-compatible API: DeepSeek, OpenAI, Gemini, OpenRouter, Alibaba Cloud Model Studio, SiliconFlow and others. It knows the lecture title and translates terms correctly. The panel shows the token count.
   - Caption fragments are merged into full sentences first, and each lecture's translation is cached.
3. **Select a word → ＋ Save word.** Open **📒 Words** to review the list, jump back to where each word came from, or export it.
4. **⤓ Export**: bilingual VTT, bilingual transcript, or vocabulary CSV.
5. **🪟** pops the panel out into its own window (Chrome / Edge 116+).
6. **🎬** puts the current line on the video. Drag it to move it and scroll on it to resize it. Close the panel with ✕ to keep only the subtitles. **▭** turns the panel into a slim subtitle bar.

On other sites, load a `.vtt` / `.srt` file with **📂**. Clicking the bookmark again hides or shows the panel.

## VTT file translator

[`docs/translator.html`](https://1220H.github.io/lecture-subtitle-follow/translator.html) is a standalone page for translating subtitle files. It works with any OpenAI-compatible API, supports 17 target languages and exports bilingual or translation-only VTT. Use it when you have a file but no video page.

## Privacy

There is no server and no tracking. Subtitles, translations, settings and your API key stay in your own browser, in the local storage of the site where you use the panel. Text is sent only to the translation service you pick. On Echo360 the panel reads the lesson's transcript with your existing login, exactly as the page's own download button does.

## Develop

```bash
python3 tools/build.py   # src/subtitle-follow.js → docs/bookmarklet.txt + docs/index.html
```

| Path | What |
|---|---|
| `src/subtitle-follow.js` | Bookmarklet source |
| `tools/index.tpl.html` | Install page template |
| `docs/` | GitHub Pages site: install page and file translator |
| `examples/sample-lecture.vtt` | Small synthetic sample for testing |

To host your own copy, set `REPO_URL` in `tools/build.py`, run the build, and enable **GitHub Pages → Deploy from branch → `main` / `docs`**.

## License

MIT

---

## 中文说明

**给课程录播用的「对照阅读式」字幕面板。** 这是一个免费的书签小工具，为 **Echo360** 做的，大多数 HTML5 视频网站也能用。点一下书签，视频旁边会出现一个字幕面板，它可以：

- 在 Echo360 上**自动获取这节课的字幕**，不用再手动下载 VTT；
- **自动跟着视频滚动**，倍速、拖进度条都能跟上，**点任意一句就能跳过去**回听；
- **自动翻译整节课**：打开课程后会自动用 **Google 免费翻译**，直接显示中英双语，什么都不用设置。想要更准的话，可以换成自己的 **AI API Key**，专业术语翻得更准；
- **收藏生词**：选中一个词，点「＋ 生词」，它和所在的原句、译文会一起保存；
- **导出**：双语字幕 VTT、整节课的双语讲稿（Markdown）、生词本 CSV（可以导入 Anki）；
- **弹出成独立的置顶小窗口**，放到副屏或屏幕角落，不挡课件；
- **🎬 字幕叠在视频上**，像看电影一样，可以双语或单语，全屏时也有；也可以用 **▭** 把面板缩成一条只显示当前这句的字幕条。

> 非官方工具，与 Echo360 无关。

**为什么做这个：** 很多留学生课后会一边看录播，一边在旁边对照字幕，但只能手动滑动字幕找位置，开 1.5 倍速时更是滑个不停。这个工具让当前这句自动停在眼前，译文就在它下面。

它是「**阅读视图**」：上下文都看得到，可以往回翻，也可以点着回听。

**同类项目：** 这个工具是我在 UEA 上课时，为了解决自己看录播课的痛点做的。做完之后才发现，悉尼大学的 [@bryanxianyu](https://github.com/bryanxianyu) 早先也做了一个思路相近的浏览器扩展 [Echo360 Online Subtitle Translator](https://github.com/bryanxianyu/echo360-online-subtitle-translator)，它把翻译字幕直接叠在视频上，像看电影一样。两个工具各有侧重，欢迎都试试。

**免费翻译和 AI 翻译怎么选：** Google 免费翻译零门槛，日常句子没问题，但学科术语容易翻错。比如在一节计量经济学课里，它把 treatment effect 翻成了「治疗效果」，把 matching 翻成了「搭配」。AI 大模型知道课程名称，会翻成「处理效应」和「匹配」。没接触过 API 的同学，直接用免费翻译就行。

**安装：** 打开[安装页](https://1220H.github.io/lecture-subtitle-follow/)，把红色按钮拖到书签栏。不需要安装任何浏览器扩展。

**隐私：** 没有服务器，也没有任何统计。字幕、译文、设置和 API Key 都只保存在你自己的浏览器里，文本只会发送给你选择的翻译服务。

---

**Credits:** An idea of mine, turned into a working tool and refined together with Claude (Anthropic's AI assistant).

**致谢：** 这是我把自己的想法交给 Claude（Anthropic 的 AI 助手）之后，一起完善出来的小工具。

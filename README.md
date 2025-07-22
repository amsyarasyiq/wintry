<div align="center">
	<img height="150" alt="Wintry logo" src="https://github.com/user-attachments/assets/a177d9a0-10bf-43d4-be13-0fe196eda726" />
	<p align="center">A Discord mod built with simplicity and a seamless experience in mind.</p>

[![Version](https://img.shields.io/github/package-json/v/amsyarasyiq/wintry?logo=github)](https://github.com/amsyarasyiq/wintry/releases/latest)
[![Discord](https://img.shields.io/discord/1394286025026572310?logo=discord&logoColor=white&color=5865F2)](https://discord.gg/ATrscNAMpE)
[![Code Size](https://img.shields.io/github/languages/code-size/amsyarasyiq/wintry?color=blue)](https://github.com/amsyarasyiq/wintry)
[![License](https://img.shields.io/github/license/amsyarasyiq/wintry?color=007ec6)](https://github.com/amsyarasyiq/wintry/blob/main/LICENSE)

</div>

---

> [!IMPORTANT]
> ### Experimental Project Notice
> Wintry is an experimental and in-progress project. Development is sporadic, and many features are incomplete or subject to change at any time.
> 
> While forks of this project may exist, please note that some may integrate unstable or unfinished features. See [Forks](#forks) notice for more information.

## Features
Wintry enhances your Discord experience through a powerful, first-party plugin system. Key plugins include:

- Experiments - Unlocks hidden and experimental Discord features.
- ExpressionUtils - Easily clone, copy links for your favorite emotes.
- ChatBubbles - Add chat-style bubbles to your messages in conversations.
- NoTrack - Disables Discord's built-in analytics and tracking for improved privacy.
- ...many more coming down the road!

## Installation

The recommended way to install Wintry on Android is with the [**Wintry Manager**](https://github.com/wtcord/wt-manager).

> [!NOTE]
> Wintry is currently built for and officially supported only on **Android**. Supporting iOS is theoretically possible, but the project lacks a dedicated maintainer for it.

## Contributing
We welcome contributions from the community! Whether you're fixing bugs, adding new features, or improving documentation, your help is greatly appreciated. Please make sure to review our [contributing guidelines](./CONTRIBUTING.md) before getting started.

## FAQs

<details>
  <summary>
	  <b>What's the motive of this project?</b>
  </summary>

Wintry is an attempt to bring back the proof-of-concept version of Pyoncord while staying true to its goal of being something different. It takes inspiration from existing projects especially from Vencord but follows its own direction.   

> So, what exactly is 'different' this time?

Pyoncord's ultimate goal was to achieve **lazy Metro module acquisition/patching** for performance benefits. After discovering a way to achieve similar benefits while retaining the existing mod's infrastructure, Pyoncord reached its conclusion, and Bunny took over.

However, while developing Pyoncord, there were several other goals besides implementing the lazy module system, such as:  
- **Vencord-like experience** (built-in plugins)  
- **Platform-focused patching** (to access/patch native stuff)  

These goals were fundamentally incompatible with the existing infrastructure, so starting from the ground up was necessary.  

</details>

<details>
  <summary>
	  <b>Is Wintry a good replacement?</b>
  </summary>

Depends. If you value plugin stability over variety, Wintry may be a good replacement for you. Wintry is first-party focused, meaning there may be fewer plugins available compared to other client mods, but they will be more stable and reliable.
</details>

<details>
  <summary>
	  <b>Will Wintry ever support third-party plugins?</b>
  </summary>

**Maybe.** However, Wintry will stay first-party focused, so even if it ever supports third-party plugins, the experience won’t be the same as with other third-party-focused client mods. Discovering and installing third-party plugins will be more difficult, and Wintry will not provide technical support for them. This feature, if introduced, would exist primarily for advanced users.

</details>

<details>
  <summary>
	  <b>Why does Wintry prioritize first-party plugins?</b>
  </summary>

Wintry prioritizes first-party plugins to ensure security, compatibility, and stability. Third-party plugins can introduce risks such as security vulnerabilities, performance issues, and inconsistencies in the user experience. By focusing on first-party development, Wintry can maintain a more controlled and reliable environment.

There are definitely drawbacks to this idea, such as introducing bloat since all plugins are built-in whether you like it or not, or having less plugin variety since all plugins need to be vetted for quality.
</details>

<details>
  <summary>
	  <b>If third-party plugins are allowed in the future, what restrictions will there be?</b>
  </summary>

If Wintry ever supports third-party plugins, users will be able to install whatever they want, but they must acknowledge that:  
- Wintry will not provide technical support for third-party plugins.  
- Users must manually discover, install and manage their third-party plugins.  
- No guarantees will be made regarding security, stability, or compatibility.
</details>

## Notices

### Forks
This project is open source and may be forked under its license. While forking is permitted, some forks includes experimental and unfinished features taken from development branches of Wintry, attach donation links, and rebrand the project with little deviation from the original.

Such forks may appear active or refined, but often rely heavily on in-progress code and surface-level edits. They are not affiliated with this project and do not represent its goals, development philosophy, or standards. Please evaluate forks carefully.

### License

Wintry is primarily licensed under the [**GNU General Public License v3 (GPL-3)**](http://www.gnu.org/copyleft/gpl.html). Please note that some components may be subject to different licenses; refer to the source files for full details.

### **Disclaimer**  
Using *any* Discord client mod, including Wintry, is against Discord's Terms of Service. However, there have been no reports of Discord enforcing this rule unless there is actual API abuse, which Wintry opposes. Using Wintry should be as safe as using other client mods, if not safer.

> [!IMPORTANT]  
> **This project is a work in progress!** Technical support is limited. While you are free to use this mod, expect potential bugs and incomplete features. Use at your own discretion.

# **wintry**
Yet another Discord mobile mod, inspired by Vencord.

## Features
- Built-in plugins:
	- Experiments - you probably know what this is
	- ExpressionUtils - a.k.a. EmoteCloner
	- ChatBubbles - you never have seen this before
	- NoTrack - out-of-the-box
	- ...many more coming down the road!

## **Platform Support**
At the moment, Wintry is built for and only supported on **Android**. Supporting iOS is theoretically possible, but we would need a maintainer with experience in iOS tweaks. Supporting would require:  
- Developing a **loader tweak**  
- Adapting the **JS** side to support iOS-specific stuff  
- Thorough testing

If you're interested in maintaining the iOS support, feel free to reach out.  

## **Installation**
To install Wintry, a **loader** is required to inject and provide native functionality to Wintry. Wintry **does not** support loading from an existing mod's loader (Bunny's, Enmity's, etc).  

Currently, the only available loader is [**WintryXposed**](https://github.com/wtcord/xposed), which injects through the **Xposed** framework. For non-rooted devices, you can use [LSPatch](https://github.com/JingMatrix/LSPatch) to embed the Xposed module into a Discord APK.  

## Contributing
We welcome contributions from the community! Whether you're fixing bugs, adding new features, or improving documentation, your help is greatly appreciated. Please make sure to review our [contributing guidelines](./CONTRIBUTING.md) before getting started.
## FAQs

<details>
  <summary>
	  <b>What's the motive of this project?</b>
  </summary>

Wintry is an attempt to bring back the proof-of-concept version of Pyoncord while staying true to its goal of being something different. It takes inspiration from existing projects especially from Vencord but follows its own direction.  

Wintry's goal can be summarized as:
- **Bunny**, without the Vendetta part  
- **Vencord**, but mobile  
- **Pyoncord v2**  

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

## Related & Notices

### **Similar Projects**
If some parts of Wintry tick you off for some reason, there are other alternatives you can check out:
- [**Bunny**](https://github.com/bunny-mod/Bunny) *(ancestor)*  
- [**Revenge**](https://github.com/revenge-mod/)  
- [**Unbound**](https://github.com/unbound-mod/)  

### **License**  
Wintry is generally licensed under the [**GNU General Public License v3 (GPL-3)**](http://www.gnu.org/copyleft/gpl.html). Some parts of the codebase may have different licenses.

### **Disclaimer**  
Using **any** Discord client mod, including Wintry, is against Discord's **Terms of Service**. However, there have been no reports of Discord enforcing this rule unless there is actual **API abuse**, which Wintry opposes. Using Wintry should be as safe as using other client mods, if not safer.


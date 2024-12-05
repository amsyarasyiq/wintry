import { ClientInfoModule } from "../native";

export function getDebugInfo() {
    // Hermes
    const hermesProps = window.HermesInternal.getRuntimeProperties();
    const hermesVer = hermesProps["OSS Release Version"];
    const padding = "for RN ";

    // RN
    // const PlatformConstants = Platform.constants as RNConstants;
    // const rnVer = PlatformConstants.reactNativeVersion;

    return {
        discord: {
            version: ClientInfoModule.Version,
            build: ClientInfoModule.Build,
        },
        react: {
            // version: React.version,
            // nativeVersion: hermesVer.startsWith(padding) ? hermesVer.substring(padding.length) : `${rnVer.major}.${rnVer.minor}.${rnVer.patch}`,
        },
        hermes: {
            version: hermesVer,
            buildType: hermesProps.Build,
            bytecodeVersion: hermesProps["Bytecode Version"],
        },
        // ...Platform.select(
        //     {
        //         android: {
        //             os: {
        //                 name: "Android",
        //                 version: PlatformConstants.Release,
        //                 sdk: PlatformConstants.Version
        //             },
        //         },
        //         ios: {
        //             os: {
        //                 name: PlatformConstants.systemName,
        //                 version: PlatformConstants.osVersion
        //             },
        //         }
        //     }
        // )!,
        // ...Platform.select(
        //     {
        //         android: {
        //             device: {
        //                 manufacturer: PlatformConstants.Manufacturer,
        //                 brand: PlatformConstants.Brand,
        //                 model: PlatformConstants.Model,
        //                 codename: DeviceManager.device
        //             }
        //         },
        //         ios: {
        //             device: {
        //                 manufacturer: DeviceManager.deviceManufacturer,
        //                 brand: DeviceManager.deviceBrand,
        //                 model: DeviceManager.deviceModel,
        //                 codename: DeviceManager.device
        //             }
        //         }
        //     }
        // )!
    };
}

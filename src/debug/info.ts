import { branch, revision, remote, version } from "#build-info";
import { loaderPayload } from "@loader";
import { NativeClientInfoModule, NativeDeviceModule } from "@native";
import React from "react";
import { Platform, type PlatformAndroidStatic, type PlatformIOSStatic } from "react-native";

export function getVersions() {
    const hermesProps = window.HermesInternal.getRuntimeProperties();

    const rnVer = Platform.constants.reactNativeVersion;
    const rnBranch = hermesProps["OSS Release Version"].replace(/^for /, "");

    return {
        wintry: {
            shortRevision: revision.slice(0, 7),
            revision,
            branch,
            remote,
            version,
        },
        loader: {
            name: loaderPayload.loader.name,
            version: loaderPayload.loader.version,
        },
        discord: {
            version: NativeClientInfoModule.getConstants().Version,
            build: NativeClientInfoModule.getConstants().Build,
        },
        hermes: {
            buildType: hermesProps.Build,
            bytecodeVersion: hermesProps["Bytecode Version"],
        },
        react: {
            version: React.version,
        },
        reactNative: {
            version: `${rnVer.major}.${rnVer.minor}.${rnVer.patch}`,
            branch: rnBranch,
        },
    } as const;
}

function getAndroidDebugInfo() {
    const PlatformConstants = Platform.constants as PlatformAndroidStatic["constants"];

    return {
        os: {
            name: "Android",
            version: PlatformConstants.Release,
            sdk: PlatformConstants.Version,
        },
        device: {
            manufacturer: PlatformConstants.Manufacturer,
            brand: PlatformConstants.Brand,
            model: PlatformConstants.Model,
        },
    } as const;
}

function getIOSDebugInfo() {
    const PlatformConstants = Platform.constants as PlatformIOSStatic["constants"];
    return {
        os: {
            name: PlatformConstants.systemName,
            version: PlatformConstants.osVersion,
        },
        device: {
            manufacturer: NativeDeviceModule.deviceManufacturer,
            brand: NativeDeviceModule.deviceBrand,
            model: NativeDeviceModule.deviceModel,
        },
    } as const;
}

type DebugInfo = ReturnType<typeof getVersions> &
    (ReturnType<typeof getAndroidDebugInfo> | ReturnType<typeof getIOSDebugInfo>);

export function getDebugInfo(): DebugInfo {
    return {
        ...getVersions(),
        ...Platform.select({
            android: getAndroidDebugInfo(),
            ios: getIOSDebugInfo(),
            default: {
                os: {
                    name: "Unknown",
                    version: "Unknown",
                },
                device: {
                    manufacturer: "Unknown",
                    brand: "Unknown",
                    model: "Unknown",
                },
            },
        }),
    } as const;
}

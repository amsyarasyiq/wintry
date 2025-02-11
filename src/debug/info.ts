import { branch, revision } from "#build-info";
import { NativeClientInfoModule, NativeDeviceModule } from "@native";
import React from "react";
import { Platform, type PlatformAndroidStatic, type PlatformIOSStatic } from "react-native";

export function getVersions() {
    const hermesProps = window.HermesInternal.getRuntimeProperties();
    const hermesVer = hermesProps["OSS Release Version"];

    return {
        bunny: {
            shortRevision: revision.slice(0, 7),
            revision,
            branch,
        },
        discord: {
            version: NativeClientInfoModule.Version,
            build: NativeClientInfoModule.Build,
        },
        hermes: {
            version: hermesVer,
            buildType: hermesProps.Build,
            bytecodeVersion: hermesProps["Bytecode Version"],
        },
        react: {
            version: React.version,
        },
        reactNative: {
            version: Platform.constants.reactNativeVersion,
        },
    };
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
    };
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
    };
}

export function getDebugInfo() {
    return {
        ...getVersions(),
        ...Platform.select({
            android: getAndroidDebugInfo(),
            ios: getIOSDebugInfo(),
        })!,
    };
}

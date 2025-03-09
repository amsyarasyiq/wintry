import { isValidElement, useEffect, type ReactNode } from "react";
import { wtlogger } from "./logger";
import { lookupByProps } from "@metro/common/wrappers";
import { BackHandler, Pressable } from "react-native";
import {
    AlertActionButton,
    AlertModal,
    type AlertActionButtonProps,
    type AlertModalProps,
} from "@components/Discord/AlertModal/AlertModal";
import { uniqueId } from "es-toolkit/compat";

const logger = wtlogger.createChild("Alerts");
const AlertStore = lookupByProps("openAlert", "useAlertStore").asLazy();

type DirectAlertContentProps = Omit<AlertModalProps, "actions"> & {
    actions?: AlertActionButtonProps[];
};

interface AlertConfig {
    key?: string;

    content?: JSX.Element | DirectAlertContentProps;
    Component?: React.ComponentType;

    dismissable?: boolean;
    onDismiss?: () => void;
}

const componentKeyMap = new WeakMap<React.ComponentType | JSX.Element, string>();

function retrieveComponentKey(nodeOrComponent: React.ComponentType | JSX.Element): string {
    if (componentKeyMap.has(nodeOrComponent)) {
        return componentKeyMap.get(nodeOrComponent)!;
    }

    const key = uniqueId("wt-alert-");
    componentKeyMap.set(nodeOrComponent, key);

    logger.info(`Generated key for alert: ${key}`);
    return key;
}

function ModalWrapper({ children, config }: { children: ReactNode; config: AlertConfig }) {
    useEffect(() => {
        if (config.dismissable === false) {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
                logger.info("Alert is not dismissable, ignoring back press");
                return true;
            });

            return () => backHandler.remove();
        }
    }, [config.dismissable]);

    // Only wrap in Pressable if non-dismissable
    if (config.dismissable === false) {
        return (
            <Pressable
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {children}
            </Pressable>
        );
    }

    return children;
}

export function showAlert(config: AlertConfig): string;
export function showAlert(Component: React.ComponentType, onDismiss?: () => void): string;
export function showAlert(configOrComponent: AlertConfig | React.ComponentType, onDismissOrUndefined?: () => void) {
    const config: AlertConfig =
        typeof configOrComponent === "function"
            ? {
                  Component: configOrComponent,
                  onDismiss: onDismissOrUndefined,
              }
            : configOrComponent;

    if (__DEV__ && config.Component && config.content) {
        throw new Error("Cannot provide both Component and content at the same time");
    }

    const { onDismiss, Component, content: node } = config;
    let content = node || (Component ? <Component /> : null);
    if (!content) throw new Error("No content provided for alert");

    if (!isValidElement(content)) {
        if (!config.key) throw new Error("Key must be provided for direct content");

        const props = content as DirectAlertContentProps;

        content = (
            <ModalWrapper config={config}>
                <AlertModal {...props} actions={props.actions?.map((a, i) => <AlertActionButton key={i} {...a} />)} />
            </ModalWrapper>
        );
    }

    const key = config.key || retrieveComponentKey(Component ?? content);

    AlertStore.openAlert(key, <ModalWrapper config={config}>{content}</ModalWrapper>, onDismiss);
    return key;
}

export function dismissAlert(key: string): void {
    AlertStore.dismissAlert(key);
}

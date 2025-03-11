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

const logger = wtlogger.createChild("Alerts");
const AlertStore = lookupByProps("openAlert", "useAlertStore").asLazy();

interface AlertPropsBase {
    id: string;
    dismissable?: boolean;
    onDismiss?: () => void;
}

type DirectAlertProps = Omit<AlertModalProps, "actions"> & {
    actions?: AlertActionButtonProps[] | ReactNode[];
    id: string;
};

interface CustomAlertProps {
    Component: React.ComponentType<any>;
}

export type AlertProps = AlertPropsBase & (DirectAlertProps | CustomAlertProps);

function AlertModalWrapper({ children, dismissable }: { children: ReactNode; dismissable?: boolean }) {
    useEffect(() => {
        if (dismissable === false) {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
            return () => backHandler.remove();
        }
    }, [dismissable]);

    return dismissable === false ? (
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
    ) : (
        children
    );
}

export function showAlert(props: AlertProps): string {
    // Create content
    let content: JSX.Element;

    if ("content" in props) {
        // Direct alert
        content = (
            <AlertModal
                header={props.header}
                title={props.title}
                content={props.content}
                extraContent={props.extraContent}
                actions={props.actions?.map((a, i) =>
                    isValidElement(a) ? a : <AlertActionButton key={i} {...(a as AlertActionButtonProps)} />,
                )}
            />
        );
    } else if ("Component" in props) {
        // Custom alert
        content = <props.Component />;
    } else {
        throw new Error("Invalid alert props");
    }

    logger.info(`Showing alert: ${props.id}`);
    // Open alert with required ID
    AlertStore.openAlert(
        props.id,
        <AlertModalWrapper dismissable={props.dismissable}>{content}</AlertModalWrapper>,
        props.onDismiss,
    );

    return props.id;
}

export function dismissAlert(id: string): void {
    AlertStore.dismissAlert(id);
}

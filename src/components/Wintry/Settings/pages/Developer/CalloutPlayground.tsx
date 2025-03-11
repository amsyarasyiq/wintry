import Callout from "@components/Wintry/Callout";
import PageWrapper from "@components/Wintry/Settings/PageWrapper";

export default function CalloutPlayground() {
    return (
        <PageWrapper containerStyle={{ gap: 12 }}>
            <Callout title="Info" variant="info">
                This is used to provide additional information.
            </Callout>
            <Callout title="Success" variant="success">
                This is used to provide successful feedback.
            </Callout>
            <Callout title="Warning" variant="warning">
                This is used to provide warning feedback.
            </Callout>
            <Callout title="Danger" variant="danger">
                This is used to provide error feedback.
            </Callout>
        </PageWrapper>
    );
}

import { Toast } from "@api/toasts";
import { TableRow, TableRowGroup } from "@components/Discord";
import PageWrapper from "@components/WintrySettings/PageWrapper";

export default function ToastPlayground() {
    return (
        <PageWrapper>
            <TableRowGroup title="Actions">
                <TableRow
                    label="Show toast"
                    onPress={() => {
                        const toast = new Toast({
                            content: {
                                text: "Hello, world!",
                            },
                            options: {
                                duration: 3000,
                            },
                        });

                        toast.show();
                    }}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}

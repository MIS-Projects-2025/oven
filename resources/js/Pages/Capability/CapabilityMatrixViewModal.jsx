import { Modal, Row, Col, Card } from "antd";

export default function CapabilityMatrixViewModal({
    open,
    onClose,
    data,
}) {
    if (!data) return null;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={1200}
            title="Capability Matrix Details"
        >
            <div className="max-h-[70vh] overflow-y-auto pr-2">
                <Row gutter={[16, 16]}>
                    {Object.entries(data).map(([key, value]) => (
                        <Col xs={24} md={8} key={key}>
                            <Card size="small">
                                <p className="text-xs text-gray-500 uppercase mb-2">
                                    {key.replaceAll("_", " ")}
                                </p>

                                <p className="font-semibold break-words">
                                    {value || "-"}
                                </p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </Modal>
    );
}
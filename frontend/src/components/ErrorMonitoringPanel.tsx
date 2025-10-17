import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Tag, Card, Statistic, Row, Col, Button, Modal } from 'antd';
import ErrorHandlerService from '@/services/error-handler.service';
import SentryService from '@/services/sentry.service';

// Типы для колонок таблицы ошибок
interface ErrorLogEntry {
    type: string;
    message: string;
    timestamp: number;
    code?: string;
}

const ErrorMonitoringPanel: React.FC = observer(() => {
    const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
    const [selectedError, setSelectedError] = useState<ErrorLogEntry | null>(null);
    const [statsModalVisible, setStatsModalVisible] = useState(false);

    useEffect(() => {
        // Получение истории ошибок
        const errors = ErrorHandlerService.errorHistory;
        setErrorLogs(errors);
    }, []);

    // Колонки таблицы ошибок
    const columns = [
        {
            title: 'Тип',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const colorMap: Record<string, string> = {
                    'network': 'orange',
                    'validation': 'blue',
                    'authentication': 'red',
                    'server': 'volcano',
                    'client': 'geekblue'
                };
                return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
            }
        },
        {
            title: 'Сообщение',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true
        },
        {
            title: 'Время',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: number) => new Date(timestamp).toLocaleString()
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (record: ErrorLogEntry) => (
                <Button 
                    size="small" 
                    onClick={() => handleErrorDetails(record)}
                >
                    Подробнее
                </Button>
            )
        }
    ];

    // Обработка клика для просмотра деталей ошибки
    const handleErrorDetails = (error: ErrorLogEntry) => {
        setSelectedError(error);
        
        // Отправка информации в Sentry для дополнительного анализа
        SentryService.captureMessage(`Просмотр детальной информации об ошибке: ${error.type}`, 'info');
    };

    // Закрытие модального окна с деталями ошибки
    const handleCloseErrorDetails = () => {
        setSelectedError(null);
    };

    // Статистика ошибок
    const errorStats = {
        total: errorLogs.length,
        byType: errorLogs.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    };

    return (
        <Card title="Мониторинг ошибок">
            <Row gutter={16}>
                <Col span={6}>
                    <Statistic 
                        title="Всего ошибок" 
                        value={errorStats.total} 
                    />
                </Col>
                {Object.entries(errorStats.byType).map(([type, count]) => (
                    <Col key={type} span={6}>
                        <Statistic 
                            title={`Ошибки ${type}`} 
                            value={count} 
                        />
                    </Col>
                ))}
                <Col span={6}>
                    <Button onClick={() => setStatsModalVisible(true)}>
                        Подробная статистика
                    </Button>
                </Col>
            </Row>

            <Table 
                columns={columns} 
                dataSource={errorLogs} 
                rowKey="timestamp"
                pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true 
                }}
            />

            {/* Модальное окно с деталями ошибки */}
            <Modal
                title="Детали ошибки"
                visible={!!selectedError}
                onCancel={handleCloseErrorDetails}
                footer={null}
            >
                {selectedError && (
                    <div>
                        <p><strong>Тип:</strong> {selectedError.type}</p>
                        <p><strong>Сообщение:</strong> {selectedError.message}</p>
                        <p><strong>Время:</strong> {new Date(selectedError.timestamp).toLocaleString()}</p>
                        {selectedError.code && (
                            <p><strong>Код:</strong> {selectedError.code}</p>
                        )}
                    </div>
                )}
            </Modal>

            {/* Модальное окно со статистикой */}
            <Modal
                title="Статистика ошибок"
                visible={statsModalVisible}
                onCancel={() => setStatsModalVisible(false)}
                footer={null}
            >
                <Row gutter={16}>
                    {Object.entries(errorStats.byType).map(([type, count]) => (
                        <Col key={type} span={12}>
                            <Statistic 
                                title={`Ошибки ${type}`} 
                                value={count} 
                            />
                        </Col>
                    ))}
                </Row>
            </Modal>
        </Card>
    );
});

export default ErrorMonitoringPanel;

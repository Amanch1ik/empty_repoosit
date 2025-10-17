import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { 
    Card, 
    Table, 
    Progress, 
    Statistic, 
    Row, 
    Col, 
    Button, 
    Modal, 
    Tooltip 
} from 'antd';
import { 
    LineChartOutlined, 
    ClockCircleOutlined, 
    ReloadOutlined 
} from '@ant-design/icons';

import ComponentMonitoringService from '@/services/component-monitoring.service';
import SentryService from '@/services/sentry.service';

const ComponentPerformanceMonitor: React.FC = observer(() => {
    const [componentMetrics, setComponentMetrics] = useState<any>({});
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
    const [performanceModalVisible, setPerformanceModalVisible] = useState(false);

    useEffect(() => {
        // Получение метрик при монтировании
        updateComponentMetrics();
    }, []);

    const updateComponentMetrics = () => {
        const metrics = ComponentMonitoringService.getComponentMetrics();
        setComponentMetrics(metrics);
    };

    const columns = [
        {
            title: 'Компонент',
            dataIndex: 'componentName',
            key: 'componentName',
            render: (name: string) => (
                <Tooltip title="Показать подробности">
                    <Button 
                        type="link" 
                        onClick={() => {
                            setSelectedComponent(name);
                            setPerformanceModalVisible(true);
                        }}
                    >
                        {name}
                    </Button>
                </Tooltip>
            )
        },
        {
            title: 'Количество рендеров',
            dataIndex: 'renderCount',
            key: 'renderCount',
            sorter: (a: any, b: any) => a.renderCount - b.renderCount
        },
        {
            title: 'Среднее время рендера',
            dataIndex: 'averageRenderTime',
            key: 'averageRenderTime',
            render: (time: number) => (
                <Tooltip title={`${time.toFixed(2)} мс`}>
                    <Progress 
                        percent={Math.min(time / 50 * 100, 100)} 
                        status={time > 50 ? 'exception' : 'normal'} 
                    />
                </Tooltip>
            ),
            sorter: (a: any, b: any) => a.averageRenderTime - b.averageRenderTime
        },
        {
            title: 'Изменения пропсов',
            dataIndex: 'propChanges',
            key: 'propChanges',
            sorter: (a: any, b: any) => a.propChanges - b.propChanges
        }
    ];

    const handleResetMetrics = () => {
        ComponentMonitoringService.resetMetrics();
        updateComponentMetrics();

        // Логирование сброса метрик
        SentryService.captureMessage(
            'Сброс метрик производительности компонентов', 
            'info'
        );
    };

    const generatePerformanceReport = () => {
        const report = ComponentMonitoringService.generatePerformanceReport();
        
        // Копирование отчета в буфер обмена
        navigator.clipboard.writeText(report).then(() => {
            SentryService.captureMessage(
                'Сгенерирован отчет о производительности', 
                'info'
            );
        });
    };

    return (
        <Card 
            title="Мониторинг производительности компонентов" 
            extra={
                <div>
                    <Tooltip title="Сгенерировать отчет">
                        <Button 
                            icon={<LineChartOutlined />} 
                            onClick={generatePerformanceReport}
                            style={{ marginRight: 10 }}
                        />
                    </Tooltip>
                    <Tooltip title="Сбросить метрики">
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleResetMetrics} 
                        />
                    </Tooltip>
                </div>
            }
        >
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}>
                    <Statistic 
                        title="Всего компонентов" 
                        value={Object.keys(componentMetrics).length} 
                        prefix={<ClockCircleOutlined />} 
                    />
                </Col>
                <Col span={8}>
                    <Statistic 
                        title="Средняя длительность рендера" 
                        value={
                            Object.values(componentMetrics).reduce(
                                (sum: number, metric: any) => sum + metric.averageRenderTime, 
                                0
                            ) / Object.keys(componentMetrics).length || 0
                        } 
                        suffix="мс" 
                    />
                </Col>
                <Col span={8}>
                    <Statistic 
                        title="Общее количество рендеров" 
                        value={
                            Object.values(componentMetrics).reduce(
                                (sum: number, metric: any) => sum + metric.renderCount, 
                                0
                            )
                        } 
                    />
                </Col>
            </Row>

            <Table 
                columns={columns} 
                dataSource={Object.entries(componentMetrics).map(
                    ([componentName, metrics]) => ({
                        componentName,
                        ...metrics
                    })
                )} 
                rowKey="componentName" 
            />

            <Modal
                title={`Детали компонента: ${selectedComponent}`}
                visible={performanceModalVisible}
                onCancel={() => setPerformanceModalVisible(false)}
                footer={null}
            >
                {selectedComponent && componentMetrics[selectedComponent] && (
                    <div>
                        <p>
                            <strong>Количество рендеров:</strong> 
                            {componentMetrics[selectedComponent].renderCount}
                        </p>
                        <p>
                            <strong>Последнее время рендера:</strong> 
                            {componentMetrics[selectedComponent].lastRenderDuration.toFixed(2)} мс
                        </p>
                        <p>
                            <strong>Среднее время рендера:</strong> 
                            {componentMetrics[selectedComponent].averageRenderTime.toFixed(2)} мс
                        </p>
                        <p>
                            <strong>Изменений пропсов:</strong> 
                            {componentMetrics[selectedComponent].propChanges}
                        </p>
                    </div>
                )}
            </Modal>
        </Card>
    );
});

export default ComponentPerformanceMonitor;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';

const AuditScoreBarChart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState(null);
  const [allAudits, setAllAudits] = useState([]);

  useEffect(() => {
    if (location.state) {
      const { auditData: selectedAudit, allAudits: audits } = location.state;
      setAuditData(selectedAudit);
      setAllAudits(audits || []);
    }
  }, [location.state]);

  // Prepare chart data from auditData
  const prepareChartData = () => {
    if (!auditData) return [];

    return [
      { category: 'Child Labour', score: auditData.childLabourScore || 0 },
      { category: 'Bonded / Forced Labour', score: auditData.forcedLabourScore || 0 },
      { category: 'Freedom of Association', score: auditData.freedomOfAssociationScore || 0 },
      { category: 'Discrimination', score: auditData.discriminationScore || 0 },
      { category: 'Disciplinary Practices', score: auditData.disciplinaryPracticesScore || 0 },
      { category: 'Management System', score: auditData.mgmtSystemScore || 0 },
      { category: 'Business Ethics', score: auditData.businessEthicsScore || 0 },
      { category: 'Environmental Management', score: auditData.envMgmtScore || 0 },
      { category: 'Health & Safety', score: auditData.healthSafetyScore || 0 },
      { category: 'Working Hours', score: auditData.workingHoursScore || 0 },
      { category: 'Accident Insurance', score: auditData.accidentInsuranceScore || 0 },
      { category: 'Factory Licenses & Permits', score: auditData.licensesPermitsScore || 0 },
      { category: 'Housekeeping & Training', score: auditData.housekeepingScore || 0 },
      { category: 'Worker Recruitment Scheme', score: auditData.recruitmentScore || 0 },
      { category: 'Accommodation', score: auditData.accommodationScore || 0 }
    ];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          border: '1px solid #3b82f6'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0 }}>Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!auditData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit data...</p>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const overallScore = auditData.currentScore || 0;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Printable Content - A4 Landscape Format */}
      <div 
        id="audit-chart-to-print" 
        className="bg-white mx-auto d-print-block" 
        style={{ 
          width: '297mm',
          minHeight: '210mm',
          padding: '10mm'  // Reduced padding to give more space to chart
        }}
      >
        {/* Header - More compact */}
        <div className="text-center mb-4 border-b pb-2">
          <h1 className="text-xl font-bold text-gray-800">AUDIT SCORE BAR CHART REPORT</h1>
          <p className="text-gray-600 text-sm mt-1">Visual Score Analysis</p>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Audit ID: {auditData.auditId || 'AUD-CHART'}</div>
            <div>Overall Score: <span className="font-bold text-blue-600">{overallScore}%</span></div>
          </div>
        </div>

        {/* Audit Information - Very compact */}
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="border p-1 rounded">
              <div className="text-gray-600">Supplier</div>
              <div className="font-medium truncate">{auditData.supplierName}</div>
            </div>
            <div className="border p-1 rounded">
              <div className="text-gray-600">Type</div>
              <div className="font-medium">{auditData.supplierType}</div>
            </div>
            <div className="border p-1 rounded">
              <div className="text-gray-600">Date</div>
              <div className="font-medium">{auditData.auditDate}</div>
            </div>
            <div className="border p-1 rounded">
              <div className="text-gray-600">Auditor</div>
              <div className="font-medium">{auditData.auditorName}</div>
            </div>
          </div>
        </div>

        {/* Chart Section - MAXIMUM height */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">AUDIT CATEGORY SCORES</h2>
          <div className="w-full h-[450px]">  {/* SIGNIFICANTLY increased height */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 60, bottom: 120 }}  // Increased bottom margin for labels
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(0, 0, 0, 0.05)" 
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}  // Increased height for labels
                  interval={0}
                  tick={{ fill: '#374151', fontSize: 11 }}  // Slightly larger font
                  tickMargin={8}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#374151', fontSize: 11 }}  // Slightly larger font
                  width={60}
                >
                  <Label
                    value="Score (%)"
                    angle={-90}
                    position="insideLeft"
                    offset={-20}
                    style={{ 
                      textAnchor: 'middle', 
                      fill: '#374151',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="score"
                  fill="#3b82f6"
                  stroke="#1d4ed8"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}  // Slightly larger radius
                  label={{
                    position: 'top',
                    formatter: (value) => `${value}%`,
                    fill: '#1e40af',
                    fontSize: 10,  // Slightly larger label font
                    fontWeight: 'bold'
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer - Very compact */}
        <div className="mt-4 pt-2 border-t text-center text-xs text-gray-500">
          <p>Computer generated chart report • Asian Fabric X Audit System</p>
          <p>Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Action Buttons - Hidden on Print */}
      <div className="d-print-none mt-6 flex justify-center gap-4">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <IconPrinter className="w-4 h-4" />
          Print Chart
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 297mm !important;
            height: 210mm !important;
          }

          body * {
            visibility: hidden;
          }

          #audit-chart-to-print,
          #audit-chart-to-print * {
            visibility: visible;
          }

          #audit-chart-to-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            min-height: 210mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }

          .d-print-none {
            display: none !important;
          }

          .d-print-block {
            display: block !important;
          }

          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          /* Ensure chart elements are visible */
          .recharts-wrapper,
          .recharts-surface,
          .recharts-cartesian-grid,
          .recharts-bar-rectangle,
          .recharts-x-axis,
          .recharts-y-axis,
          .recharts-bar,
          .recharts-label {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditScoreBarChart;
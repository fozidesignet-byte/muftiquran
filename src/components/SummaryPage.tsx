import { useMemo } from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileOutput } from "lucide-react";

interface SummaryPageProps {
  editedCells: boolean[];
  reEditedCells: boolean[];
  editedPaidCells: boolean[];
  capturedCells: boolean[];
  reCapturedCells: boolean[];
  paidCells: boolean[];
  exportCount: number;
}

const SummaryPage = ({
  editedCells,
  reEditedCells,
  editedPaidCells,
  capturedCells,
  reCapturedCells,
  paidCells,
  exportCount,
}: SummaryPageProps) => {
  const stats = useMemo(() => {
    const totalCells = 180;
    
    // Edited stats
    const totalEdited = editedCells.filter(Boolean).length;
    const reEdited = reEditedCells.filter(Boolean).length;
    const editedPaid = editedPaidCells.filter(Boolean).length;
    
    // Captured stats
    const totalCaptured = capturedCells.filter(Boolean).length;
    const reCaptured = reCapturedCells.filter(Boolean).length;
    const capturedPaid = paidCells.filter(Boolean).length;
    
    return {
      totalCells,
      totalEdited,
      reEdited,
      editedPaid,
      totalCaptured,
      reCaptured,
      capturedPaid,
      remainingEdit: totalCells - totalEdited,
      remainingCapture: totalCells - totalCaptured,
    };
  }, [editedCells, reEditedCells, editedPaidCells, capturedCells, reCapturedCells, paidCells]);

  const totalSuras = 114;

  // Circular progress data
  const editedProgressData = [
    { name: "progress", value: (stats.totalEdited / stats.totalCells) * 100, fill: "hsl(43 67% 60%)" },
  ];

  const capturedProgressData = [
    { name: "progress", value: (stats.totalCaptured / stats.totalCells) * 100, fill: "hsl(181 95% 27%)" },
  ];

  const editedPaidProgressData = [
    { name: "progress", value: (stats.editedPaid / stats.totalCells) * 100, fill: "hsl(149 42% 53%)" },
  ];

  const capturedPaidProgressData = [
    { name: "progress", value: (stats.capturedPaid / stats.totalCells) * 100, fill: "hsl(149 42% 53%)" },
  ];

  const reEditProgressData = [
    { name: "progress", value: (stats.reEdited / stats.totalCells) * 100, fill: "hsl(0 40% 46%)" },
  ];

  const reCapturedProgressData = [
    { name: "progress", value: (stats.reCaptured / stats.totalCells) * 100, fill: "hsl(0 40% 46%)" },
  ];

  const exportedProgressData = [
    { name: "progress", value: (exportCount / totalSuras) * 100, fill: "hsl(199 89% 48%)" },
  ];

  const CircularProgress = ({ data, value, total, label, sublabel }: { 
    data: any[], 
    value: number, 
    total: number, 
    label: string,
    sublabel?: string 
  }) => (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-20 md:h-24 md:w-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={8}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "hsl(var(--muted))" }}
              dataKey="value"
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg md:text-xl font-bold">{value}</span>
          <span className="text-[9px] text-muted-foreground">/{total}</span>
        </div>
      </div>
      <p className="text-[10px] md:text-xs font-medium mt-1 text-center">{label}</p>
      {sublabel && <p className="text-[9px] text-muted-foreground">{sublabel}</p>}
    </div>
  );

  const SimpleCircle = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div className="flex flex-col items-center">
      <div 
        className="h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <span className="text-lg md:text-xl font-bold" style={{ color }}>{value}</span>
      </div>
      <p className="text-[10px] md:text-xs font-medium mt-1 text-center">{label}</p>
    </div>
  );

  return (
    <div className="max-w-full mx-auto px-2 pb-4 space-y-4">
      {/* Summary Header */}
      <div className="text-center py-3">
        <h2 className="text-xl font-bold text-foreground mb-1">Progress Summary</h2>
        <p className="text-sm text-muted-foreground">Overview of video editing and cassette capture progress</p>
      </div>


      {/* Row 1: Edited Videos Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(43 67% 60%)" }} />
            ኤዲት የተሰሩ (Edited Videos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <CircularProgress
              data={editedProgressData}
              value={stats.totalEdited}
              total={stats.totalCells}
              label="Total Edited"
            />
            <SimpleCircle
              value={stats.reEdited}
              label="Re-Edit"
              color="hsl(0 40% 46%)"
            />
            <CircularProgress
              data={editedPaidProgressData}
              value={stats.editedPaid}
              total={stats.totalCells}
              label="Paid (Edit)"
            />
            <CircularProgress
              data={exportedProgressData}
              value={exportCount}
              total={totalSuras}
              label="Exported Suras"
            />
          </div>
        </CardContent>
      </Card>

      {/* Row 2: Captured Cassettes Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(181 95% 27%)" }} />
            ካፕቸር የተደረጉ (Captured Cassettes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <CircularProgress
              data={capturedProgressData}
              value={stats.totalCaptured}
              total={stats.totalCells}
              label="Total Captured"
            />
            <SimpleCircle
              value={stats.reCaptured}
              label="Re-Captured"
              color="hsl(0 40% 46%)"
            />
            <CircularProgress
              data={capturedPaidProgressData}
              value={stats.capturedPaid}
              total={stats.totalCells}
              label="Paid (Capture)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Edited Videos Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Edited Videos</span>
              <span>{stats.totalEdited}/{stats.totalCells} ({Math.round(stats.totalEdited / stats.totalCells * 100)}%)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(stats.totalEdited / stats.totalCells) * 100}%`,
                  backgroundColor: "hsl(43 67% 60%)"
                }}
              />
            </div>
          </div>

          {/* Captured Cassettes Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Captured Cassettes</span>
              <span>{stats.totalCaptured}/{stats.totalCells} ({Math.round(stats.totalCaptured / stats.totalCells * 100)}%)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(stats.totalCaptured / stats.totalCells) * 100}%`,
                  backgroundColor: "hsl(181 95% 27%)"
                }}
              />
            </div>
          </div>

          {/* Paid for Edited Videos */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Paid (Edited Videos)</span>
              <span>{stats.editedPaid}/{stats.totalCells} ({Math.round(stats.editedPaid / stats.totalCells * 100)}%)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(stats.editedPaid / stats.totalCells) * 100}%`,
                  backgroundColor: "hsl(149 42% 53%)"
                }}
              />
            </div>
          </div>

          {/* Paid for Captured Cassettes */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Paid (Captured Cassettes)</span>
              <span>{stats.capturedPaid}/{stats.totalCells} ({Math.round(stats.capturedPaid / stats.totalCells * 100)}%)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(stats.capturedPaid / stats.totalCells) * 100}%`,
                  backgroundColor: "hsl(149 42% 53%)"
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryPage;

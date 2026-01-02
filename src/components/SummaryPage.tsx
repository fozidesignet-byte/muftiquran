import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SummaryPageProps {
  editedCells: boolean[];
  reEditedCells: boolean[];
  editedPaidCells: boolean[];
  capturedCells: boolean[];
  reCapturedCells: boolean[];
  paidCells: boolean[];
}

const SummaryPage = ({
  editedCells,
  reEditedCells,
  editedPaidCells,
  capturedCells,
  reCapturedCells,
  paidCells,
}: SummaryPageProps) => {
  const stats = useMemo(() => {
    const totalCells = 180;
    
    // Edited stats
    const totalEdited = editedCells.filter(Boolean).length;
    const reEdited = reEditedCells.filter(Boolean).length;
    const editedPaid = editedPaidCells.filter(Boolean).length;
    const roughCut = totalEdited - reEdited; // Videos that are edited but not re-edited (rough)
    const finalized = reEdited; // Re-edited videos are finalized
    const exported = editedPaid; // Paid videos are exported
    
    // Captured stats
    const totalCaptured = capturedCells.filter(Boolean).length;
    const reCaptured = reCapturedCells.filter(Boolean).length;
    const capturedPaid = paidCells.filter(Boolean).length;
    const failedCassette = reCaptured; // Re-captured means it failed first time
    const successfulCapture = totalCaptured - reCaptured;
    
    return {
      totalCells,
      totalEdited,
      reEdited,
      editedPaid,
      roughCut,
      finalized,
      exported,
      totalCaptured,
      reCaptured,
      capturedPaid,
      failedCassette,
      successfulCapture,
      remainingEdit: totalCells - totalEdited,
      remainingCapture: totalCells - totalCaptured,
    };
  }, [editedCells, reEditedCells, editedPaidCells, capturedCells, reCapturedCells, paidCells]);

  // Chart data for Edited Videos
  const editedPieData = [
    { name: "Rough Cut", value: stats.roughCut, fill: "hsl(43 67% 60%)" },
    { name: "Finalized", value: stats.finalized, fill: "hsl(0 40% 46%)" },
    { name: "Remaining", value: stats.remainingEdit, fill: "hsl(220 10% 80%)" },
  ];

  const editedBarData = [
    { name: "Total Edited", value: stats.totalEdited, fill: "hsl(43 67% 60%)" },
    { name: "Re-Edit", value: stats.reEdited, fill: "hsl(0 40% 46%)" },
    { name: "Paid/Exported", value: stats.editedPaid, fill: "hsl(149 42% 53%)" },
  ];

  // Chart data for Captured Cassettes
  const capturedPieData = [
    { name: "Successful", value: stats.successfulCapture, fill: "hsl(181 95% 27%)" },
    { name: "Re-captured", value: stats.reCaptured, fill: "hsl(0 40% 46%)" },
    { name: "Remaining", value: stats.remainingCapture, fill: "hsl(220 10% 80%)" },
  ];

  const capturedBarData = [
    { name: "Total Captured", value: stats.totalCaptured, fill: "hsl(181 95% 27%)" },
    { name: "Failed/Re-captured", value: stats.reCaptured, fill: "hsl(0 40% 46%)" },
    { name: "Paid", value: stats.capturedPaid, fill: "hsl(149 42% 53%)" },
  ];

  const chartConfig = {
    value: { label: "Count" },
  };

  return (
    <div className="max-w-full mx-auto px-2 pb-4 space-y-6">
      {/* Summary Header */}
      <div className="text-center py-4">
        <h2 className="text-xl font-bold text-foreground mb-1">Progress Summary</h2>
        <p className="text-sm text-muted-foreground">Overview of video editing and cassette capture progress</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4" style={{ borderLeftColor: "hsl(43 67% 60%)" }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: "hsl(43 67% 60%)" }}>{stats.totalEdited}</div>
            <div className="text-xs text-muted-foreground">Total Edited</div>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: "hsl(181 95% 27%)" }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: "hsl(181 95% 27%)" }}>{stats.totalCaptured}</div>
            <div className="text-xs text-muted-foreground">Total Captured</div>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: "hsl(149 42% 53%)" }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: "hsl(149 42% 53%)" }}>{stats.editedPaid + stats.capturedPaid}</div>
            <div className="text-xs text-muted-foreground">Total Paid</div>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: "hsl(0 40% 46%)" }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: "hsl(0 40% 46%)" }}>{stats.reEdited + stats.reCaptured}</div>
            <div className="text-xs text-muted-foreground">Total Re-work</div>
          </CardContent>
        </Card>
      </div>

      {/* Edited Videos Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(43 67% 60%)" }} />
            ኤዲት የተሰሩ (Edited Videos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={editedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    labelLine={false}
                  >
                    {editedPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Bar Chart */}
            <div className="h-[200px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={editedBarData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={4}>
                    {editedBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold" style={{ color: "hsl(43 67% 60%)" }}>{stats.roughCut}</div>
              <div className="text-xs text-muted-foreground">Rough Cut</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold" style={{ color: "hsl(0 40% 46%)" }}>{stats.finalized}</div>
              <div className="text-xs text-muted-foreground">Finalized</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold" style={{ color: "hsl(149 42% 53%)" }}>{stats.exported}</div>
              <div className="text-xs text-muted-foreground">Exported/Paid</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Captured Cassettes Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(181 95% 27%)" }} />
            ካፕቸር የተደረጉ (Captured Cassettes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={capturedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    labelLine={false}
                  >
                    {capturedPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Bar Chart */}
            <div className="h-[200px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={capturedBarData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={4}>
                    {capturedBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold" style={{ color: "hsl(181 95% 27%)" }}>{stats.successfulCapture}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold" style={{ color: "hsl(0 40% 46%)" }}>{stats.failedCassette}</div>
              <div className="text-xs text-muted-foreground">Failed/Re-captured</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold" style={{ color: "hsl(149 42% 53%)" }}>{stats.capturedPaid}</div>
              <div className="text-xs text-muted-foreground">Paid</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Paid (All)</span>
              <span>{stats.editedPaid + stats.capturedPaid}/{stats.totalCells * 2}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${((stats.editedPaid + stats.capturedPaid) / (stats.totalCells * 2)) * 100}%`,
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

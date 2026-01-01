export interface TrackerExportData {
  editedCells: boolean[];
  capturedCells: boolean[];
  paidCells: boolean[];
}

export const exportToCSV = (data: TrackerExportData) => {
  const headers = ["Number", "Edited", "Captured", "Paid"];
  const rows: string[][] = [];

  for (let i = 0; i < 180; i++) {
    rows.push([
      String(i + 1),
      data.editedCells[i] ? "Yes" : "No",
      data.capturedCells[i] ? "Yes" : "No",
      data.paidCells[i] ? "Yes" : "No",
    ]);
  }

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Add summary row
  const editedCount = data.editedCells.filter(Boolean).length;
  const capturedCount = data.capturedCells.filter(Boolean).length;
  const paidCount = data.paidCells.filter(Boolean).length;

  const summaryCSV = `${csvContent}\n\nSummary\nTotal Edited,${editedCount}\nTotal Captured,${capturedCount}\nTotal Paid,${paidCount}`;

  downloadFile(summaryCSV, "video-tracker-export.csv", "text/csv");
};

export const exportToExcel = (data: TrackerExportData) => {
  // Create a simple Excel-compatible XML format
  const editedCount = data.editedCells.filter(Boolean).length;
  const capturedCount = data.capturedCells.filter(Boolean).length;
  const paidCount = data.paidCells.filter(Boolean).length;

  let xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Tracker Data">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Number</Data></Cell>
        <Cell><Data ss:Type="String">Edited</Data></Cell>
        <Cell><Data ss:Type="String">Captured</Data></Cell>
        <Cell><Data ss:Type="String">Paid</Data></Cell>
      </Row>`;

  for (let i = 0; i < 180; i++) {
    xmlContent += `
      <Row>
        <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell><Data ss:Type="String">${data.editedCells[i] ? "Yes" : "No"}</Data></Cell>
        <Cell><Data ss:Type="String">${data.capturedCells[i] ? "Yes" : "No"}</Data></Cell>
        <Cell><Data ss:Type="String">${data.paidCells[i] ? "Yes" : "No"}</Data></Cell>
      </Row>`;
  }

  xmlContent += `
      <Row></Row>
      <Row>
        <Cell><Data ss:Type="String">Summary</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Total Edited</Data></Cell>
        <Cell><Data ss:Type="Number">${editedCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Total Captured</Data></Cell>
        <Cell><Data ss:Type="Number">${capturedCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Total Paid</Data></Cell>
        <Cell><Data ss:Type="Number">${paidCount}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;

  downloadFile(xmlContent, "video-tracker-export.xls", "application/vnd.ms-excel");
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

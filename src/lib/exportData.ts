interface Comment {
  id: string;
  cell_index: number;
  section: string;
  comment: string;
}

export interface TrackerExportData {
  editedCells: boolean[];
  capturedCells: boolean[];
  paidCells: boolean[];
  reEditedCells: boolean[];
  editedPaidCells: boolean[];
  reCapturedCells: boolean[];
  comments: Comment[];
}

export const exportToCSV = (data: TrackerExportData) => {
  const headers = [
    "Number",
    "Edited", "Re-Edit", "Edit Paid", "Edit Comment",
    "Captured", "Re-Capture", "Capt Paid", "Capt Comment"
  ];
  const rows: string[][] = [];

  for (let i = 0; i < 180; i++) {
    const editComment = data.comments.find(c => c.cell_index === i && c.section === "edited")?.comment || "";
    const captComment = data.comments.find(c => c.cell_index === i && c.section === "captured")?.comment || "";
    
    rows.push([
      String(i + 1),
      data.editedCells[i] ? "Yes" : "",
      data.reEditedCells[i] ? "Yes" : "",
      data.editedPaidCells[i] ? "Yes" : "",
      `"${editComment.replace(/"/g, '""')}"`,
      data.capturedCells[i] ? "Yes" : "",
      data.reCapturedCells[i] ? "Yes" : "",
      data.paidCells[i] ? "Yes" : "",
      `"${captComment.replace(/"/g, '""')}"`,
    ]);
  }

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Add summary
  const editedCount = data.editedCells.filter(Boolean).length;
  const reEditedCount = data.reEditedCells.filter(Boolean).length;
  const editedPaidCount = data.editedPaidCells.filter(Boolean).length;
  const capturedCount = data.capturedCells.filter(Boolean).length;
  const reCapturedCount = data.reCapturedCells.filter(Boolean).length;
  const capturedPaidCount = data.paidCells.filter(Boolean).length;

  const summaryCSV = `${csvContent}\n\nSummary\nEdited,${editedCount}\nRe-Edit,${reEditedCount}\nEdit Paid,${editedPaidCount}\nCaptured,${capturedCount}\nRe-Capture,${reCapturedCount}\nCapt Paid,${capturedPaidCount}`;

  downloadFile(summaryCSV, "video-tracker-export.csv", "text/csv");
};

export const exportToExcel = (data: TrackerExportData) => {
  const editedCount = data.editedCells.filter(Boolean).length;
  const reEditedCount = data.reEditedCells.filter(Boolean).length;
  const editedPaidCount = data.editedPaidCells.filter(Boolean).length;
  const capturedCount = data.capturedCells.filter(Boolean).length;
  const reCapturedCount = data.reCapturedCells.filter(Boolean).length;
  const capturedPaidCount = data.paidCells.filter(Boolean).length;

  // Excel XML with styling to match web appearance
  let xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="EditedFilled">
      <Interior ss:Color="#FFD700" ss:Pattern="Solid"/>
      <Font ss:Bold="1"/>
    </Style>
    <Style ss:ID="CapturedFilled">
      <Interior ss:Color="#28A745" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF" ss:Bold="1"/>
    </Style>
    <Style ss:ID="PaidFilled">
      <Interior ss:Color="#DC3545" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF" ss:Bold="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Edited Videos">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Number</Data></Cell>
        <Cell><Data ss:Type="String">Edited</Data></Cell>
        <Cell><Data ss:Type="String">Re-Edit</Data></Cell>
        <Cell><Data ss:Type="String">Paid</Data></Cell>
        <Cell><Data ss:Type="String">Comment</Data></Cell>
      </Row>`;

  for (let i = 0; i < 180; i++) {
    const edited = data.editedCells[i];
    const reEdited = data.reEditedCells[i];
    const editedPaid = data.editedPaidCells[i];
    const comment = data.comments.find(c => c.cell_index === i && c.section === "edited")?.comment || "";
    
    xmlContent += `
      <Row>
        <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell${edited ? ' ss:StyleID="EditedFilled"' : ''}><Data ss:Type="String">${edited ? "✓" : ""}</Data></Cell>
        <Cell${reEdited ? ' ss:StyleID="EditedFilled"' : ''}><Data ss:Type="String">${reEdited ? "✓" : ""}</Data></Cell>
        <Cell${editedPaid ? ' ss:StyleID="PaidFilled"' : ''}><Data ss:Type="String">${editedPaid ? "✓" : ""}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(comment)}</Data></Cell>
      </Row>`;
  }

  xmlContent += `
      <Row></Row>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Summary</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Edited</Data></Cell>
        <Cell><Data ss:Type="Number">${editedCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Re-Edit</Data></Cell>
        <Cell><Data ss:Type="Number">${reEditedCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Edit Paid</Data></Cell>
        <Cell><Data ss:Type="Number">${editedPaidCount}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Captured Cassettes">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Number</Data></Cell>
        <Cell><Data ss:Type="String">Captured</Data></Cell>
        <Cell><Data ss:Type="String">Re-Capture</Data></Cell>
        <Cell><Data ss:Type="String">Paid</Data></Cell>
        <Cell><Data ss:Type="String">Comment</Data></Cell>
      </Row>`;

  for (let i = 0; i < 180; i++) {
    const captured = data.capturedCells[i];
    const reCaptured = data.reCapturedCells[i];
    const capturedPaid = data.paidCells[i];
    const comment = data.comments.find(c => c.cell_index === i && c.section === "captured")?.comment || "";
    
    xmlContent += `
      <Row>
        <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell${captured ? ' ss:StyleID="CapturedFilled"' : ''}><Data ss:Type="String">${captured ? "✓" : ""}</Data></Cell>
        <Cell${reCaptured ? ' ss:StyleID="CapturedFilled"' : ''}><Data ss:Type="String">${reCaptured ? "✓" : ""}</Data></Cell>
        <Cell${capturedPaid ? ' ss:StyleID="PaidFilled"' : ''}><Data ss:Type="String">${capturedPaid ? "✓" : ""}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(comment)}</Data></Cell>
      </Row>`;
  }

  xmlContent += `
      <Row></Row>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Summary</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Captured</Data></Cell>
        <Cell><Data ss:Type="Number">${capturedCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Re-Capture</Data></Cell>
        <Cell><Data ss:Type="Number">${reCapturedCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Capt Paid</Data></Cell>
        <Cell><Data ss:Type="Number">${capturedPaidCount}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;

  downloadFile(xmlContent, "video-tracker-export.xls", "application/vnd.ms-excel");
};

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

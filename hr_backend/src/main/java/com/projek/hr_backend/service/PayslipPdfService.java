package com.projek.hr_backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import com.lowagie.text.BaseColor;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.*;
import com.projek.hr_backend.repository.PayslipComponentRepository;
import com.projek.hr_backend.repository.PayslipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PayslipPdfService {

    private final PayslipRepository          payslipRepository;
    private final PayslipComponentRepository payslipComponentRepository;

    // ─── Warna & Font ────────────────────────────────────────────────────────
    private static final Color COLOR_PRIMARY    = new Color(37, 99, 235);   // biru
    private static final Color COLOR_HEADER_BG  = new Color(239, 246, 255); // biru muda
    private static final Color COLOR_EARNING    = new Color(22, 163, 74);   // hijau
    private static final Color COLOR_DEDUCTION  = new Color(220, 38, 38);   // merah
    private static final Color COLOR_LIGHT_GRAY = new Color(248, 250, 252);
    private static final Color COLOR_BORDER     = new Color(203, 213, 225);
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139);

    private static final NumberFormat CURRENCY_FORMAT =
            NumberFormat.getNumberInstance(new Locale("id", "ID"));

    // ─── Public API ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] generatePayslipPdf(Long payslipId) {
        Payslip payslip = payslipRepository.findByIdForExport(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Payslip not found with id: " + payslipId));

        List<PayslipComponent> components =
                payslipComponentRepository.findByPayslipId(payslipId);

        return buildPdf(payslip, components);
    }

    // ─── PDF Builder ─────────────────────────────────────────────────────────

    private byte[] buildPdf(Payslip payslip, List<PayslipComponent> components) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(doc, out);
        doc.open();

        Employee   employee = payslip.getEmployee();
        Department dept     = employee.getDepartment();
        Company    company  = employee.getCompany();
        PayrollPeriod period = payslip.getPayrollPeriod();

        String companyName = company != null ? company.getCompanyName() : "HR Management System";
        String periodLabel = buildPeriodLabel(period.getMonth(), period.getYear());

        // ── Header ──────────────────────────────────────────────────────────
        addHeader(doc, companyName, periodLabel);

        doc.add(Chunk.NEWLINE);

        // ── Employee Info ────────────────────────────────────────────────────
        addEmployeeInfo(doc, employee, dept);

        doc.add(Chunk.NEWLINE);

        // ── Salary Summary ───────────────────────────────────────────────────
        addSalarySummary(doc, payslip);

        doc.add(Chunk.NEWLINE);

        // ── Component Detail Table ───────────────────────────────────────────
        if (!components.isEmpty()) {
            addComponentTable(doc, components);
            doc.add(Chunk.NEWLINE);
        }

        // ── Attendance Summary ───────────────────────────────────────────────
        addAttendanceSummary(doc, payslip);

        doc.add(Chunk.NEWLINE);

        // ── Footer ───────────────────────────────────────────────────────────
        addFooter(doc, payslip, period);

        doc.close();
        return out.toByteArray();
    }

    // ─── Section: Header ─────────────────────────────────────────────────────

    private void addHeader(Document doc, String companyName, String periodLabel) {
        // Background header
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{2f, 1f});

        // Kiri: company name + title
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setBackgroundColor(COLOR_PRIMARY);
        leftCell.setPadding(16);

        Font companyFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE);
        Font titleFont   = new Font(Font.HELVETICA, 20, Font.BOLD, Color.WHITE);
        Font subFont     = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(186, 230, 253));

        leftCell.addElement(new Paragraph(companyName, companyFont));
        leftCell.addElement(new Paragraph("PAYSLIP", titleFont));
        leftCell.addElement(new Paragraph("Period: " + periodLabel, subFont));

        // Kanan: label PAYSLIP besar
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setBackgroundColor(new Color(29, 78, 216));
        rightCell.setPadding(16);
        rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Font bigFont = new Font(Font.HELVETICA, 28, Font.BOLD, new Color(219, 234, 254));
        Paragraph bigLabel = new Paragraph("PAY\nSLIP", bigFont);
        bigLabel.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(bigLabel);

        headerTable.addCell(leftCell);
        headerTable.addCell(rightCell);
        doc.add(headerTable);
    }

    // ─── Section: Employee Info ───────────────────────────────────────────────

    private void addEmployeeInfo(Document doc, Employee employee, Department dept) {
        Font sectionFont = new Font(Font.HELVETICA, 11, Font.BOLD, COLOR_PRIMARY);
        Font labelFont   = new Font(Font.HELVETICA, 9,  Font.NORMAL, COLOR_TEXT_MUTED);
        Font valueFont   = new Font(Font.HELVETICA, 10, Font.BOLD,   Color.BLACK);

        Paragraph sectionTitle = new Paragraph("EMPLOYEE INFORMATION", sectionFont);
        sectionTitle.setSpacingBefore(4);
        sectionTitle.setSpacingAfter(6);
        doc.add(sectionTitle);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 2f, 1.2f, 2f});
        table.setSpacingBefore(4);

        addInfoRow(table, "Employee Name", employee.getName(),
                          "Employee ID",   String.valueOf(employee.getId()),
                          labelFont, valueFont);
        addInfoRow(table, "Position",      employee.getJobTitle(),
                          "Department",    dept != null ? dept.getDepartmentName() : "-",
                          labelFont, valueFont);
        addInfoRow(table, "Work Email",    employee.getWorkEmail(),
                          "Work Phone",    employee.getWorkPhone(),
                          labelFont, valueFont);

        doc.add(table);
    }

    private void addInfoRow(PdfPTable table,
                            String label1, String value1,
                            String label2, String value2,
                            Font labelFont, Font valueFont) {
        table.addCell(infoLabelCell(label1, labelFont));
        table.addCell(infoValueCell(value1, valueFont));
        table.addCell(infoLabelCell(label2, labelFont));
        table.addCell(infoValueCell(value2, valueFont));
    }

    private PdfPCell infoLabelCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setPadding(6);
        cell.setBorderColor(COLOR_BORDER);
        return cell;
    }

    private PdfPCell infoValueCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(Color.WHITE);
        cell.setPadding(6);
        cell.setBorderColor(COLOR_BORDER);
        return cell;
    }

    // ─── Section: Salary Summary ──────────────────────────────────────────────

    private void addSalarySummary(Document doc, Payslip payslip) {
        Font sectionFont = new Font(Font.HELVETICA, 11, Font.BOLD, COLOR_PRIMARY);
        Paragraph title = new Paragraph("SALARY SUMMARY", sectionFont);
        title.setSpacingAfter(6);
        doc.add(title);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.setWidths(new float[]{2f, 1.5f});

        Font labelFont  = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
        Font valueFont  = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
        Font totalLabel = new Font(Font.HELVETICA, 11, Font.BOLD,   Color.WHITE);
        Font totalValue = new Font(Font.HELVETICA, 11, Font.BOLD,   Color.WHITE);

        addSummaryRow(table, "Basic Salary",     formatRp(payslip.getBasicSalary()),    labelFont, valueFont, false);
        addSummaryRow(table, "Overtime Pay",      formatRp(payslip.getOvertimePay()),    labelFont, valueFont, false);
        addSummaryRow(table, "Total Earnings",    formatRp(payslip.getTotalEarning()),   labelFont, valueFont, false);
        addSummaryRow(table, "Total Deductions",  formatRp(payslip.getTotalDeduction()), labelFont, valueFont, false);

        // Net salary row — highlighted
        PdfPCell netLabel = new PdfPCell(new Phrase("NET SALARY", totalLabel));
        netLabel.setBackgroundColor(COLOR_PRIMARY);
        netLabel.setPadding(8);
        netLabel.setBorder(Rectangle.NO_BORDER);

        PdfPCell netValue = new PdfPCell(new Phrase(formatRp(payslip.getNetSalary()), totalValue));
        netValue.setBackgroundColor(COLOR_PRIMARY);
        netValue.setPadding(8);
        netValue.setBorder(Rectangle.NO_BORDER);
        netValue.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(netLabel);
        table.addCell(netValue);

        doc.add(table);
    }

    private void addSummaryRow(PdfPTable table, String label, String value,
                               Font labelFont, Font valueFont, boolean highlight) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(highlight ? COLOR_HEADER_BG : Color.WHITE);
        labelCell.setPadding(7);
        labelCell.setBorderColor(COLOR_BORDER);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBackgroundColor(highlight ? COLOR_HEADER_BG : Color.WHITE);
        valueCell.setPadding(7);
        valueCell.setBorderColor(COLOR_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    // ─── Section: Component Detail Table ─────────────────────────────────────

    private void addComponentTable(Document doc, List<PayslipComponent> components) {
        Font sectionFont  = new Font(Font.HELVETICA, 11, Font.BOLD,   COLOR_PRIMARY);
        Font headerFont   = new Font(Font.HELVETICA, 10, Font.BOLD,   Color.WHITE);
        Font earningFont  = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_EARNING);
        Font deductFont   = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_DEDUCTION);
        Font normalFont   = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);

        Paragraph title = new Paragraph("SALARY COMPONENTS", sectionFont);
        title.setSpacingAfter(6);
        doc.add(title);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 1.2f, 1.5f});

        // Header row
        String[] headers = {"Component Name", "Type", "Amount"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(COLOR_PRIMARY);
            cell.setPadding(8);
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setHorizontalAlignment(h.equals("Amount") ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
            table.addCell(cell);
        }

        // Data rows
        boolean alternate = false;
        for (PayslipComponent comp : components) {
            boolean isEarning = comp.getType() == PayslipComponentType.EARNING;
            Font    typeFont  = isEarning ? earningFont : deductFont;
            Color   rowBg     = alternate ? COLOR_LIGHT_GRAY : Color.WHITE;

            PdfPCell nameCell = new PdfPCell(new Phrase(comp.getComponentName(), normalFont));
            nameCell.setBackgroundColor(rowBg);
            nameCell.setPadding(7);
            nameCell.setBorderColor(COLOR_BORDER);

            PdfPCell typeCell = new PdfPCell(new Phrase(comp.getType().name(), typeFont));
            typeCell.setBackgroundColor(rowBg);
            typeCell.setPadding(7);
            typeCell.setBorderColor(COLOR_BORDER);

            PdfPCell amtCell = new PdfPCell(new Phrase(formatRp(comp.getAmount()), normalFont));
            amtCell.setBackgroundColor(rowBg);
            amtCell.setPadding(7);
            amtCell.setBorderColor(COLOR_BORDER);
            amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            table.addCell(nameCell);
            table.addCell(typeCell);
            table.addCell(amtCell);

            alternate = !alternate;
        }

        doc.add(table);
    }

    // ─── Section: Attendance Summary ─────────────────────────────────────────

    private void addAttendanceSummary(Document doc, Payslip payslip) {
        Font sectionFont = new Font(Font.HELVETICA, 11, Font.BOLD,   COLOR_PRIMARY);
        Font labelFont   = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_TEXT_MUTED);
        Font valueFont   = new Font(Font.HELVETICA, 10, Font.BOLD,   Color.BLACK);

        Paragraph title = new Paragraph("ATTENDANCE SUMMARY", sectionFont);
        title.setSpacingAfter(6);
        doc.add(title);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(80);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);

        String[] labels = {"Absent Days", "Late Days", "Overtime Hours"};
        String[] values = {
            String.valueOf(payslip.getTotalAbsent()),
            String.valueOf(payslip.getTotalLate()),
            String.format("%.1f hrs", payslip.getTotalOvertimeHours())
        };

        for (int i = 0; i < labels.length; i++) {
            PdfPCell lc = new PdfPCell(new Phrase(labels[i], labelFont));
            lc.setBackgroundColor(COLOR_HEADER_BG);
            lc.setPadding(7);
            lc.setBorderColor(COLOR_BORDER);

            PdfPCell vc = new PdfPCell(new Phrase(values[i], valueFont));
            vc.setBackgroundColor(Color.WHITE);
            vc.setPadding(7);
            vc.setBorderColor(COLOR_BORDER);
            vc.setHorizontalAlignment(Element.ALIGN_CENTER);

            table.addCell(lc);
            table.addCell(vc);
        }

        doc.add(table);
    }

    // ─── Section: Footer ─────────────────────────────────────────────────────

    private void addFooter(Document doc, Payslip payslip, PayrollPeriod period) {
        Font footerFont  = new Font(Font.HELVETICA, 9, Font.NORMAL, COLOR_TEXT_MUTED);
        Font statusFont  = new Font(Font.HELVETICA, 9, Font.BOLD,   COLOR_PRIMARY);

        // Garis pemisah menggunakan BaseColor (bukan java.awt.Color)
        BaseColor borderBaseColor = new BaseColor(
                COLOR_BORDER.getRed(), COLOR_BORDER.getGreen(), COLOR_BORDER.getBlue());
        LineSeparator line = new LineSeparator(0.5f, 100, borderBaseColor, Element.ALIGN_CENTER, -2);
        doc.add(new Chunk(line));
        doc.add(Chunk.NEWLINE);

        String generatedAt = payslip.getGeneratedAt() != null
            ? payslip.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"))
            : "-";

        Paragraph footer = new Paragraph();
        footer.add(new Chunk("Generated At: " + generatedAt + "   |   ", footerFont));
        footer.add(new Chunk("Payroll Status: ", footerFont));
        footer.add(new Chunk(period.getStatus().name(), statusFont));
        footer.add(new Chunk("   |   This is a system-generated document.", footerFont));
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }

    // ─── Util ─────────────────────────────────────────────────────────────────

    private String formatRp(java.math.BigDecimal amount) {
        if (amount == null) return "Rp 0";
        return "Rp " + CURRENCY_FORMAT.format(amount);
    }

    private String buildPeriodLabel(int month, int year) {
        return java.time.Month.of(month)
                .getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH) + " " + year;
    }
}

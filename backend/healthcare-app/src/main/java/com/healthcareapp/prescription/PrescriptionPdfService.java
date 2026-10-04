package com.healthcareapp.prescription;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;

import com.healthcareapp.common.exceptions.ResourceNotFoundException;
import com.healthcareapp.prescription.dto.PrescriptionListResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

// §22: "The PDF should clearly contain: Patient name, Doctor name, Medical
// registration number, Hospital, Date, Diagnosis, Medicines, Instructions,
// Follow-up, Prescription ID." Also: "Clearly label the document as a
// digital prescription/medical record."
//
// Reuses PrescriptionService.getPrescriptionById() — the exact same
// assembled data used for the JSON detail view — so the PDF and the
// on-screen prescription can never drift out of sync with each other;
// there's only one place that assembles "everything about this prescription."
@Service
@RequiredArgsConstructor
public class PrescriptionPdfService {

    private final PrescriptionService prescriptionService;
    private final com.healthcareapp.patient.PatientProfileRepository patientProfileRepository;
    private final PrescriptionRepository prescriptionRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generatePrescriptionPdf(Long prescriptionId) {

        PrescriptionListResponse data = prescriptionService.getPrescriptionById(prescriptionId);

        // Patient name isn't on PrescriptionListResponse (it wasn't needed
        // for the on-screen list, since that's always viewed BY the
        // patient themselves) — fetched separately here since the PDF
        // explicitly needs it per §22.
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
        String patientName = prescription.getConsultation().getAppointment()
                .getPatientProfile().getUser().getFullName();

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
            Font smallGrayFont = new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY);

            // Header — clearly labels this as a digital prescription (§22's
            // explicit requirement)
            Paragraph title = new Paragraph("DIGITAL PRESCRIPTION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Healthcare Appointment & Medical Record System", smallGrayFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            document.add(new LineSeparator());
            document.add(Chunk.NEWLINE);

            // Patient / Doctor / Hospital / Date block
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);

            addInfoRow(infoTable, "Prescription ID:", "RX-" + data.getPrescriptionId(), labelFont, normalFont);
            addInfoRow(infoTable, "Date:", data.getPrescriptionDate().format(DATE_FORMAT), labelFont, normalFont);
            addInfoRow(infoTable, "Patient Name:", patientName, labelFont, normalFont);
            addInfoRow(infoTable, "Doctor:", "Dr. " + data.getDoctorName(), labelFont, normalFont);
            addInfoRow(infoTable, "Medical Reg. No.:", data.getMedicalRegistrationNumber(), labelFont, normalFont);
            addInfoRow(infoTable, "Hospital:", data.getHospitalName(), labelFont, normalFont);

            document.add(infoTable);

            // Diagnosis
            if (data.getDiagnosisName() != null) {
                Paragraph diagHeader = new Paragraph("Diagnosis", labelFont);
                diagHeader.setSpacingBefore(10);
                document.add(diagHeader);
                document.add(new Paragraph(data.getDiagnosisName(), normalFont));
            }

            // Medicines table
            Paragraph medHeader = new Paragraph("Prescribed Medicines", labelFont);
            medHeader.setSpacingBefore(15);
            medHeader.setSpacingAfter(8);
            document.add(medHeader);

            PdfPTable medTable = new PdfPTable(5);
            medTable.setWidthPercentage(100);
            medTable.setWidths(new float[]{3, 1.5f, 2, 1.5f, 2.5f});

            addHeaderCell(medTable, "Medicine", labelFont);
            addHeaderCell(medTable, "Dosage", labelFont);
            addHeaderCell(medTable, "Frequency", labelFont);
            addHeaderCell(medTable, "Duration", labelFont);
            addHeaderCell(medTable, "Instructions", labelFont);

            for (PrescriptionListResponse.MedicineItem item : data.getMedicines()) {
                medTable.addCell(new PdfPCell(new Phrase(item.getMedicineName(), normalFont)));
                medTable.addCell(new PdfPCell(new Phrase(nullToDash(item.getDosage()), normalFont)));
                medTable.addCell(new PdfPCell(new Phrase(nullToDash(item.getFrequency()), normalFont)));
                medTable.addCell(new PdfPCell(new Phrase(nullToDash(item.getDuration()), normalFont)));
                medTable.addCell(new PdfPCell(new Phrase(nullToDash(item.getInstructions()), normalFont)));
            }

            document.add(medTable);

            // Follow-up
            if (data.getFollowUpInstructions() != null && !data.getFollowUpInstructions().isBlank()) {
                Paragraph followUpHeader = new Paragraph("Follow-up Instructions", labelFont);
                followUpHeader.setSpacingBefore(15);
                document.add(followUpHeader);
                document.add(new Paragraph(data.getFollowUpInstructions(), normalFont));
            }

            // Footer disclaimer
            Paragraph footer = new Paragraph(
                    "\n\nThis is a digitally generated prescription and does not require a physical signature.",
                    smallGrayFont);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
            return outputStream.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate prescription PDF", e);
        }
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value == null ? "-" : value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(5);
        table.addCell(valueCell);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(230, 230, 230));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private String nullToDash(String value) {
        return (value == null || value.isBlank()) ? "-" : value;
    }
}
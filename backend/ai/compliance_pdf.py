import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)


def generate_application_number():
    return "AP-VAASTU-" + datetime.now().strftime("%Y%m%d%H%M%S")


def money(value):
    return f"Rs. {value:,.0f}"


def build_rule_rows(auto_dcr_result):
    rows = []

    measurements = auto_dcr_result.get("measurements", {})
    rules = auto_dcr_result.get("rules", {})
    violations = auto_dcr_result.get("violations", [])

    violation_map = {
        item["rule"]: item for item in violations
    }

    rule_definitions = [
        {
            "rule": "Front Setback",
            "submitted": measurements.get("front_setback_m", 0),
            "required": rules.get("min_front_setback_m", 3.0),
            "unit": "meters",
            "reference": "Table 17, G.O.Ms.No.119",
        },
        {
            "rule": "Rear Setback",
            "submitted": measurements.get("rear_setback_m", 0),
            "required": rules.get("min_rear_setback_m", 2.0),
            "unit": "meters",
            "reference": "Table 17, G.O.Ms.No.119",
        },
        {
            "rule": "Side 1 Setback",
            "submitted": measurements.get("left_setback_m", 0),
            "required": rules.get("min_side_setback_m", 1.5),
            "unit": "meters",
            "reference": "Table 17, G.O.Ms.No.119",
        },
        {
            "rule": "Side 2 Setback",
            "submitted": measurements.get("right_setback_m", 0),
            "required": rules.get("min_side_setback_m", 1.5),
            "unit": "meters",
            "reference": "Table 17, G.O.Ms.No.119",
        },
        {
            "rule": "Road Width",
            "submitted": measurements.get("road_width_m", 0),
            "required": rules.get("min_road_width_m", 9.0),
            "unit": "meters",
            "reference": "Road Width Rules, G.O.Ms.No.119",
        },
        {
            "rule": "Floor Area Ratio",
            "submitted": measurements.get("fsi", 0),
            "required": rules.get("max_fsi", 1.5),
            "unit": "ratio",
            "reference": "Chapter VII, G.O.Ms.No.119",
        },
    ]

    for item in rule_definitions:
        rule_name = item["rule"]
        submitted = item["submitted"]
        required = item["required"]

        is_failed = rule_name in violation_map

        if is_failed:
            message = violation_map[rule_name]["message"]
            status_icon = "FAILED"
        else:
            if rule_name == "Floor Area Ratio":
                message = f"FAR {submitted} is within permissible limit of {required}"
            else:
                message = f"{rule_name} {submitted}m meets requirement of {required}m"
            status_icon = "PASSED"

        rows.append([
            status_icon,
            Paragraph(f"<b>{rule_name}</b><br/>{message}", get_table_style()),
            f"{submitted} {item['unit']}",
            f"{required} {item['unit']}",
            item["reference"],
        ])

    return rows


def get_table_style():
    styles = getSampleStyleSheet()
    return ParagraphStyle(
        "TableText",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#111827"),
    )


def generate_compliance_pdf(
    output_path,
    auto_dcr_result,
    application_data=None
):
    application_data = application_data or {}

    app_no = application_data.get("applicationNo") or generate_application_number()

    is_compliant = auto_dcr_result.get("isCompliant", False)
    status_text = "Fully Compliant" if is_compliant else "Non-Compliant"

    measurements = auto_dcr_result.get("measurements", {})
    violations = auto_dcr_result.get("violations", [])

    passed_count = 6 - len(violations)
    violation_count = len(violations)
    warning_count = 0

    plot_area = measurements.get("plot_area_sq_m", 300)
    builtup_area = measurements.get("builtup_area_sq_m", 300)

    permit_fee = builtup_area * 25
    development_charge = builtup_area * 150
    impact_fee = builtup_area * 50
    total_fee = permit_fee + development_charge + impact_fee

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8,
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=8,
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    status_color = colors.HexColor("#16a34a") if is_compliant else colors.HexColor("#dc2626")
    status_bg = colors.HexColor("#dcfce7") if is_compliant else colors.HexColor("#fee2e2")

    story = []

    # Header
    story.append(Paragraph("Applications / " + app_no, normal_style))
    story.append(Paragraph(app_no, title_style))

    status_table = Table(
        [[
            Paragraph("<b>Compliance Results</b>", normal_style),
            Paragraph(f"<b>{status_text}</b>", normal_style),
        ]],
        colWidths=[120 * mm, 45 * mm],
    )

    status_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#e5e7eb")),
        ("TEXTCOLOR", (1, 0), (1, 0), status_color),
        ("BACKGROUND", (1, 0), (1, 0), status_bg),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))

    story.append(status_table)
    story.append(Spacer(1, 8))

    # Rule Table
    table_data = [[
        "STATUS",
        "RULE",
        "SUBMITTED",
        "REQUIRED",
        "REFERENCE",
    ]]

    table_data.extend(build_rule_rows(auto_dcr_result))

    compliance_table = Table(
        table_data,
        colWidths=[20 * mm, 65 * mm, 30 * mm, 30 * mm, 35 * mm],
        repeatRows=1,
    )

    compliance_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))

    for row_index in range(1, len(table_data)):
        status = table_data[row_index][0]

        if status == "PASSED":
            compliance_table.setStyle(TableStyle([
                ("TEXTCOLOR", (0, row_index), (0, row_index), colors.HexColor("#16a34a")),
            ]))
        else:
            compliance_table.setStyle(TableStyle([
                ("TEXTCOLOR", (0, row_index), (0, row_index), colors.HexColor("#dc2626")),
            ]))

    story.append(compliance_table)

    # Building Details
    story.append(Paragraph("Building Details", section_style))

    building_rows = [
        ["BUILDING TYPE", application_data.get("buildingType", "Residential")],
        ["PLOT AREA", f"{plot_area} sq.m"],
        ["NUMBER OF FLOORS", str(application_data.get("floors", 2))],
        ["BUILDING HEIGHT", f"{application_data.get('height', 7.0)} m"],
        ["TOTAL BUILT-UP AREA", f"{builtup_area} sq.m"],
        ["BUILDING CLASSIFICATION", application_data.get("classification", "Non-High-Rise")],
    ]

    building_table = Table(building_rows, colWidths=[70 * mm, 90 * mm])

    building_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#475569")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))

    story.append(building_table)

    # Setbacks
    story.append(Paragraph("Setbacks Provided", section_style))

    setback_rows = [
        ["FRONT SETBACK", f"{measurements.get('front_setback_m', 0)} m"],
        ["REAR SETBACK", f"{measurements.get('rear_setback_m', 0)} m"],
        ["SIDE 1 SETBACK", f"{measurements.get('left_setback_m', 0)} m"],
        ["SIDE 2 SETBACK", f"{measurements.get('right_setback_m', 0)} m"],
    ]

    setback_table = Table(setback_rows, colWidths=[70 * mm, 90 * mm])

    setback_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))

    story.append(setback_table)

    story.append(PageBreak())

    # Summary
    story.append(Paragraph(status_text, title_style))

    summary_rows = [
        ["PASSED", str(passed_count)],
        ["WARNINGS", str(warning_count)],
        ["VIOLATIONS", str(violation_count)],
    ]

    summary_table = Table(summary_rows, colWidths=[70 * mm, 40 * mm])

    summary_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#e5e7eb")),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 12),
        ("TEXTCOLOR", (0, 0), (0, 0), colors.HexColor("#16a34a")),
        ("TEXTCOLOR", (0, 1), (0, 1), colors.HexColor("#f59e0b")),
        ("TEXTCOLOR", (0, 2), (0, 2), colors.HexColor("#dc2626")),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))

    story.append(summary_table)

    # Fee Estimate
    story.append(Paragraph("Fee Estimate", section_style))

    fee_rows = [
        ["Permit Fee", money(permit_fee)],
        ["Development Charge", money(development_charge)],
        ["Impact Fee", money(impact_fee)],
        ["Total Estimated", money(total_fee)],
    ]

    fee_table = Table(fee_rows, colWidths=[70 * mm, 60 * mm])

    fee_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#eff6ff")),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#1d4ed8")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))

    story.append(fee_table)

    # SCS 2025
    story.append(Paragraph("SCS 2025", section_style))

    if is_compliant:
        scs_message = "Eligible for Self Certification. Eligible for instant approval via OBPS."
    else:
        scs_message = "Not eligible for Self Certification until all compliance violations are corrected."

    scs_table = Table(
        [[Paragraph(scs_message, normal_style)]],
        colWidths=[160 * mm],
    )

    scs_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#e5e7eb")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))

    story.append(scs_table)

    # Footer
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        f"Generated by VAASTU AI Auto-DCR Engine on {datetime.now().strftime('%d-%m-%Y %H:%M')}",
        normal_style
    ))

    doc.build(story)

    return {
        "applicationNo": app_no,
        "pdfPath": output_path,
        "status": status_text,
        "isCompliant": is_compliant,
    }
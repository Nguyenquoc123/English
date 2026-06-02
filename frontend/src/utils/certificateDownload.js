import certificateTemplate from "../assets/chungchi.png";

/**
 * Tọa độ theo % kích thước ảnh mẫu chungchi.png.
 * Mẫu đã in sẵn "Ngày cấp:" / "Mã chứng chỉ:" — chỉ vẽ phần giá trị lên dòng trống.
 */
const LAYOUT = {
  studentNameY: 0.408,
  courseStartY: 0.552,
  courseLineHeight: 0.031,
  /** Y của đường gạch ngang (dùng baseline bottom để chữ nằm trên vạch) */
  metadataLineY: 0.66,
  dateValueX: 0.32,
  codeValueX: 0.638,
};

function drawCenteredText(ctx, text, centerX, y, font, color = "#1a2f4d") {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, centerX, y);
  ctx.restore();
}

/** Vẽ giá trị nằm trên vạch ngang (mẫu đã có nhãn bên trái) */
function drawValueOnLine(ctx, text, x, lineY, font, color = "#1a2f4d") {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, x, lineY);
  ctx.restore();
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.length ? lines : [text];
}

export function formatCertificateDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function renderCertificateToCanvas({
  studentName,
  courseTitle,
  issueDate,
  certificateCode,
}) {
  const img = new Image();
  img.src = certificateTemplate;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const w = canvas.width;
  const h = canvas.height;
  const centerX = w / 2;

  const safeName = studentName?.trim() || "Họ và tên học viên";
  drawCenteredText(
    ctx,
    safeName,
    centerX,
    h * LAYOUT.studentNameY,
    `700 ${Math.round(h * 0.038)}px "Be Vietnam Pro", Georgia, serif`,
    "#1a2f4d",
  );

  const courseFont = `600 ${Math.round(h * 0.028)}px "Be Vietnam Pro", Georgia, serif`;
  ctx.font = courseFont;
  const safeCourseTitle = courseTitle?.trim() || "Tên khóa học";
  const courseLines = wrapLines(ctx, safeCourseTitle, w * 0.7);
  const lineHeight = h * LAYOUT.courseLineHeight;
  const courseBlockHeight = (courseLines.length - 1) * lineHeight;
  const courseStartY = h * LAYOUT.courseStartY - courseBlockHeight / 2;

  courseLines.forEach((line, index) => {
    drawCenteredText(
      ctx,
      line,
      centerX,
      courseStartY + index * lineHeight,
      courseFont,
      "#243b53",
    );
  });

  const metaFont = `500 ${Math.round(h * 0.021)}px "Be Vietnam Pro", Arial, sans-serif`;
  const lineY = h * LAYOUT.metadataLineY;
  const dateText = formatCertificateDate(issueDate);
  const codeText = (certificateCode || "").trim();

  drawValueOnLine(ctx, dateText, w * LAYOUT.dateValueX, lineY, metaFont);

  drawValueOnLine(ctx, codeText, w * LAYOUT.codeValueX, lineY, metaFont);

  return canvas;
}

export async function downloadCertificatePng(certificate) {
  const canvas = await renderCertificateToCanvas({
    studentName: certificate.studentNameOnCertificate,
    courseTitle: certificate.courseTitle,
    issueDate: certificate.issuedAt,
    certificateCode: certificate.certificateCode,
  });

  const link = document.createElement("a");
  link.download = `chung-chi-${certificate.certificateCode}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export { certificateTemplate };
